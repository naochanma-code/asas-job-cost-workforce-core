import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { lineWorkerConfigured } from "../packages/domain/line-worker-config";

test("worker fails closed for missing or malformed pilot configuration", () => {
  const fixture = {
    LINE_ENABLED: "true",
    LINE_CHANNEL_ACCESS_TOKEN: "synthetic-only",
    DATABASE_URL: "postgres://synthetic.invalid/test",
    WEB_ORIGIN: "https://test.invalid",
    LINE_TEST_USER_IDS: "U" + "1".repeat(32),
    LINE_TEST_GROUP_IDS: "C" + "2".repeat(32),
    LINE_TEST_PROJECT_IDS: "00000000-0000-4000-8000-000000000001",
    LINE_PAYLOAD_KEY: Buffer.alloc(32, 1).toString("base64"),
  };
  assert.equal(lineWorkerConfigured(fixture), true);
  for (const name of Object.keys(fixture))
    assert.equal(lineWorkerConfigured({ ...fixture, [name]: "" }), false, name);
  for (const origin of [
    "http://test.invalid",
    "https://",
    "https://user:password@test.invalid",
    "https://test.invalid/?token=x",
    "https://test.invalid/#x",
    "https://test.invalid/nested",
  ])
    assert.equal(
      lineWorkerConfigured({ ...fixture, WEB_ORIGIN: origin }),
      false,
    );
  for (const name of [
    "LINE_TEST_USER_IDS",
    "LINE_TEST_GROUP_IDS",
    "LINE_TEST_PROJECT_IDS",
  ])
    for (const value of [
      "*",
      " , ",
      "wrong",
      fixture[name as keyof typeof fixture] + ",",
    ])
      assert.equal(lineWorkerConfigured({ ...fixture, [name]: value }), false);
});

test("disabled worker exits before connection and prints only a fixed safe error", () => {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/worker.ts"],
    {
      env: {
        ...process.env,
        LINE_ENABLED: "false",
        DATABASE_URL: "postgres://synthetic-sensitive-canary.invalid/test",
      },
      encoding: "utf8",
      timeout: 15000,
    },
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(
    result.stderr.trim(),
    "LINE worker stopped: check private configuration and database health",
  );
});
