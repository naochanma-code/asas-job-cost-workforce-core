import { test } from "node:test";
import assert from "node:assert/strict";
import {
  openDatabase,
  migrate,
  verifySchema,
  prepareRuntimeDatabase,
  type Queryable,
  type Database,
} from "../packages/database/index";

test("runtime schema gate verifies without DDL; rejects missing, modified and newer schemas", async () => {
  const db = await openDatabase(undefined, "memory://");
  const env: Record<string, string | undefined> = process.env;
  const previous = env.NODE_ENV;
  try {
    await assert.rejects(verifySchema(db));
    await migrate(db);
    let selects = 0;
    const readOnly: Queryable = {
      query: async (s, p) => {
        assert.match(s, /^SELECT /);
        selects++;
        return db.query(s, p);
      },
      exec: async () => {
        throw Error("Runtime must not execute DDL");
      },
    };
    env.NODE_ENV = "production";
    await prepareRuntimeDatabase({
      ...readOnly,
      transaction: async () => {
        throw Error("Runtime must not migrate");
      },
      close: async () => {},
    } as Database);
    assert.equal(selects, 1);
    await db.query(
      "INSERT INTO schema_migrations(name,checksum) VALUES('999_future.sql','unexpected')",
    );
    await assert.rejects(verifySchema(db), /does not match/);
    await db.query("DELETE FROM schema_migrations WHERE name='999_future.sql'");
    await db.query(
      "UPDATE schema_migrations SET checksum='changed' WHERE name='001_foundation.sql'",
    );
    await assert.rejects(verifySchema(db), /does not match/);
  } finally {
    if (previous === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = previous;
    await db.close();
  }
});
