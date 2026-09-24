import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { openDatabase, migrate } from "../packages/database/index";
import { hashToken } from "../packages/domain/identity";
import {
  seal,
  allowedLineEventSource,
  allowedLineProject,
} from "../packages/domain/line-payload";
import { processLineEvent, deliverLine } from "../apps/api/src/line";
import { buildApp } from "../apps/api/src/app";

test("bounded LINE pilot: source revocation, project isolation and disabled worker", async (t) => {
  const names = [
    "LINE_ENABLED",
    "LINE_PAYLOAD_KEY",
    "LINE_TEST_USER_IDS",
    "LINE_TEST_GROUP_IDS",
    "LINE_TEST_PROJECT_IDS",
  ];
  const saved = names.map((name) => process.env[name]);
  const db = await openDatabase(process.env.TEST_DATABASE_URL, "memory://");
  await migrate(db);
  const owner = randomUUID(),
    customer = randomUUID(),
    pilot = randomUUID(),
    outside = randomUUID();
  const lineUser = randomUUID(),
    group = randomUUID(),
    sid = randomUUID();
  process.env.LINE_ENABLED = "true";
  process.env.LINE_PAYLOAD_KEY = Buffer.alloc(32, 19).toString("base64");
  process.env.LINE_TEST_USER_IDS = lineUser;
  process.env.LINE_TEST_GROUP_IDS = group;
  process.env.LINE_TEST_PROJECT_IDS = pilot;
  await db.query(
    "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,$2,'Pilot fixture','not-a-login-hash','OWNER')",
    [owner, owner],
  );
  await db.query(
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 hour')",
    [hashToken(sid), owner],
  );
  await db.query(
    "INSERT INTO customers(id,code,name,created_by) VALUES($1,$2,'Pilot fixture',$3)",
    [customer, customer, owner],
  );
  for (const [id, name] of [
    [pilot, "Synthetic allowed"],
    [outside, "Synthetic excluded"],
  ])
    await db.query(
      "INSERT INTO projects(id,code,name,customer_id,created_by) VALUES($1,$2,$3,$4,$5)",
      [id, id, name, customer, owner],
    );
  const app = await buildApp(db);
  const headers = { cookie: `sid=${sid}`, origin: "http://127.0.0.1:3000" };
  const enqueue = async (event: object) => {
    const id = randomUUID();
    await db.query("INSERT INTO line_event_inbox(id,payload) VALUES($1,$2)", [
      id,
      JSON.stringify(seal(event)),
    ]);
    return id;
  };
  const message = (text: string, inGroup = false) => ({
    type: "message",
    source: {
      type: inGroup ? "group" : "user",
      userId: lineUser,
      ...(inGroup ? { groupId: group } : {}),
    },
    message: { type: "text", text },
    replyToken: "synthetic-reply",
  });
  const replies: string[] = [];
  const transport = {
    linkToken: async () => "synthetic-link",
    reply: async (_: string, text: string) => {
      replies.push(text);
    },
  };
  const deliver = () => deliverLine(db, transport, "https://test.invalid");
  try {
    await t.test(
      "source shape and empty/wildcard project scope fail closed",
      () => {
        assert.equal(
          allowedLineEventSource({ type: "group", userId: lineUser }),
          false,
        );
        assert.equal(
          allowedLineEventSource({ type: "room", userId: lineUser }),
          false,
        );
        assert.equal(
          allowedLineEventSource({
            type: "user",
            userId: lineUser,
            groupId: group,
          }),
          false,
        );
        for (const value of ["", " , ", "*"]) {
          process.env.LINE_TEST_PROJECT_IDS = value;
          assert.equal(allowedLineProject(pilot), false);
        }
        process.env.LINE_TEST_PROJECT_IDS = pilot;
      },
    );
    await t.test(
      "revoked source cannot consume nonce or create link from queued event",
      async () => {
        const nonce = randomUUID();
        await db.query(
          "INSERT INTO line_link_nonces(nonce_hash,user_id,expires_at) VALUES($1,$2,now()+interval '10 minutes')",
          [hashToken(nonce), owner],
        );
        const id = await enqueue({
          type: "accountLink",
          source: { type: "user", userId: lineUser },
          link: { result: "ok", nonce },
        });
        process.env.LINE_TEST_USER_IDS = "";
        await processLineEvent(db);
        assert.equal(
          (
            await db.query("SELECT * FROM line_accounts WHERE user_id=$1", [
              owner,
            ])
          ).rows.length,
          0,
        );
        assert.equal(
          (
            await db.query(
              "SELECT * FROM line_link_nonces WHERE nonce_hash=$1",
              [hashToken(nonce)],
            )
          ).rows.length,
          1,
        );
        assert.deepEqual(
          (
            await db.query(
              "SELECT state,payload FROM line_event_inbox WHERE id=$1",
              [id],
            )
          ).rows[0],
          { state: "DONE", payload: {} },
        );
        process.env.LINE_TEST_USER_IDS = lineUser;
        await db.query(
          "INSERT INTO line_accounts(line_user_id,user_id) VALUES($1,$2)",
          [lineUser, owner],
        );
      },
    );
    await t.test(
      "OWNER normal scope cannot leak excluded projects into LINE",
      async () => {
        const projects = await app.inject({
          method: "GET",
          url: "/api/projects",
          headers,
        });
        assert.equal(projects.statusCode, 200);
        assert.match(projects.body, /Synthetic excluded/);
        await enqueue(message("งานของฉัน"));
        await processLineEvent(db);
        await deliver();
        assert.match(replies.at(-1)!, /Synthetic allowed/);
        assert.doesNotMatch(replies.at(-1)!, /Synthetic excluded/);
        await enqueue(message("งานของฉัน"));
        await processLineEvent(db);
        process.env.LINE_TEST_PROJECT_IDS = "";
        await deliver();
        assert.equal(replies.at(-1), "ยังไม่มีโครงการที่ได้รับมอบหมาย");
        process.env.LINE_TEST_PROJECT_IDS = pilot;
      },
    );
    await t.test(
      "binding denied outside pilot and rechecked when queued",
      async () => {
        const count = async () =>
          Number(
            (
              await db.query(
                "SELECT count(*) n FROM line_binding_codes WHERE created_by=$1",
                [owner],
              )
            ).rows[0].n,
          );
        const before = await count();
        const denied = await app.inject({
          method: "POST",
          url: `/api/projects/${outside}/line-code`,
          headers,
        });
        assert.equal(denied.statusCode, 404);
        assert.equal(await count(), before);
        const result = await app.inject({
          method: "POST",
          url: `/api/projects/${pilot}/line-code`,
          headers,
        });
        assert.equal(result.statusCode, 200);
        await enqueue(message(result.json().command, true));
        process.env.LINE_TEST_PROJECT_IDS = "";
        await processLineEvent(db);
        await deliver();
        assert.equal(
          (
            await db.query(
              "SELECT * FROM line_group_bindings WHERE group_id=$1",
              [group],
            )
          ).rows.length,
          0,
        );
        assert.equal(await count(), before + 1);
        process.env.LINE_TEST_PROJECT_IDS = pilot;
      },
    );
    await t.test(
      "disabled worker leaves queues untouched; revoked recipient cancels delivery",
      async () => {
        const id = await enqueue(message("งานของฉัน"));
        process.env.LINE_ENABLED = "false";
        assert.equal(await processLineEvent(db), false);
        assert.equal(
          (
            await db.query("SELECT state FROM line_event_inbox WHERE id=$1", [
              id,
            ])
          ).rows[0].state,
          "RECEIVED",
        );
        process.env.LINE_ENABLED = "true";
        await processLineEvent(db);
        const before = replies.length;
        process.env.LINE_ENABLED = "false";
        assert.equal(await deliver(), false);
        assert.equal(replies.length, before);
        process.env.LINE_ENABLED = "true";
        process.env.LINE_TEST_USER_IDS = "";
        await deliver();
        assert.equal(replies.length, before);
        assert.deepEqual(
          (
            await db.query(
              "SELECT state,payload FROM notification_outbox WHERE event_id=$1",
              [id],
            )
          ).rows[0],
          { state: "CANCELLED", payload: {} },
        );
      },
    );
  } finally {
    await app.close();
    await db.close();
    names.forEach((name, i) => {
      if (saved[i] === undefined) delete process.env[name];
      else process.env[name] = saved[i];
    });
  }
});
