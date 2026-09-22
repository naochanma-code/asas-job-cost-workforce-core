import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
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
import { projectsFor } from "../packages/domain/projects";

test(
  "native PostgreSQL: isolated restore preserves scope and excludes transient credentials",
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    // CI disposable database only. Never accepts DATABASE_URL or a staging URL implicitly.
    const admin = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const prefix = "restore_" + randomUUID().replaceAll("-", "");
    const schemas = [prefix + "_source", prefix + "_target"];
    let source: Database | undefined, target: Database | undefined;
    try {
      for (const schema of schemas)
        await admin.query(`CREATE SCHEMA "${schema}"`);
      const connect = async (schema: string) => {
        const url = new URL(process.env.TEST_DATABASE_URL!);
        url.searchParams.set("options", "-c search_path=" + schema);
        const db = await openDatabase(url.toString());
        await migrate(db);
        return db;
      };
      source = await connect(schemas[0]);
      target = await connect(schemas[1]);
      const actor = randomUUID(),
        employee = randomUUID(),
        customer = randomUUID(),
        a = randomUUID(),
        b = randomUUID(),
        site = randomUUID(),
        job = randomUUID();
      await source.query(
        "INSERT INTO users(id,username,display_name,password_hash,role) VALUES($1,'restore-fixture','Fixture','synthetic-hash','TECH')",
        [actor],
      );
      await source.query(
        "INSERT INTO employees(id,user_id,code,display_name) VALUES($1,$2,'EMP-RESTORE','Fixture')",
        [employee, actor],
      );
      await source.query(
        "INSERT INTO customers(id,code,name,created_by) VALUES($1,'CUS-RESTORE','Synthetic',$2)",
        [customer, actor],
      );
      await source.query(
        "INSERT INTO sites(id,customer_id,name) VALUES($1,$2,'Site B')",
        [site, customer],
      );
      await source.query(
        "INSERT INTO projects(id,code,name,customer_id,site_id,created_by) VALUES($1,'RESTORE-A','Project A',$3,NULL,$4),($2,'RESTORE-B','Project B',$3,$5,$4)",
        [a, b, customer, actor, site],
      );
      await source.query(
        "INSERT INTO jobs(id,project_id,code,name) VALUES($1,$2,'JOB-B','Job B')",
        [job, b],
      );
      await source.query(
        "INSERT INTO job_assignments(id,project_id,employee_id,created_by) VALUES($1,$2,$3,$4)",
        [randomUUID(), a, employee, actor],
      );
      await source.query(
        "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES('synthetic-session',$1,now()+interval '1 hour')",
        [actor],
      );
      await source.query(
        "INSERT INTO line_link_nonces(nonce_hash,user_id,expires_at) VALUES('synthetic-nonce',$1,now()+interval '1 hour')",
        [actor],
      );
      await source.query(
        "INSERT INTO line_accounts(line_user_id,user_id) VALUES('synthetic-line-user',$1)",
        [actor],
      );
      await source.query(
        "INSERT INTO line_group_bindings(group_id,project_id,created_by) VALUES('synthetic-group',$1,$2)",
        [a, actor],
      );
      await source.query(
        "INSERT INTO audit_logs(id,actor_id,action,entity_id) VALUES($1,$2,'RESTORE_FIXTURE',$3)",
        [randomUUID(), actor, a],
      );
      const file = join(
        await mkdtemp(join(tmpdir(), "asas-native-restore-")),
        "fixture.json",
      );
      await backup(source, file);
      await source.close();
      source = undefined;
      await restore(target, file);
      await target.close();
      target = await connect(schemas[1]);
      assert.equal(
        (await target.query("SELECT site_id FROM projects WHERE id=$1", [a]))
          .rows[0].site_id,
        null,
      );
      assert.equal(
        (await target.query("SELECT project_id FROM jobs WHERE id=$1", [job]))
          .rows[0].project_id,
        b,
      );
      assert.equal(
        (await target.query("SELECT project_id FROM job_assignments")).rows[0]
          .project_id,
        a,
      );
      assert.equal(
        (await target.query("SELECT project_id FROM line_group_bindings"))
          .rows[0].project_id,
        a,
      );
      assert.equal(
        (await target.query("SELECT user_id FROM line_accounts")).rows[0]
          .user_id,
        actor,
      );
      assert.equal(
        (await target.query("SELECT action FROM audit_logs")).rows[0].action,
        "RESTORE_FIXTURE",
      );
      assert.deepEqual(
        (
          await projectsFor(target, {
            id: actor,
            role: "TECH",
            display_name: "Fixture",
          })
        ).map((p) => p.id),
        [a],
      );
      await target.query(
        "UPDATE job_assignments SET revoked_at=now() WHERE employee_id=$1",
        [employee],
      );
      assert.deepEqual(
        await projectsFor(target, {
          id: actor,
          role: "TECH",
          display_name: "Fixture",
        }),
        [],
      );
      for (const table of [
        "sessions",
        "line_link_nonces",
        "line_binding_codes",
        "line_event_inbox",
        "notification_outbox",
      ])
        assert.equal(
          (await target.query(`SELECT count(*)::int n FROM ${table}`)).rows[0]
            .n,
          0,
        );
      await assert.rejects(restore(target, file), /empty/);
    } finally {
      await source?.close();
      await target?.close();
      // Only random schemas created by this test, never public or a user-supplied name.
      for (const schema of schemas)
        await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await admin.end();
    }
  },
);
