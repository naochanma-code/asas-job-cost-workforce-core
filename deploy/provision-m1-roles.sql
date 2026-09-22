-- Operator only, once, in the existing M1 database. No passwords in this file.
-- psql -X -v ON_ERROR_STOP=1 -f deploy/provision-m1-roles.sql
-- Refuses existing roles or a database other than the exact M1 schema.
BEGIN;
DO $preflight$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN ('asas_m1_runtime', 'asas_m1_migrator')) THEN
    RAISE EXCEPTION 'M1 roles already exist; review rather than overwrite';
  END IF;
  IF (SELECT array_agg(name ORDER BY name) FROM public.schema_migrations)
       IS DISTINCT FROM ARRAY['001_foundation.sql', '002_line_outbox.sql']::text[]
     OR (SELECT count(*) FROM pg_tables WHERE schemaname='public') <> 18 THEN
    RAISE EXCEPTION 'Expected M1 schema only';
  END IF;
END
$preflight$;

CREATE ROLE asas_m1_migrator NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
CREATE ROLE asas_m1_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
-- Login remains disabled until the Owner sets a password in a private prompt.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
ALTER SCHEMA public OWNER TO asas_m1_migrator;
GRANT USAGE ON SCHEMA public TO asas_m1_runtime;
DO $ownership$
DECLARE t record;
BEGIN
  EXECUTE format('REVOKE CREATE, TEMPORARY ON DATABASE %I FROM PUBLIC', current_database());
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO asas_m1_runtime, asas_m1_migrator', current_database());
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
    EXECUTE format('ALTER TABLE public.%I OWNER TO asas_m1_migrator', t.tablename);
  END LOOP;
END
$ownership$;
GRANT SELECT ON public.schema_migrations TO asas_m1_runtime;
GRANT SELECT, INSERT ON public.audit_logs TO asas_m1_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON
 public.users, public.employees, public.sessions, public.login_attempts,
 public.customers, public.sites, public.projects, public.jobs,
 public.project_members, public.job_assignments, public.line_accounts,
 public.line_link_nonces, public.line_binding_codes, public.line_group_bindings,
 public.line_event_inbox, public.notification_outbox TO asas_m1_runtime;
-- No automatic grants on future tables. Review each approved migration.
COMMIT;
