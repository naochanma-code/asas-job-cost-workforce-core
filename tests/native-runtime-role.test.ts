import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Pool, type PoolClient } from "pg";
import { verifyRuntimePrivileges } from "../packages/database/runtime-security";
import {
  openDatabase,
  migrate,
  verifySchema,
} from "../packages/database/index";

test(
  "native runtime role cannot DDL, change audit or migration history",
  {
    skip: !process.env.TEST_DATABASE_URL,
  },
  async () => {
    // Disposable CI only: never reads DATABASE_URL. Each run owns its fresh DB/roles.
    const suffix = randomUUID().replaceAll("-", "");
    const database = `m1_role_${suffix}`;
    const runtime = `runtime_${suffix}`,
      migrator = `migrator_${suffix}`;
    const admin = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    let pool: Pool | undefined;
    let client: PoolClient | undefined;
    try {
      await admin.query(`CREATE DATABASE "${database}"`);
      const url = new URL(process.env.TEST_DATABASE_URL!);
      url.pathname = "/" + database;
      const db = await openDatabase(url.toString());
      await migrate(db);
      await db.close();
      pool = new Pool({ connectionString: url.toString(), max: 1 });
      client = await pool.connect();
      await assert.rejects(
        verifyRuntimePrivileges({
          query: (s, p) => client!.query(s, p),
          exec: (s) => client!.query(s),
        }),
        /excess privileges/,
      );
      const sql = (
        await readFile(
          new URL("../deploy/provision-m1-roles.sql", import.meta.url),
          "utf8",
        )
      )
        .replaceAll("asas_m1_runtime", runtime)
        .replaceAll("asas_m1_migrator", migrator);
      await client.query(sql);
      await assert.rejects(client.query(sql), /already exist/);
      await client.query("ROLLBACK");
      await client.query(`SET SESSION AUTHORIZATION "${runtime}"`);
      await verifyRuntimePrivileges({
        query: (s, p) => client!.query(s, p),
        exec: (s) => client!.query(s),
      });
      await verifySchema({
        query: (s, p) => client!.query(s, p),
        exec: (s) => client!.query(s),
      });
      const permissions = (
        await client.query(`SELECT
      has_database_privilege(current_user,current_database(),'CREATE') AS create_db,
      has_database_privilege(current_user,current_database(),'TEMP') AS temp,
      has_schema_privilege(current_user,'public','CREATE') AS create_schema`)
      ).rows[0];
      assert.deepEqual(permissions, {
        create_db: false,
        temp: false,
        create_schema: false,
      });
      for (const statement of [
        "CREATE TABLE public.forbidden(id int)",
        "CREATE SCHEMA forbidden",
        "CREATE TEMP TABLE forbidden(id int)",
        "ALTER TABLE public.users ADD COLUMN forbidden int",
        "DROP TABLE public.notification_outbox",
        "ALTER SCHEMA public RENAME TO forbidden",
        "TRUNCATE public.sessions",
        "DELETE FROM public.audit_logs",
        "UPDATE public.audit_logs SET action='changed'",
        "DELETE FROM public.schema_migrations",
        `SET ROLE "${migrator}"`,
      ])
        await assert.rejects(
          client.query(statement),
          (e: any) => e.code === "42501",
        );
      const id = randomUUID();
      await client.query(
        "INSERT INTO public.users(id,username,display_name,password_hash,role) VALUES($1,'role-fixture','Fixture','synthetic','OWNER')",
        [id],
      );
      await client.query(
        "INSERT INTO public.audit_logs(id,actor_id,action) VALUES($1,$2,'ROLE_TEST')",
        [randomUUID(), id],
      );
      assert.equal(
        (await client.query("SELECT count(*)::int AS n FROM public.audit_logs"))
          .rows[0].n,
        1,
      );
      await client.query("RESET SESSION AUTHORIZATION");
      await client.query(`SET ROLE "${migrator}"`);
      await client.query("BEGIN");
      await client.query(
        "ALTER TABLE public.users ADD COLUMN migration_probe int",
      );
      await client.query("ROLLBACK");
      await client.query("RESET SESSION AUTHORIZATION");
    } finally {
      client?.release();
      await pool?.end();
      await admin.query(`DROP DATABASE IF EXISTS "${database}"`);
      await admin.query(`DROP ROLE IF EXISTS "${runtime}", "${migrator}"`);
      await admin.end();
    }
  },
);
