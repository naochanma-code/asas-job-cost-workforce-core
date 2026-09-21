import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { openDatabase, migrate } from "../packages/database/index";
import { passwordHash, hashToken } from "../packages/domain/identity";
import { buildApp } from "../apps/api/src/app";
import { processLineEvent, deliverLine } from "../apps/api/src/line";
import { seal } from "../packages/domain/line-payload";

// TEST_DATABASE_URL must be an EMPTY disposable database; never use DATABASE_URL.
test("Foundation: real sessions, database constraints, scope and durable LINE contracts", async (t) => {
  const db = await openDatabase(process.env.TEST_DATABASE_URL, "memory://");
  await migrate(db);
  await migrate(db);
  const owner = randomUUID(),
    password = "Synthetic-test-only-2026!";
  await db.query(
    "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,$2,$3,$4,$5)",
    [
      owner,
      "test-owner",
      "Owner fixture",
      await passwordHash(password),
      "OWNER",
    ],
  );
  const app = await buildApp(db);
  await app.ready();
  const cookies: Record<string, string> = {};
  let requestNo = 0;
  const req = async (role: string, method: any, url: string, payload?: any) =>
    app.inject({
      method,
      url,
      headers: {
        origin: "http://127.0.0.1:3000",
        ...(cookies[role] ? { cookie: cookies[role] } : {}),
      },
      payload,
      remoteAddress:
        "127.1." + Math.floor(++requestNo / 250) + "." + (requestNo % 250),
    });
  const ok = async (role: string, method: any, url: string, payload?: any) => {
    const r = await req(role, method, url, payload);
    assert.equal(r.statusCode, 200, r.body);
    return r.json();
  };
  const login = async (role: string, username: string) => {
    const r = await req("", "POST", "/api/login", { username, password });
    assert.equal(r.statusCode, 200, r.body);
    cookies[role] = String(r.headers["set-cookie"]).split(";")[0];
    assert.match(String(r.headers["set-cookie"]), /HttpOnly/i);
    assert.match(String(r.headers["set-cookie"]), /SameSite=Strict/i);
  };
  const users: Record<string, any> = {};
  let customer: string, a: string, b: string, job: string, assignment: string;
  try {
    await t.test(
      "authentication, CSRF, forged role and session expiry",
      async () => {
        assert.equal((await req("", "GET", "/api/projects")).statusCode, 401);
        assert.equal(
          (
            await app.inject({
              method: "POST",
              url: "/api/login",
              payload: { username: "test-owner", password },
            })
          ).statusCode,
          403,
        );
        assert.equal(
          (
            await req("", "POST", "/api/login", {
              username: "test-owner",
              password: "wrong-password-123",
            })
          ).statusCode,
          401,
        );
        await login("owner", "test-owner");
        assert.equal((await ok("owner", "GET", "/api/me")).role, "OWNER");
        assert.equal(
          (
            await app.inject({
              method: "GET",
              url: "/api/me",
              headers: { cookie: "sid=OWNER; role=OWNER" },
            })
          ).statusCode,
          401,
        );
        await db.query(
          "UPDATE sessions SET expires_at=now()-interval '1 second'",
        );
        assert.equal((await req("owner", "GET", "/api/me")).statusCode, 401);
        await login("owner", "test-owner");
      },
    );
    await t.test(
      "multiple Owners; only Owner creates accounts; no secrets in API",
      async () => {
        for (const role of [
          "ADMIN",
          "PM",
          "TECH",
          "TECH2",
          "OWNER2",
          "OWNER3",
        ]) {
          const r = await ok("owner", "POST", "/api/users", {
            username: "test-" + role.toLowerCase(),
            password,
            display_name: role + " fixture",
            role: role.replace(/[23]/g, ""),
          });
          users[role] = { id: r.id };
          await login(role, "test-" + role.toLowerCase());
        }
        assert.equal(
          (
            await req("ADMIN", "POST", "/api/users", {
              username: "unauthorized",
              password,
              display_name: "bad",
              role: "OWNER",
            })
          ).statusCode,
          403,
        );
        const rows = await ok("ADMIN", "GET", "/api/users");
        for (const r of rows) {
          if (users[r.display_name.split(" ")[0]])
            Object.assign(users[r.display_name.split(" ")[0]], r);
          assert.equal("password_hash" in r, false);
        }
        assert.equal((await req("PM", "GET", "/api/users")).statusCode, 403);
        await ok("OWNER2", "POST", "/api/customers", {
          name: "Owner two fixture",
        });
        await ok("OWNER3", "POST", "/api/customers", {
          name: "Owner three fixture",
        });
        const actors = (
          await db.query(
            "SELECT DISTINCT actor_id FROM audit_logs WHERE action='CUSTOMER_CREATED'",
          )
        ).rows.map((r) => r.actor_id);
        assert.ok(actors.includes(users.OWNER2.id));
        assert.ok(actors.includes(users.OWNER3.id));
      },
    );
    await t.test(
      "Project without Site/Job; assignment null; duplicate rollback",
      async () => {
        customer = (
          await ok("ADMIN", "POST", "/api/customers", {
            name: "Synthetic customer",
          })
        ).id;
        a = (
          await ok("ADMIN", "POST", "/api/projects", {
            name: "Project A no job",
            customer_id: customer,
          })
        ).id;
        const p = await ok("ADMIN", "GET", "/api/projects/" + a);
        assert.equal(p.site_id, null);
        assert.deepEqual(p.jobs, []);
        assignment = (
          await ok("ADMIN", "POST", `/api/projects/${a}/assignments`, {
            employee_id: users.TECH.employee_id,
          })
        ).id;
        const before = (await db.query("SELECT count(*) FROM audit_logs"))
          .rows[0].count;
        assert.equal(
          (
            await req("ADMIN", "POST", `/api/projects/${a}/assignments`, {
              employee_id: users.TECH.employee_id,
            })
          ).statusCode,
          409,
        );
        assert.equal(
          (await db.query("SELECT count(*) FROM audit_logs")).rows[0].count,
          before,
        );
        assert.equal((await ok("TECH", "GET", "/api/projects"))[0].id, a);
        assert.deepEqual(await ok("TECH2", "GET", "/api/projects"), []);
        assert.equal(
          (await req("TECH2", "GET", "/api/projects/" + a)).statusCode,
          404,
        );
      },
    );
    await t.test(
      "optional Site/Job enforce same customer and project",
      async () => {
        const other = (
          await ok("ADMIN", "POST", "/api/customers", { name: "Other fixture" })
        ).id;
        const site = (
          await ok("ADMIN", "POST", "/api/sites", {
            customer_id: other,
            name: "Other site",
          })
        ).id;
        assert.equal(
          (
            await req("ADMIN", "POST", "/api/projects", {
              name: "Invalid site",
              customer_id: customer,
              site_id: site,
            })
          ).statusCode,
          409,
        );
        b = (
          await ok("ADMIN", "POST", "/api/projects", {
            name: "Project B",
            customer_id: other,
            site_id: site,
          })
        ).id;
        job = (
          await ok("ADMIN", "POST", `/api/projects/${b}/jobs`, {
            name: "B subtask",
          })
        ).id;
        assert.equal(
          (
            await req("ADMIN", "POST", `/api/projects/${a}/assignments`, {
              employee_id: users.TECH2.employee_id,
              job_id: job,
            })
          ).statusCode,
          409,
        );
        await ok("ADMIN", "POST", `/api/projects/${b}/assignments`, {
          employee_id: users.TECH2.employee_id,
          job_id: job,
        });
      },
    );
    await t.test(
      "PM scope, optimistic edit and immediate membership removal",
      async () => {
        await ok("ADMIN", "POST", `/api/projects/${b}/pm`, {
          user_id: users.PM.id,
          active: true,
        });
        assert.equal(
          (await req("PM", "GET", "/api/projects/" + a)).statusCode,
          404,
        );
        await ok("PM", "PATCH", "/api/projects/" + b, {
          name: "Project B revised",
          status: "ACTIVE",
          version: 1,
        });
        assert.equal(
          (
            await req("PM", "PATCH", "/api/projects/" + b, {
              name: "Lost update",
              status: "ACTIVE",
              version: 1,
            })
          ).statusCode,
          409,
        );
        assert.equal(
          (
            await req("TECH2", "PATCH", "/api/projects/" + b, {
              name: "Forbidden",
              status: "ACTIVE",
              version: 2,
            })
          ).statusCode,
          403,
        );
        await ok("ADMIN", "POST", `/api/projects/${b}/pm`, {
          user_id: users.PM.id,
          active: false,
        });
        assert.equal(
          (await req("PM", "GET", "/api/projects/" + b)).statusCode,
          404,
        );
        const data = JSON.stringify(await ok("ADMIN", "GET", "/api/projects"));
        assert.doesNotMatch(data, /payroll|wage|amount|total|password|token/i);
      },
    );
    await t.test(
      "signed raw webhook, destination, duplicate delivery and one-use link nonce",
      async () => {
        process.env.LINE_ENABLED = "true";
        process.env.LINE_CHANNEL_SECRET = "synthetic-channel-secret";
        process.env.LINE_BOT_ID = "synthetic-bot";
        process.env.LINE_PAYLOAD_KEY = Buffer.alloc(32, 7).toString("base64");
        process.env.LINE_TEST_USER_IDS = "line-tech,line-admin";
        process.env.LINE_TEST_GROUP_IDS = "group-1,group-2,group-3";
        const linked = await ok("TECH", "POST", "/api/line/link", {
          linkToken: "synthetic-link-token",
        });
        const nonce = new URL(linked.url).searchParams.get("nonce");
        const raw = JSON.stringify({
          destination: "synthetic-bot",
          events: [
            {
              webhookEventId: "link-event",
              type: "accountLink",
              source: { type: "user", userId: "line-tech" },
              link: { result: "ok", nonce },
            },
          ],
        });
        const signature = createHmac("sha256", process.env.LINE_CHANNEL_SECRET)
          .update(raw)
          .digest("base64");
        assert.equal(
          (
            await app.inject({
              method: "POST",
              url: "/api/line/webhook",
              headers: {
                "content-type": "application/json",
                "x-line-signature": "bad",
              },
              payload: raw,
            })
          ).statusCode,
          401,
        );
        for (let n = 0; n < 2; n++)
          assert.equal(
            (
              await app.inject({
                method: "POST",
                url: "/api/line/webhook",
                headers: {
                  "content-type": "application/json",
                  "x-line-signature": signature,
                },
                payload: raw,
              })
            ).statusCode,
            200,
          );
        assert.equal(
          (await db.query("SELECT count(*)::int n FROM line_event_inbox"))
            .rows[0].n,
          1,
        );
        assert.doesNotMatch(
          JSON.stringify(
            (await db.query("SELECT payload FROM line_event_inbox")).rows,
          ),
          /synthetic-reply|line-tech|accountLink/,
        );
        const outside = raw
          .replace("link-event", "outside-event")
          .replace("line-tech", "outside-pilot");
        assert.equal(
          (
            await app.inject({
              method: "POST",
              url: "/api/line/webhook",
              headers: {
                "content-type": "application/json",
                "x-line-signature": createHmac(
                  "sha256",
                  process.env.LINE_CHANNEL_SECRET,
                )
                  .update(outside)
                  .digest("base64"),
              },
              payload: outside,
            })
          ).statusCode,
          200,
        );
        assert.equal(
          (await db.query("SELECT count(*)::int n FROM line_event_inbox"))
            .rows[0].n,
          1,
        );
        await processLineEvent(db);
        assert.equal(
          (await db.query("SELECT user_id FROM line_accounts")).rows[0].user_id,
          users.TECH.id,
        );
        assert.equal(
          (await db.query("SELECT * FROM line_link_nonces")).rows.length,
          0,
        );
        await db.query(
          "INSERT INTO line_event_inbox(id,payload) VALUES($1,$2)",
          [
            "nonce-replay",
            JSON.stringify(
              seal({
                ...JSON.parse(raw).events[0],
                webhookEventId: "nonce-replay",
                source: { type: "user", userId: "line-admin" },
              }),
            ),
          ],
        );
        await processLineEvent(db);
        assert.equal(
          (await db.query("SELECT * FROM line_accounts")).rows.length,
          1,
        );
        const expiredLink = await ok("TECH2", "POST", "/api/line/link", {
          linkToken: "synthetic-expired-link",
        });
        await db.query(
          "UPDATE line_link_nonces SET expires_at=now()-interval '1 minute'",
        );
        await db.query(
          "INSERT INTO line_event_inbox(id,payload) VALUES($1,$2)",
          [
            "nonce-expired",
            JSON.stringify(
              seal({
                webhookEventId: "nonce-expired",
                type: "accountLink",
                source: { type: "user", userId: "line-admin" },
                link: {
                  result: "ok",
                  nonce: new URL(expiredLink.url).searchParams.get("nonce"),
                },
              }),
            ),
          ],
        );
        await processLineEvent(db);
        assert.equal(
          (await db.query("SELECT * FROM line_accounts")).rows.length,
          1,
        );
        const wrong = raw.replace("synthetic-bot", "wrong-bot");
        assert.equal(
          (
            await app.inject({
              method: "POST",
              url: "/api/line/webhook",
              headers: {
                "content-type": "application/json",
                "x-line-signature": createHmac(
                  "sha256",
                  process.env.LINE_CHANNEL_SECRET,
                )
                  .update(wrong)
                  .digest("base64"),
              },
              payload: wrong,
            })
          ).statusCode,
          400,
        );
      },
    );
    const enqueue = async (
      id: string,
      lineUser: string,
      text: string,
      type = "user",
      groupId?: string,
    ) =>
      db.query("INSERT INTO line_event_inbox(id,payload) VALUES($1,$2)", [
        id,
        JSON.stringify(
          seal({
            webhookEventId: id,
            type: "message",
            source: { type, userId: lineUser, groupId },
            message: { type: "text", text },
            replyToken: "synthetic-reply",
          }),
        ),
      ]);
    await t.test(
      "outbox rechecks assignment at delivery; retries and expired lease recover",
      async () => {
        await enqueue("jobs-event", "line-tech", "งานของฉัน");
        await processLineEvent(db);
        await ok("ADMIN", "DELETE", "/api/assignments/" + assignment);
        assert.equal(
          (await req("TECH", "GET", "/api/projects/" + a)).statusCode,
          404,
        );
        const replies: string[] = [];
        const transport = {
          linkToken: async () => "",
          reply: async (_: string, text: string) => {
            replies.push(text);
          },
        };
        await deliverLine(
          db,
          {
            ...transport,
            reply: async () => {
              throw Error("Synthetic failure");
            },
          },
          "https://test.invalid",
        );
        assert.equal(
          (
            await db.query(
              "SELECT state FROM notification_outbox WHERE event_id='jobs-event'",
            )
          ).rows[0].state,
          "RETRY",
        );
        await db.query(
          "UPDATE notification_outbox SET state='SENDING',lease_until=now()-interval '1 minute'",
        );
        await deliverLine(db, transport, "https://test.invalid");
        assert.equal(replies[0], "ยังไม่มีโครงการที่ได้รับมอบหมาย");
        assert.equal(
          await deliverLine(db, transport, "https://test.invalid"),
          false,
        );
      },
    );
    await t.test(
      "group code owner, expiration, replay; group replies have no project details",
      async () => {
        await db.query(
          "INSERT INTO line_accounts(line_user_id,user_id) VALUES($1,$2)",
          ["line-admin", users.ADMIN.id],
        );
        const code = await ok("ADMIN", "POST", `/api/projects/${a}/line-code`);
        await enqueue(
          "bad-bind",
          "line-tech",
          code.command,
          "group",
          "group-1",
        );
        await processLineEvent(db);
        assert.equal(
          (await db.query("SELECT * FROM line_group_bindings")).rows.length,
          0,
        );
        await enqueue(
          "good-bind",
          "line-admin",
          code.command,
          "group",
          "group-1",
        );
        await processLineEvent(db);
        await enqueue(
          "replay-bind",
          "line-admin",
          code.command,
          "group",
          "group-2",
        );
        await processLineEvent(db);
        assert.equal(
          (await db.query("SELECT * FROM line_group_bindings")).rows.length,
          1,
        );
        const expired = await ok(
          "ADMIN",
          "POST",
          `/api/projects/${b}/line-code`,
        );
        await db.query(
          "UPDATE line_binding_codes SET expires_at=now()-interval '1 minute'",
        );
        await enqueue(
          "expired-bind",
          "line-admin",
          expired.command,
          "group",
          "group-3",
        );
        await processLineEvent(db);
        assert.equal(
          (await db.query("SELECT * FROM line_group_bindings")).rows.length,
          1,
        );
        const replies: string[] = [];
        while (
          await deliverLine(
            db,
            {
              linkToken: async () => "",
              reply: async (_, text) => {
                replies.push(text);
              },
            },
            "https://test.invalid",
          )
        ) {}
        assert.equal(replies.length, 4);
        for (const text of replies)
          assert.doesNotMatch(text, /Project|fixture|บาท|payroll/i);
      },
    );
    await t.test(
      "unlink, deactivate and logout immediately revoke access; health",
      async () => {
        await ok("TECH", "DELETE", "/api/line/link");
        assert.equal(
          (
            await db.query(
              "SELECT * FROM line_accounts WHERE line_user_id='line-tech'",
            )
          ).rows.length,
          0,
        );
        await ok("owner", "PATCH", "/api/users/" + users.TECH.id, {
          active: false,
        });
        assert.equal((await req("TECH", "GET", "/api/me")).statusCode, 401);
        await ok("ADMIN", "POST", "/api/logout");
        assert.equal((await req("ADMIN", "GET", "/api/me")).statusCode, 401);
        assert.equal((await ok("", "GET", "/api/health")).database, "ready");
      },
    );
  } finally {
    await app.close();
    await db.close();
    delete process.env.LINE_ENABLED;
    delete process.env.LINE_CHANNEL_SECRET;
    delete process.env.LINE_BOT_ID;
    delete process.env.LINE_PAYLOAD_KEY;
    delete process.env.LINE_TEST_USER_IDS;
    delete process.env.LINE_TEST_GROUP_IDS;
  }
});
