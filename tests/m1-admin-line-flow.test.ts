import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { openDatabase, migrate } from "../packages/database/index";
import { hashToken } from "../packages/domain/identity";
import { seal } from "../packages/domain/line-payload";
import { buildApp } from "../apps/api/src/app";
import { processLineEvent, deliverLine } from "../apps/api/src/line";

test("Admin creates a project without Site or Job, assigns TECH, and fake LINE shows that project", async () => {
  const names = [
    "LINE_ENABLED",
    "LINE_ENROLLMENT_ENABLED",
    "LINE_PAYLOAD_KEY",
    "LINE_TEST_USER_IDS",
    "LINE_TEST_GROUP_IDS",
    "LINE_TEST_PROJECT_IDS",
  ] as const;
  const saved = names.map((name) => process.env[name]);
  const db = await openDatabase(process.env.TEST_DATABASE_URL, "memory://");
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;
  try {
    await migrate(db);
    const admin = randomUUID();
    const tech = randomUUID();
    const employee = randomUUID();
    const session = randomUUID();
    const lineUser = "synthetic-" + randomUUID();
    await db.query(
      "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,$2,'Synthetic Admin','fixture','ADMIN'),($3,$4,'Synthetic TECH','fixture','TECH')",
      [admin, "admin-" + admin, tech, "tech-" + tech],
    );
    await db.query(
      "INSERT INTO employees(id,user_id,code,display_name) VALUES($1,$2,$3,'Synthetic TECH')",
      [employee, tech, "EMP-" + employee],
    );
    await db.query(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 hour')",
      [hashToken(session), admin],
    );
    const headers = {
      origin: "http://127.0.0.1:3000",
      cookie: "sid=" + session,
    };
    app = await buildApp(db);
    await app.ready();
    const post = async (url: string, payload: object) => {
      const response = await app!.inject({ method: "POST", url, headers, payload });
      assert.equal(response.statusCode, 200, response.body);
      return response.json();
    };
    const customer = await post("/api/customers", { name: "Synthetic customer" });
    const project = await post("/api/projects", {
      customer_id: customer.id,
      name: "Synthetic assigned no-job project",
    });
    const hidden = await post("/api/projects", {
      customer_id: customer.id,
      name: "Synthetic unassigned project",
    });
    const detail = await app.inject({
      method: "GET",
      url: "/api/projects/" + project.id,
      headers,
    });
    assert.equal(detail.statusCode, 200, detail.body);
    assert.equal(detail.json().site_id, null);
    assert.deepEqual(detail.json().jobs, []);
    const assignment = await post(`/api/projects/${project.id}/assignments`, {
      employee_id: employee,
    });
    const audit = await db.query(
      "SELECT action,actor_id FROM audit_logs WHERE entity_id IN ($1,$2) ORDER BY action",
      [project.id, assignment.id],
    );
    assert.deepEqual(
      audit.rows.map((row) => [row.action, row.actor_id]),
      [
        ["ASSIGNED", admin],
        ["PROJECT_CREATED", admin],
      ],
    );
    await db.query(
      "INSERT INTO line_accounts(line_user_id,user_id) VALUES($1,$2)",
      [lineUser, tech],
    );
    process.env.LINE_ENABLED = "true";
    process.env.LINE_ENROLLMENT_ENABLED = "false";
    process.env.LINE_PAYLOAD_KEY = Buffer.alloc(32, 31).toString("base64");
    process.env.LINE_TEST_USER_IDS = lineUser;
    process.env.LINE_TEST_GROUP_IDS = "";
    process.env.LINE_TEST_PROJECT_IDS = [project.id, hidden.id].join(",");
    const eventId = randomUUID();
    await db.query("INSERT INTO line_event_inbox(id,payload) VALUES($1,$2)", [
      eventId,
      JSON.stringify(
        seal({
          webhookEventId: eventId,
          type: "message",
          source: { type: "user", userId: lineUser },
          message: { type: "text", text: "งานของฉัน" },
          replyToken: "synthetic-reply",
        }),
      ),
    ]);
    assert.equal(await processLineEvent(db), true);
    const replies: string[] = [];
    assert.equal(
      await deliverLine(
        db,
        {
          linkToken: async () => {
            throw Error("Unexpected link request");
          },
          reply: async (_token, text) => {
            replies.push(text);
          },
        },
        "https://test.invalid",
      ),
      true,
    );
    assert.deepEqual(replies, [project.code + " · Synthetic assigned no-job project"]);
    assert.doesNotMatch(replies[0], /Synthetic unassigned project/);
    assert.equal(
      (await db.query("SELECT state FROM notification_outbox WHERE event_id=$1", [eventId]))
        .rows[0].state,
      "SENT",
    );
  } finally {
    await app?.close();
    await db.close();
    names.forEach((name, index) => {
      if (saved[index] === undefined) delete process.env[name];
      else process.env[name] = saved[index];
    });
  }
});
