import type { Queryable } from "./index";

export async function verifyRuntimePrivileges(db: Queryable) {
  const { rows } = await db.query(`SELECT
    r.rolsuper OR r.rolcreatedb OR r.rolcreaterole OR r.rolinherit OR r.rolreplication OR r.rolbypassrls AS elevated,
    EXISTS (SELECT 1 FROM pg_auth_members WHERE member=r.oid) AS membership,
    has_database_privilege(current_user,current_database(),'CREATE') OR
      has_database_privilege(current_user,current_database(),'TEMP') AS database_ddl,
    EXISTS (SELECT 1 FROM pg_namespace WHERE has_schema_privilege(current_user,oid,'CREATE')) AS schema_ddl,
    EXISTS (SELECT 1 FROM pg_class WHERE relowner=r.oid) AS owns_objects,
    has_table_privilege(current_user,'public.schema_migrations','INSERT,UPDATE,DELETE,TRUNCATE') AS migration_write,
    has_table_privilege(current_user,'public.audit_logs','UPDATE,DELETE,TRUNCATE') AS audit_rewrite,
    has_table_privilege(current_user,'public.code_reservations','UPDATE,DELETE,TRUNCATE') AS code_rewrite,
    has_table_privilege(current_user,'public.code_counters','DELETE,TRUNCATE') AS code_reset
    FROM pg_roles r WHERE r.rolname=current_user`);
  if (rows.length !== 1 || Object.values(rows[0]).some((v) => v !== false))
    throw Error("Database runtime role has excess privileges");
}

export async function verifyDatabaseTls(db: Queryable) {
  const { rows } = await db.query(
    "SELECT ssl, version, bits FROM pg_stat_ssl WHERE pid=pg_backend_pid()",
  );
  if (
    rows.length !== 1 ||
    rows[0].ssl !== true ||
    !["TLSv1.2", "TLSv1.3"].includes(rows[0].version) ||
    rows[0].bits < 128
  )
    throw Error("Database connection requires verified modern TLS");
}
