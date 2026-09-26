import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Pool } from "pg";
import {
  openDatabase,
  migrate,
  type Database,
} from "../packages/database/index";
import { backup, restore } from "../packages/database/backup";
import { passwordHash, hashToken } from "../packages/domain/identity";
import { buildApp } from "../apps/api/src/app";

test("restored job assignment preserves sibling-job isolation over HTTP", async () => {
  // Only a disposable CI URL is accepted; never inherit the application's DATABASE_URL.
  const native = process.env.TEST_DATABASE_URL;
  const admin = native ? new Pool({ connectionString: native }) : undefined;
  const prefix = "job_restore_" + randomUUID().replaceAll("-", "");
  const schemas = [prefix + "_source", prefix + "_target"];
  const folder = await mkdtemp(join(tmpdir(), "asas-job-restore-"));
  let source: Database | undefined, target: Database | undefined;
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;
  const connect = async (index: number) => {
    let url: string | undefined;
    if (native) {
      const scoped = new URL(native);
      scoped.searchParams.set("options", "-c search_path=" + schemas[index]);
      url = scoped.toString();
    }
    const db = await openDatabase(
      url,
      join(folder, index ? "target" : "source"),
    );
    await migrate(db);
    return db;
  };
  try {
    if (admin)
      for (const schema of schemas)
        await admin.query('CREATE SCHEMA "' + schema + '"');
    source = await connect(0);
    target = await connect(1);
    const user = randomUUID(),
      employee = randomUUID(),
      customer = randomUUID();
    const project = randomUUID(),
      otherProject = randomUUID(),
      job = randomUUID(),
      sibling = randomUUID();
    const assignment = randomUUID(),
      password = randomBytes(32).toString("base64url"),
      stale = randomBytes(32).toString("hex");
    await source.query(
      "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,'job-restore-tech','Synthetic TECH',$2,'TECH')",
      [user, await passwordHash(password)],
    );
    await source.query(
      "INSERT INTO employees(id,user_id,code,display_name) VALUES($1,$2,'RESTORE-TECH','Synthetic TECH')",
      [employee, user],
    );
    await source.query(
      "INSERT INTO customers(id,code,name,created_by) VALUES($1,'RESTORE-CUSTOMER','Synthetic Customer',$2)",
      [customer, user],
    );
    await source.query(
      "INSERT INTO projects(id,code,name,customer_id,created_by) VALUES($1,'RESTORE-B','Synthetic B',$3,$4),($2,'RESTORE-HIDDEN','Hidden Project',$3,$4)",
      [project, otherProject, customer, user],
    );
    await source.query(
      "INSERT INTO jobs(id,project_id,code,name,created_by) VALUES($1,$3,'RESTORE-JOB-1','Assigned Job',$4),($2,$3,'RESTORE-JOB-2','Hidden Sibling',$4)",
      [job, sibling, project, user],
    );
    await source.query(
      "INSERT INTO job_assignments(id,project_id,job_id,employee_id,created_by) VALUES($1,$2,$3,$4,$5)",
      [assignment, project, job, employee, user],
    );
    await source.query(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 hour')",
      [hashToken(stale), user],
    );
    const file = join(folder, "synthetic.json");
    await backup(source, file);
    await source.close();
    source = undefined;
    await restore(target, file);
    await target.close();
    target = await connect(1);
    const origin = "http://127.0.0.1:3199";
    app = await buildApp(target, origin);
    const base = await app.listen({ host: "127.0.0.1", port: 0 });
    const old = await fetch(base + "/api/me", {
      headers: { cookie: "sid=" + stale },
    });
    assert.equal(old.status, 401);
    const login = await fetch(base + "/api/login", {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({ username: "job-restore-tech", password }),
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie")!.split(";")[0];
    const headers = { origin, cookie };
    const list = await fetch(base + "/api/projects", { headers });
    assert.equal(list.status, 200);
    assert.deepEqual(
      (await list.json()).map((p: { id: string }) => p.id),
      [project],
    );
    const detail = await fetch(base + "/api/projects/" + project, { headers });
    assert.equal(detail.status, 200);
    const body = await detail.json();
    assert.deepEqual(
      body.jobs.map((j: { id: string }) => j.id),
      [job],
    );
    assert.equal(body.site_id, null);
    assert.equal(
      (await fetch(base + "/api/projects/" + otherProject, { headers })).status,
      404,
    );
    // Revocation on the disposable restored fixture must take effect without a new login.
    await target.query(
      "UPDATE job_assignments SET revoked_at=now() WHERE id=$1",
      [assignment],
    );
    assert.equal(
      (await fetch(base + "/api/projects/" + project, { headers })).status,
      404,
    );
    assert.equal(
      (await fetch(base + "/api/logout", { method: "POST", headers })).status,
      200,
    );
    assert.equal((await fetch(base + "/api/me", { headers })).status, 401);
  } finally {
    await app?.close();
    await source?.close();
    await target?.close();
    // Only schemas generated by this test inside a disposable CI database.
    if (admin) {
      for (const schema of schemas)
        await admin.query('DROP SCHEMA IF EXISTS "' + schema + '" CASCADE');
      await admin.end();
    }
  }
});
