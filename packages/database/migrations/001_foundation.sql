CREATE TABLE users (
 id uuid PRIMARY KEY, username text UNIQUE NOT NULL CHECK(username=lower(username)),
 display_name text NOT NULL, password_hash text NOT NULL,
 role text NOT NULL CHECK(role IN ('OWNER','ADMIN','PM','TECH')), active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE employees (id uuid PRIMARY KEY, user_id uuid UNIQUE NOT NULL REFERENCES users(id), code text UNIQUE NOT NULL, display_name text NOT NULL, active boolean NOT NULL DEFAULT true);
CREATE TABLE sessions (token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE login_attempts (key text PRIMARY KEY, failures integer NOT NULL, blocked_until timestamptz NOT NULL);
CREATE TABLE customers (id uuid PRIMARY KEY, code text UNIQUE NOT NULL, name text NOT NULL, created_by uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE sites (id uuid PRIMARY KEY, customer_id uuid NOT NULL REFERENCES customers(id), name text NOT NULL, UNIQUE(customer_id,id));
CREATE TABLE projects (
 id uuid PRIMARY KEY, code text UNIQUE NOT NULL, customer_id uuid NOT NULL REFERENCES customers(id), site_id uuid,
 name text NOT NULL, status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','CLOSED')),
 version integer NOT NULL DEFAULT 1, created_by uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(customer_id,site_id) REFERENCES sites(customer_id,id)
);
CREATE TABLE jobs (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id), code text UNIQUE NOT NULL, name text NOT NULL, UNIQUE(project_id,id));
CREATE TABLE project_members (project_id uuid NOT NULL REFERENCES projects(id), user_id uuid NOT NULL REFERENCES users(id), PRIMARY KEY(project_id,user_id));
CREATE TABLE job_assignments (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id), job_id uuid,
 employee_id uuid NOT NULL REFERENCES employees(id), created_by uuid NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz,
 FOREIGN KEY(project_id,job_id) REFERENCES jobs(project_id,id)
);
CREATE UNIQUE INDEX assignment_active_scope ON job_assignments(project_id,job_id,employee_id) NULLS NOT DISTINCT WHERE revoked_at IS NULL;
CREATE INDEX assignment_employee ON job_assignments(employee_id,project_id) WHERE revoked_at IS NULL;
CREATE TABLE audit_logs (id uuid PRIMARY KEY, actor_id uuid REFERENCES users(id), action text NOT NULL, entity_id uuid, details jsonb NOT NULL DEFAULT '{}', occurred_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE line_accounts (line_user_id text PRIMARY KEY, user_id uuid UNIQUE NOT NULL REFERENCES users(id));
CREATE TABLE line_link_nonces (nonce_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), expires_at timestamptz NOT NULL);
CREATE TABLE line_binding_codes (code_hash text PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id), created_by uuid NOT NULL REFERENCES users(id), expires_at timestamptz NOT NULL);
CREATE TABLE line_group_bindings (group_id text PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id), created_by uuid NOT NULL REFERENCES users(id));
CREATE TABLE line_event_inbox (id text PRIMARY KEY, payload jsonb NOT NULL, state text NOT NULL DEFAULT 'RECEIVED', attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz, received_at timestamptz NOT NULL DEFAULT now());
