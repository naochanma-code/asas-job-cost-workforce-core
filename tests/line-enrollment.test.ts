import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { LineEnrollment } from "../packages/domain/line-enrollment";
import { openDatabase, migrate } from "../packages/database/index";
import { hashToken } from "../packages/domain/identity";
import { buildApp } from "../apps/api/src/app";

const user = (n: number) => "U" + String(n).repeat(32);
const group = "C" + "1".repeat(32);
const event = (text: string, id = user(1), groupId?: string) => ({
  webhookEventId: randomUUID(),
  type: "message",
  source: {
    type: groupId ? "group" : "user",
    userId: id,
    ...(groupId ? { groupId } : {}),
  },
  message: { type: "text", text },
  replyToken: "synthetic-reply",
});

test("enrollment invitations are bounded, one-use, creator-private, expire and disappear on restart", () => {
  let now = 0;
  const session = new LineEnrollment(() => now);
  const start = session.start("owner")!;
  assert.equal(start.invitations.length, 4);
  assert.equal(session.start("other"), undefined);
  assert.equal(session.result("other"), undefined);
  session.capture(event(start.invitations[3].command, user(1), group));
  assert.equal(session.result("owner")!.groupIds.length, 0);
  session.capture(event("ลงทะเบียนทดลอง " + "x".repeat(32)));
  assert.equal(session.result("owner")!.userIds.length, 0);
  session.capture(event(start.invitations[0].command));
  session.capture(event(start.invitations[0].command, user(2)));
  session.capture(event(start.invitations[1].command, user(1)));
  assert.deepEqual(session.result("owner")!.userIds, [user(1)]);
  session.capture(event(start.invitations[1].command, user(2)));
  session.capture(event(start.invitations[2].command, user(3)));
  session.capture(event(start.invitations[3].command, user(1), group));
  assert.equal(session.result("owner")!.complete, true);
  assert.deepEqual(session.result("owner")!.groupIds, [group]);
  assert.doesNotMatch(
    JSON.stringify(session.result("owner")),
    /command|hash|replyToken/,
  );
  assert.equal(new LineEnrollment(() => now).result("owner"), undefined);
  now = 15 * 60 * 1000;
  assert.equal(session.result("owner"), undefined);
  const second = session.start("owner")!;
  assert.notEqual(second.invitations[0].command, start.invitations[0].command);
  session.capture(event(start.invitations[0].command));
  assert.equal(session.result("owner")!.userIds.length, 0);
});

test("bare enrollment codes support private/group slots without weakening invitation checks", () => {
  let now = 0;
  const session = new LineEnrollment(() => now);
  const started = session.start("owner")!;
  const codes = started.invitations.map((i) => i.command.split(" ")[1]);
  for (const invalid of [
    "hello " + codes[0],
    codes[0] + " extra",
    codes[0] + codes[1],
    codes[0].slice(1),
    "x".repeat(32),
  ])
    session.capture(event(invalid));
  assert.equal(session.result("owner")!.userIds.length, 0);
  session.capture(event(codes[3], user(1), group));
  session.capture(event(codes[0], user(1), group));
  assert.equal(session.result("owner")!.userIds.length, 0);
  assert.equal(session.result("owner")!.groupIds.length, 0);
  session.capture(event("  " + codes[0] + "\n"));
  assert.deepEqual(session.result("owner")!.userIds, [user(1)]);
  session.capture(event(codes[0], user(2)));
  session.capture(event(codes[1], user(1)));
  assert.equal(session.result("owner")!.userIds.length, 1);
  session.capture(event(started.invitations[1].command, user(2)));
  session.capture(event(codes[2], user(3)));
  session.capture(event(codes[3], user(1), group));
  assert.equal(session.result("owner")!.complete, true);
  now = 15 * 60 * 1000;
  session.start("owner");
  session.capture(event(codes[0]));
  assert.equal(session.result("owner")!.userIds.length, 0);
});

