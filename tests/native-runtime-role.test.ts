import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";
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
    try {
      await admin.query(`CREATE DATABASE "${database}"`);
      const url = new URL(process.env.TEST_DATABASE_URL!);
      url.pathname = "/" + database;
      const db = await openDatabase(url.toString());
      await migrate(db);
      await db.close();
      pool = new Pool({ connectionString: url.toString(), max: 1 });
      const sql = (
        await readFile(
          new URL("../deploy/provision-m1-roles.sql", import.meta.url),
          "utf8",
        )
      )
        .replaceAll("asas_m1_runtime", runtime)
        .replaceAll("asas_m1_migrator", migrator);
      await pool.query(sql);
      await assert.rejects(pool.query(sql), /already exist/);
      await pool.query("ROLLBACK");
      await pool.query(`SET ROLE "${runtime}"`);
      await verifySchema({
        query: (s, p) => pool!.query(s, p),
        exec: (s) => pool!.query(s),
      });
      const permissions = (
        await pool.query(`SELECT
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
          pool.query(statement),
          (e: any) => e.code === "42501",
        );
      const id = randomUUID();
      await pool.query(
        "INSERT INTO public.users(id,username,display_name,password_hash,role) VALUES($1,'role-fixture','Fixture','synthetic','OWNER')",
        [id],
      );
      await pool.query(
        "INSERT INTO public.audit_logs(id,actor_id,action) VALUES($1,$2,'ROLE_TEST')",
        [randomUUID(), id],
      );
      assert.equal(
        (await pool.query("SELECT count(*)::int AS n FROM public.audit_logs"))
          .rows[0].n,
        1,
      );
      await pool.query("RESET ROLE");
      await pool.query(`SET ROLE "${migrator}"`);
      await pool.query("BEGIN");
      await pool.query(
        "ALTER TABLE public.users ADD COLUMN migration_probe int",
      );
      await pool.query("ROLLBACK");
      await pool.query("RESET ROLE");
    } finally {
      await pool?.end();
      await admin.query(`DROP DATABASE IF EXISTS "${database}"`);
      await admin.query(`DROP ROLE IF EXISTS "${runtime}", "${migrator}"`);
      await admin.end();
    }
  },
);
