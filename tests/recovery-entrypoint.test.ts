import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

test("synthetic recovery service rejects pilot database and LINE before starting", () => {
  const base: NodeJS.ProcessEnv = {
    ...process.env,
    RECOVERY_SYNTHETIC_ONLY: "true",
    NODE_ENV: "production",
    LINE_ENABLED: "false",
    LINE_ENROLLMENT_ENABLED: "false",
    WEB_ORIGIN: "https://recovery.example.test",
    PORT: "3000",
  };
  for (const variables of [
    { DATABASE_URL: "postgres://pilot@localhost/pilot" },
    {
      DATABASE_URL: "postgres://synthetic@localhost/m1_synthetic_source_20260926",
      LINE_ENABLED: "true",
    },
    {
      DATABASE_URL: "postgres://synthetic@localhost/m1_synthetic_target_20260926",
      WEB_ORIGIN: "http://recovery.example.test",
    },
  ]) {
    const result = spawnSync(process.execPath, ["scripts/recovery-server.mjs"], {
      cwd: process.cwd(),
      env: { ...base, ...variables },
      encoding: "utf8",
      timeout: 5000,
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Synthetic recovery service configuration rejected/);
    assert.doesNotMatch(result.stderr, /pilot@localhost|synthetic@localhost/);
  }
});
