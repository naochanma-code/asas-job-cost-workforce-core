import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase, migrate } from "../packages/database/index";

const execute = promisify(execFile);
const script = new URL("../scripts/backup.ts", import.meta.url);
function cli(mode: string, file: string, directory: string, extra = {}) {
  return execute(
    process.execPath,
    ["--import", "tsx", fileURLToPath(script), mode, file],
    {
      env: {
        ...process.env,
        DATABASE_URL: "",
        NODE_ENV: "test",
        LOCAL_DATABASE_OFFLINE: "true",
        LOCAL_DB_DIR: directory,
        ...extra,
      },
    },
  );
}

test("backup CLI verifies prepared schema, round-trips and refuses overwrite", async () => {
  const root = await mkdtemp(join(tmpdir(), "asas-backup-cli-"));
  const source = join(root, "source"),
    target = join(root, "target"),
    file = join(root, "snapshot.json");
  for (const directory of [source, target]) {
    const db = await openDatabase(undefined, directory);
    await migrate(db);
    if (directory === source)
      await db.query(
        "INSERT INTO users(id,username,display_name,password_hash,role) VALUES('00000000-0000-4000-8000-000000000001','fixture','Synthetic','synthetic','OWNER')",
      );
    await db.close();
  }
  assert.match((await cli("backup", file, source)).stdout, /backup completed/);
  const original = await readFile(file, "utf8");
  await assert.rejects(cli("backup", file, source));
  assert.equal(await readFile(file, "utf8"), original);
  assert.match(
    (await cli("restore", file, target)).stdout,
    /restore completed/,
  );
  await assert.rejects(cli("restore", file, target));
  const db = await openDatabase(undefined, target);
  assert.equal(
    (await db.query("SELECT username FROM users")).rows[0].username,
    "fixture",
  );
  await db.close();
});

test("backup CLI failure never prints connection credentials", async () => {
  await assert.rejects(
    cli("backup", "unused.json", "unused", {
      NODE_ENV: "production",
      DATABASE_URL: "invalid://synthetic-secret-marker@host",
    }),
    (error: any) => {
      assert.match(error.stderr, /Backup\/restore failed/);
      assert.doesNotMatch(
        error.stdout + error.stderr,
        /synthetic-secret-marker|invalid:\/\//,
      );
      return true;
    },
  );
});
