-- Append-only M1 alignment. Runs inside the migration runner's transaction.
CREATE TABLE project_types (
 id uuid PRIMARY KEY, code text UNIQUE NOT NULL CHECK(code ~ '^[A-Z][A-Z0-9_]{0,49}$'),
 display_name text NOT NULL CHECK(length(trim(display_name)) BETWEEN 1 AND 160),
 sort_order integer NOT NULL DEFAULT 0, enabled boolean NOT NULL DEFAULT true,
 version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE job_types (LIKE project_types INCLUDING ALL);

INSERT INTO project_types(id,code,display_name,sort_order)
SELECT md5('project-type:'||code)::uuid,code,label,ordinal FROM (VALUES
 ('INSTALLATION','Installation',10),('SERVICE','Service',50),('SURVEY','Survey',70),
 ('POC','POC',80),('OTHER','Other',100)
) AS seed(code,label,ordinal) ON CONFLICT(code) DO NOTHING;
INSERT INTO job_types(id,code,display_name,sort_order)
SELECT md5('job-type:'||code)::uuid,code,label,ordinal FROM (VALUES
 ('INSTALLATION','Installation',10),('SERVICE_SUPPORT','Service Support',20),
 ('PM_VISIT','PM Visit',30),('SITE_SURVEY','Site Survey',40),('POC','POC',50),
 ('CONFIGURATION','Configuration',60),('TESTING','Testing',70),('TRAINING','Training',80),
 ('OFFICE_WORK','Office Work',90),('OTHER','Other',100)
) AS seed(code,label,ordinal) ON CONFLICT(code) DO NOTHING;

CREATE FUNCTION m1_immutable_type_code() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.code IS DISTINCT FROM OLD.code OR NEW.id IS DISTINCT FROM OLD.id THEN
  RAISE EXCEPTION 'Type identity is immutable' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER project_type_identity BEFORE UPDATE ON project_types FOR EACH ROW EXECUTE FUNCTION m1_immutable_type_code();
CREATE TRIGGER job_type_identity BEFORE UPDATE ON job_types FOR EACH ROW EXECUTE FUNCTION m1_immutable_type_code();

ALTER TABLE projects DROP CONSTRAINT projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK(status IN ('PLANNED','ACTIVE','COMPLETED','CLOSED'));
ALTER TABLE projects
 ADD COLUMN project_type_id uuid NOT NULL DEFAULT md5('project-type:OTHER')::uuid REFERENCES project_types(id),
 ADD COLUMN type_name_snapshot text NOT NULL DEFAULT 'Other',
 ADD COLUMN project_manager_id uuid REFERENCES users(id),
 ADD COLUMN start_date date,
 ADD COLUMN target_completion_date date,
 ADD COLUMN priority text NOT NULL DEFAULT 'NORMAL' CHECK(priority IN ('LOW','NORMAL','HIGH','URGENT')),
 ADD COLUMN description text NOT NULL DEFAULT '',
 ADD COLUMN progress integer NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
 ADD COLUMN code_namespace text UNIQUE,
 ADD CONSTRAINT project_dates CHECK(start_date IS NULL OR target_completion_date IS NULL OR target_completion_date>=start_date);
UPDATE projects p SET project_manager_id=(
 SELECT m.user_id FROM project_members m JOIN users u ON u.id=m.user_id AND u.role='PM'
 WHERE m.project_id=p.id
) WHERE (SELECT count(*) FROM project_members m JOIN users u ON u.id=m.user_id AND u.role='PM' WHERE m.project_id=p.id)=1;

ALTER TABLE jobs
 ADD COLUMN job_type_id uuid NOT NULL DEFAULT md5('job-type:OTHER')::uuid REFERENCES job_types(id),
 ADD COLUMN type_name_snapshot text NOT NULL DEFAULT 'Other',
 ADD COLUMN description text NOT NULL DEFAULT '',
 ADD COLUMN responsible_person_id uuid REFERENCES employees(id),
 ADD COLUMN planned_date date,
 ADD COLUMN status text NOT NULL DEFAULT 'PLANNED' CHECK(status IN ('PLANNED','ACTIVE','BLOCKED','DONE','CANCELLED')),
 ADD COLUMN progress integer NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
 ADD COLUMN created_by uuid REFERENCES users(id),
 ADD COLUMN created_at timestamptz,
 ADD COLUMN version integer NOT NULL DEFAULT 1;
UPDATE jobs j SET created_by=p.created_by,created_at=p.created_at FROM projects p WHERE p.id=j.project_id;
ALTER TABLE jobs ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE jobs ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE jobs ALTER COLUMN created_by SET NOT NULL;

CREATE TABLE code_counters (scope text PRIMARY KEY, last_value bigint NOT NULL CHECK(last_value>0));
CREATE TABLE code_reservations (
 code text PRIMARY KEY, entity_id uuid UNIQUE NOT NULL, kind text NOT NULL CHECK(kind IN ('PROJECT','JOB')),
 issued_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO code_reservations(code,entity_id,kind,issued_at) SELECT code,id,'PROJECT',created_at FROM projects;
INSERT INTO code_reservations(code,entity_id,kind,issued_at) SELECT code,id,'JOB',created_at FROM jobs;
INSERT INTO code_counters(scope,last_value)
SELECT 'PROJECT:'||substring(code from 5 for 4),max(substring(code from 10)::bigint)
FROM projects WHERE code ~ '^PRJ-[0-9]{4}-[0-9]{3,}$'
GROUP BY substring(code from 5 for 4);
UPDATE projects SET code_namespace=substring(code from 5) WHERE code ~ '^PRJ-[0-9]{4}-[0-9]{3,}$';
DO $$
DECLARE p record; period text; n bigint;
BEGIN
 FOR p IN SELECT id,created_at FROM projects WHERE code_namespace IS NULL ORDER BY created_at,id LOOP
  period:=to_char(p.created_at AT TIME ZONE 'Asia/Bangkok','YYMM');
  INSERT INTO code_counters(scope,last_value) VALUES('PROJECT:'||period,1)
   ON CONFLICT(scope) DO UPDATE SET last_value=code_counters.last_value+1 RETURNING last_value INTO n;
  UPDATE projects SET code_namespace=period||'-'||lpad(n::text,greatest(3,length(n::text)),'0') WHERE id=p.id;
 END LOOP;
END $$;
-- Namespace can stay NULL only for legacy operator/fixture imports after this migration.
-- The application fills it atomically before creating a Job.
INSERT INTO code_counters(scope,last_value)
SELECT 'JOB:'||p.id::text,max(substring(j.code from length('JOB-'||p.code_namespace||'-')+1)::bigint)
FROM projects p JOIN jobs j ON j.project_id=p.id
WHERE j.code ~ ('^JOB-'||p.code_namespace||'-[0-9]{2,}$') GROUP BY p.id;

CREATE FUNCTION m1_immutable_human_code() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.code IS DISTINCT FROM OLD.code THEN
  RAISE EXCEPTION 'Human code is immutable' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER project_code_identity BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION m1_immutable_human_code();
CREATE TRIGGER job_code_identity BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION m1_immutable_human_code();
CREATE INDEX projects_type ON projects(project_type_id);
CREATE INDEX jobs_type ON jobs(job_type_id);
