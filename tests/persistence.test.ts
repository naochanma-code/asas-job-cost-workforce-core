import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { openDatabase, migrate } from "../packages/database/index";
import { backup, restore } from "../packages/database/backup";
test("disk restart, consistent backup, empty restore and tamper rejection", async () => {
  const dir = await mkdtemp(join(tmpdir(), "asas-foundation-test-")),
    original = join(dir, "original"),
    destination = join(dir, "restored"),
    file = join(dir, "fixture.json");
  let db = await openDatabase(undefined, original);
  await migrate(db);
  const id = randomUUID(),
    customer = randomUUID(),
    project = randomUUID();
  await db.query(
    "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,'fixture','Fixture','not-a-real-password','OWNER')",
    [id],
  );
  await db.query(
    "INSERT INTO customers(id,code,name,created_by) VALUES($1,'CUS-TEST','Synthetic customer',$2)",
    [customer, id],
  );
  await db.query(
    "INSERT INTO projects(id,code,name,customer_id,created_by) VALUES($1,'PRJ-TEST','No job persists',$2,$3)",
    [project, customer, id],
  );
  await db.close();
  db = await openDatabase(undefined, original);
  assert.equal(
    (await db.query("SELECT name FROM projects")).rows[0].name,
    "No job persists",
  );
  await backup(db, file);
  await db.close();
  const target = await openDatabase(undefined, destination);
  try {
    await migrate(target);
    await restore(target, file);
    assert.equal(
      (await target.query("SELECT id,site_id FROM projects")).rows[0].id,
      project,
    );
    assert.equal((await target.query("SELECT * FROM sessions")).rows.length, 0);
    await assert.rejects(restore(target, file), /empty/);
    const envelope = JSON.parse(await readFile(file, "utf8"));
    envelope.payload += "x";
    const bad = join(dir, "tampered.json");
    await writeFile(bad, JSON.stringify(envelope));
    await assert.rejects(restore(target, bad), /checksum/);
  } finally {
    await target.close();
  }
});
