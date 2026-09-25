import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import {
  lineLinkUrl,
  consumeLineLinkUrl,
} from "../packages/domain/line-link-url";
import { expireLinePayloads } from "../packages/domain/line-retention";
import { openDatabase, migrate } from "../packages/database/index";
import { deliverLine, processLineEvent } from "../apps/api/src/line";

test("LINE link credentials use fragments, are consumed in memory and legacy query is rejected", () => {
  const token = "synthetic+/=& only";
  const url = new URL(lineLinkUrl("https://test.invalid", token));
  assert.equal(url.search, "");
  assert.equal(url.pathname + url.search, "/");
  assert.deepEqual(consumeLineLinkUrl(url.toString()), {
    token,
    cleanPath: "/",
  });
  assert.deepEqual(
    consumeLineLinkUrl("https://test.invalid/?linkToken=old&x=1"),
    {
      token: "",
      cleanPath: "/?x=1",
    },
  );
});

test("queue retention clears expired content only, preserves history and is idempotent", async () => {
  const schema = "retention_" + randomUUID().replaceAll("-", "");
  const admin = process.env.TEST_DATABASE_URL
    ? new Pool({ connectionString: process.env.TEST_DATABASE_URL })
    : undefined;
  let isolatedUrl: string | undefined;
  if (admin) {
    await admin.query(`CREATE SCHEMA "${schema}"`);
    const url = new URL(process.env.TEST_DATABASE_URL!);
    url.searchParams.set("options", "-c search_path=" + schema);
    isolatedUrl = url.toString();
  }
  const db = await openDatabase(isolatedUrl, "memory://");
  const old = process.env.LINE_ENABLED,
    enrollment = process.env.LINE_ENROLLMENT_ENABLED;
  const fixtures: { id: string; state: string; hours: number }[] = [];
  try {
    await migrate(db);
    const auditsBefore = (await db.query("SELECT count(*) n FROM audit_logs"))
      .rows[0].n;
    for (const [hours, state] of [
      [25, "RETRY"],
      [25, "SENT"],
      [25, "DEAD"],
      [23, "PENDING"],
    ] as const) {
      const id = randomUUID();
      fixtures.push({ id, state, hours });
      await db.query(
        "INSERT INTO line_event_inbox(id,payload,state,received_at) VALUES($1,$2,$3,now()-($4::int*interval '1 hour'))",
        [
          id,
          JSON.stringify({ synthetic: true }),
          state === "SENT" ? "DONE" : "RECEIVED",
          hours,
        ],
      );
      await db.query(
        "INSERT INTO notification_outbox(id,event_id,payload,state) VALUES($1,$2,$3,$4)",
        [randomUUID(), id, JSON.stringify({ synthetic: true }), state],
      );
    }
    await expireLinePayloads(db);
    for (const f of fixtures) {
      const e = (
        await db.query(
          "SELECT payload,state FROM line_event_inbox WHERE id=$1",
          [f.id],
        )
      ).rows[0];
      const o = (
        await db.query(
          "SELECT payload,state,last_error_category FROM notification_outbox WHERE event_id=$1",
          [f.id],
        )
      ).rows[0];
      assert.deepEqual(e.payload, f.hours > 24 ? {} : { synthetic: true });
      assert.deepEqual(o.payload, e.payload);
      assert.equal(
        o.state,
        f.hours > 24 && f.state !== "SENT" ? "DEAD" : f.state,
      );
      assert.equal(
        o.last_error_category,
        f.hours > 24 ? "PAYLOAD_EXPIRED" : null,
      );
    }
    await expireLinePayloads(db);
    assert.equal(
      (await db.query("SELECT count(*) n FROM audit_logs")).rows[0].n,
      auditsBefore,
    );
    assert.equal(
      (
        await db.query(
          "SELECT id FROM line_event_inbox WHERE id=ANY($1::text[])",
          [fixtures.map((f) => f.id)],
        )
      ).rows.length,
      4,
    );
    // Even before a sweep, expired work must never reach business handlers/transport.
    await db.query(
      "UPDATE line_event_inbox SET state='RECEIVED',payload=$1,received_at=now()-interval '25 hours' WHERE id=ANY($2::text[])",
      [JSON.stringify({ synthetic: true }), fixtures.map((f) => f.id)],
    );
    await db.query(
      "UPDATE notification_outbox SET state='PENDING',payload=$1 WHERE event_id=ANY($2::text[])",
      [JSON.stringify({ synthetic: true }), fixtures.map((f) => f.id)],
    );
    process.env.LINE_ENABLED = "true";
    process.env.LINE_ENROLLMENT_ENABLED = "false";
    assert.equal(await processLineEvent(db), false);
    assert.equal(
      await deliverLine(
        db,
        {
          linkToken: async () => {
            throw Error("must not send");
          },
          reply: async () => {
            throw Error("must not send");
          },
        },
        "https://test.invalid",
      ),
      false,
    );
  } finally {
    if (old === undefined) delete process.env.LINE_ENABLED;
    else process.env.LINE_ENABLED = old;
    if (enrollment === undefined) delete process.env.LINE_ENROLLMENT_ENABLED;
    else process.env.LINE_ENROLLMENT_ENABLED = enrollment;
    await db.close();
    if (admin) {
      await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
      await admin.end();
    }
  }
});
