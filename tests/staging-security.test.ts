import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { openDatabase, migrate } from "../packages/database/index";
import { passwordHash, hashToken } from "../packages/domain/identity";
import { buildApp } from "../apps/api/src/app";

test("Staging security contracts (injected requests, not live TLS)", async (t) => {
  const db = await openDatabase(process.env.TEST_DATABASE_URL, "memory://");
  await migrate(db);
  const origin = "https://staging.example.invalid";
  const username = "security-" + randomUUID();
  const password = "Synthetic-staging-test-only!";
  await db.query(
    "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,$2,'Security fixture',$3,'OWNER')",
    [randomUUID(), username, await passwordHash(password)],
  );
  const app = await buildApp(db, origin);
  await app.ready();
  const saved = { ...process.env };
  const env: Record<string, string | undefined> = process.env;
  try {
    await t.test(
      "production rejects HTTP origin and embedded database",
      async () => {
        env.NODE_ENV = "production";
        await assert.rejects(
          buildApp(db, "http://staging.example.invalid"),
          /HTTPS/,
        );
        await assert.rejects(
          openDatabase(undefined, "memory://"),
          /DATABASE_URL/,
        );
        if (saved.NODE_ENV === undefined) delete env.NODE_ENV;
        else env.NODE_ENV = saved.NODE_ENV;
      },
    );
    await t.test(
      "HTTPS origin issues Secure HttpOnly SameSite cookie; logout revokes it",
      async () => {
        const r = await app.inject({
          method: "POST",
          url: "/api/login",
          headers: { origin },
          payload: { username, password },
          remoteAddress: "127.3.0.1",
        });
        assert.equal(r.statusCode, 200);
        const set = String(r.headers["set-cookie"]);
        for (const flag of [
          /; Secure/i,
          /; HttpOnly/i,
          /SameSite=Strict/i,
          /Max-Age=28800/i,
        ])
          assert.match(set, flag);
        const cookie = set.split(";")[0];
        assert.equal(
          (
            await app.inject({
              method: "POST",
              url: "/api/logout",
              headers: { origin: "https://other.invalid", cookie },
            })
          ).statusCode,
          403,
        );
        assert.equal(
          (
            await app.inject({
              method: "POST",
              url: "/api/logout",
              headers: { origin, cookie },
            })
          ).statusCode,
          200,
        );
        assert.equal(
          (
            await app.inject({
              method: "GET",
              url: "/api/me",
              headers: { cookie },
            })
          ).statusCode,
          401,
        );
      },
    );
    await t.test(
      "login IP limit cannot be evaded by forged forwarding headers",
      async () => {
        for (let i = 0; i < 11; i++) {
          const r = await app.inject({
            method: "POST",
            url: "/api/login",
            remoteAddress: "127.3.0.2",
            headers: { origin, "x-forwarded-for": `198.51.100.${i + 1}` },
            payload: {},
          });
          assert.equal(r.statusCode, i < 10 ? 400 : 429);
          if (i === 10) assert.ok(r.headers["retry-after"]);
        }
      },
    );
    await t.test(
      "account lock spans IPs, expires, then valid login clears failures",
      async () => {
        for (let i = 0; i < 6; i++) {
          const r = await app.inject({
            method: "POST",
            url: "/api/login",
            remoteAddress: `127.3.1.${i + 1}`,
            headers: { origin },
            payload: { username, password: "Wrong-test-password!" },
          });
          assert.equal(r.statusCode, i < 5 ? 401 : 429);
        }
        await db.query(
          "UPDATE login_attempts SET blocked_until=now()-interval '1 second' WHERE key=$1",
          [hashToken(username)],
        );
        assert.equal(
          (
            await app.inject({
              method: "POST",
              url: "/api/login",
              remoteAddress: "127.3.1.20",
              headers: { origin },
              payload: { username, password },
            })
          ).statusCode,
          200,
        );
        assert.equal(
          (
            await db.query("SELECT key FROM login_attempts WHERE key=$1", [
              hashToken(username),
            ])
          ).rows.length,
          0,
        );
      },
    );
    await t.test(
      "global API bucket rejects request 121 per minute",
      async () => {
        for (let i = 0; i < 121; i++) {
          const r = await app.inject({
            method: "GET",
            url: "/api/health",
            remoteAddress: "127.3.2.1",
          });
          assert.equal(r.statusCode, i < 120 ? 200 : 429);
        }
      },
    );
    await t.test(
      "signature uses exact bytes; missing/tampered signatures fail; LINE Verify accepts empty events",
      async () => {
        process.env.LINE_ENABLED = "true";
        process.env.LINE_CHANNEL_SECRET = "synthetic-security-secret";
        process.env.LINE_BOT_ID = "synthetic-security-bot";
        const raw = JSON.stringify({
          destination: process.env.LINE_BOT_ID,
          events: [],
        });
        const signature = createHmac("sha256", process.env.LINE_CHANNEL_SECRET)
          .update(raw)
          .digest("base64");
        for (const [payload, sig, expected] of [
          [raw, undefined, 401],
          [raw + " ", signature, 401],
          [raw, signature, 200],
        ] as const) {
          const r = await app.inject({
            method: "POST",
            url: "/api/line/webhook",
            headers: {
              "content-type": "application/json",
              ...(sig ? { "x-line-signature": sig } : {}),
            },
            payload,
          });
          assert.equal(r.statusCode, expected);
        }
      },
    );
  } finally {
    for (const name of [
      "NODE_ENV",
      "LINE_ENABLED",
      "LINE_CHANNEL_SECRET",
      "LINE_BOT_ID",
    ]) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
    await app.close();
    await db.close();
  }
});
