-- Operator, only AFTER approved 003 migration; no password or role replacement.
-- Run as existing migrator (object owner) or administrator; not runtime.
BEGIN;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM schema_migrations WHERE name='003_m1_alignment.sql') THEN
  RAISE EXCEPTION 'Alignment migration required';
 END IF;
END $$;
GRANT SELECT, INSERT ON code_reservations TO asas_m1_runtime;
GRANT SELECT, INSERT, UPDATE ON project_types, job_types, code_counters TO asas_m1_runtime;
COMMIT;
