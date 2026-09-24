import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { openDatabase, migrate } from "../packages/database/index";
import { hashToken } from "../packages/domain/identity";
import { buildApp } from "../apps/api/src/app";

test("LINE disabled exposes only a boolean and blocks mutations without side effects", async () => {
  const saved = process.env.LINE_ENABLED;
  const db = await openDatabase(process.env.TEST_DATABASE_URL, "memory://");
  await migrate(db);
  const watched = ["line_link_nonces", "line_binding_codes", "audit_logs"];
  const before = await Promise.all(
    watched.map(async (table) =>
      Number((await db.query(`SELECT count(*) AS n FROM ${table}`)).rows[0].n),
    ),
  );
  const app = await buildApp(db);
  try {
    for (const role of ["OWNER", "ADMIN", "PM", "TECH"]) {
      const id = randomUUID(),
        sid = randomUUID();
      await db.query(
        "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,$2,'LINE gate fixture','not-a-login-hash',$3)",
        [id, id, role],
      );
      await db.query(
        "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 hour')",
        [hashToken(sid), id],
      );
      await db.query(
        "INSERT INTO line_accounts(line_user_id,user_id) VALUES($1,$2)",
        [id, id],
      );
      const headers = { cookie: `sid=${sid}`, origin: "http://127.0.0.1:3000" };
      for (const value of [undefined, "false", "TRUE"]) {
        if (value === undefined) delete process.env.LINE_ENABLED;
        else process.env.LINE_ENABLED = value;
        const me = await app.inject({ method: "GET", url: "/api/me", headers });
        assert.equal(me.json().line_enabled, false);
        assert.deepEqual(Object.keys(me.json()).sort(), [
          "display_name",
          "id",
          "line_enabled",
          "role",
        ]);
        for (const method of ["POST", "DELETE"] as const) {
          const r = await app.inject({
            method,
            url: "/api/line/link",
            headers,
            ...(method === "POST"
              ? { payload: { linkToken: "synthetic-link-only" } }
              : {}),
          });
          assert.equal(r.statusCode, 503);
        }
        const code = await app.inject({
          method: "POST",
          url: `/api/projects/${randomUUID()}/line-code`,
          headers,
        });
        assert.equal(
          code.statusCode,
          ["OWNER", "ADMIN"].includes(role) ? 503 : 403,
        );
      }
      assert.equal(
        (
          await db.query(
            "SELECT user_id FROM line_accounts WHERE line_user_id=$1",
            [id],
          )
        ).rows[0].user_id,
        id,
      );
      process.env.LINE_ENABLED = "true";
      assert.equal(
        (await app.inject({ method: "GET", url: "/api/me", headers })).json()
          .line_enabled,
        true,
      );
    }
    for (const [i, table] of watched.entries()) {
      assert.equal(
        Number(
          (await db.query(`SELECT count(*) AS n FROM ${table}`)).rows[0].n,
        ),
        before[i],
      );
    }
    assert.equal(
      (await app.inject({ method: "GET", url: "/api/me" })).statusCode,
      401,
    );
  } finally {
    if (saved === undefined) delete process.env.LINE_ENABLED;
    else process.env.LINE_ENABLED = saved;
    await app.close();
    await db.close();
  }
});
