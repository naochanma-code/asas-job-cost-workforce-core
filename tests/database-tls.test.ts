import { test } from "node:test";
import assert from "node:assert/strict";
import { databasePoolOptions } from "../packages/database/connection";

test("production database TLS cannot be disabled by URL or environment", () => {
  const url = "postgres://fixture:synthetic@db.example.test/fixture";
  const env = { NODE_ENV: "production" };
  assert.deepEqual(databasePoolOptions(url, env).ssl, {
    rejectUnauthorized: true,
  });
  assert.equal(databasePoolOptions(url, {}).ssl, undefined);
  for (const parameter of [
    "sslmode=disable",
    "sslmode=no-verify",
    "ssl=false",
    "sslrootcert=/tmp/other",
    "sslcert=other",
    "sslkey=other",
  ])
    assert.throws(
      () => databasePoolOptions(url + "?" + parameter, env),
      /SSL parameters/,
    );
  assert.throws(
    () =>
      databasePoolOptions(url, { ...env, NODE_TLS_REJECT_UNAUTHORIZED: "0" }),
    /verification/,
  );
  assert.throws(
    () =>
      databasePoolOptions(url, {
        ...env,
        DATABASE_SSL_CA: "not-a-certificate",
      }),
    /public CA/,
  );
  assert.throws(
    () => databasePoolOptions("not-a-url-CONFIDENTIAL", env),
    (e) => e instanceof Error && !e.message.includes("CONFIDENTIAL"),
  );
});