test("signed enrollment is OWNER-only and cannot queue/link/send business LINE", async () => {
  const names = [
    "LINE_ENABLED",
    "LINE_ENROLLMENT_ENABLED",
    "LINE_CHANNEL_SECRET",
    "LINE_BOT_ID",
  ];
  const saved = names.map((n) => process.env[n]);
  const db = await openDatabase(process.env.TEST_DATABASE_URL, "memory://");
  await migrate(db);
  const app = await buildApp(db);
  const cookies: Record<string, string> = {};
  for (const role of ["OWNER", "ADMIN", "PM", "TECH"]) {
    const id = randomUUID(),
      sid = randomUUID();
    await db.query(
      "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,$2,'Enrollment fixture','not-a-login-hash',$3)",
      [id, id, role],
    );
    await db.query(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 hour')",
      [hashToken(sid), id],
    );
    cookies[role] = `sid=${sid}`;
  }
  const request = (role: string, method: "GET" | "POST", url: string) =>
    app.inject({
      method,
      url,
      headers: { cookie: cookies[role], origin: "http://127.0.0.1:3000" },
    });
  const counts = async () =>
    Promise.all(
      [
        "line_event_inbox",
        "notification_outbox",
        "line_accounts",
        "line_link_nonces",
        "line_group_bindings",
      ].map(async (table) =>
        Number((await db.query(`SELECT count(*) n FROM ${table}`)).rows[0].n),
      ),
    );
  try {
    process.env.LINE_ENABLED = "false";
    process.env.LINE_ENROLLMENT_ENABLED = "false";
    assert.equal(
      (await request("OWNER", "POST", "/api/line/enrollment/start")).statusCode,
      503,
    );
    process.env.LINE_ENROLLMENT_ENABLED = "true";
    process.env.LINE_CHANNEL_SECRET = "synthetic-enrollment-secret";
    process.env.LINE_BOT_ID = "synthetic-bot";
    for (const role of ["ADMIN", "PM", "TECH"])
      for (const [method, url] of [
        ["POST", "/api/line/enrollment/start"],
        ["GET", "/api/line/enrollment"],
      ] as const)
        assert.equal((await request(role, method, url)).statusCode, 403);
    const started = await request(
      "OWNER",
      "POST",
      "/api/line/enrollment/start",
    );
    assert.equal(started.statusCode, 200);
    assert.equal(started.headers["cache-control"], "no-store");
    const before = await counts();
    const raw = JSON.stringify({
      destination: "synthetic-bot",
      events: [event(started.json().invitations[0].command.split(" ")[1])],
    });
    const hook = (body: string, signature: string) =>
      app.inject({
        method: "POST",
        url: "/api/line/webhook",
        payload: body,
        headers: {
          "content-type": "application/json",
          "x-line-signature": signature,
        },
      });
    const sign = (body: string) =>
      createHmac("sha256", process.env.LINE_CHANNEL_SECRET!)
        .update(body)
        .digest("base64");
    assert.equal((await hook(raw, "bad")).statusCode, 401);
    assert.equal((await hook(raw + " ", sign(raw))).statusCode, 401);
    const wrong = raw.replace("synthetic-bot", "other-bot");
    assert.equal((await hook(wrong, sign(wrong))).statusCode, 400);
    assert.equal((await hook(raw, sign(raw))).statusCode, 200);
    assert.equal((await hook(raw, sign(raw))).statusCode, 200);
    const result = await request("OWNER", "GET", "/api/line/enrollment");
    assert.deepEqual(result.json().userIds, [user(1)]);
    assert.deepEqual(await counts(), before);
    assert.equal(
      (await request("OWNER", "POST", "/api/line/enrollment/start")).statusCode,
      409,
    );
    assert.equal(
      (await request("OWNER", "POST", "/api/line/link")).statusCode,
      503,
    );
    assert.equal(
      (await request("OWNER", "GET", "/api/me")).json().line_enabled,
      false,
    );
    process.env.LINE_ENABLED = "true";
    assert.equal((await hook(raw, sign(raw))).statusCode, 503);
    assert.equal(
      (await request("OWNER", "GET", "/api/line/enrollment")).statusCode,
      503,
    );
  } finally {
    await app.close();
    await db.close();
    names.forEach((n, i) => {
      if (saved[i] === undefined) delete process.env[n];
      else process.env[n] = saved[i];
    });
  }
});
