# M1 Database runtime security

Owner scope 2026-09-22: Railway Trial only, Phase A before Web/API; LINE stays disabled through A–E. No destructive staging tests or staging restore overwrite.

## One-time role provisioning

Operator reviews and runs `deploy/provision-m1-roles.sql` as the existing database administrator inside the Postgres console. It creates two initially NOLOGIN roles, without a password in SQL/source/history:

- `asas_m1_migrator`: owns the existing public schema and M1 tables. Only the existing administrator can SET ROLE to it for approved migrations; no membership is granted to the runtime.
- `asas_m1_runtime`: schema USAGE and application DML, SELECT-only migration history, SELECT/INSERT-only audit. No ownership, CREATE/TEMP, TRUNCATE, role administration, replication, superuser or BYPASSRLS.

The transaction refuses existing role names or a public schema other than the 18 M1 tables and two expected migration names. Operator must also verify migration checksums against the release before execution. Never rerun by dropping existing roles. It changes ownership/grants only, with no row deletion, table drop or credential rotation. No default grants on future tables.

Owner sets the runtime password through a private `psql` password prompt, never a SQL literal or chat. Keep log_statement=none; do not enable SQL/parameter logging. Runtime LOGIN is enabled only after the password is set and the restricted role is verified. Owner then enters that same password directly in API secret variables; use provider references, never paste a resolved connection string into chat/logs/Git. No admin credential returns to the API.

The browser's credential-entry handoff is required before entering a new password. This is separate from the Owner's authorization to use Railway Trial. Codex must not generate/type a new browser credential on the Owner's behalf.

## TLS evidence and remaining gate

Read-only console check on 2026-09-22: PostgreSQL 18.6; ssl=on. Private hostname certificate SAN matched; `PGSSLMODE=verify-full` with the local public root certificate connected successfully; `pg_stat_ssl` for that connection reported TLSv1.3 / 256 bits.

This proves the Postgres console client's verified connection, **not the future Node API connection**. The API still needs explicit trusted public CA configuration, hostname verification and its own `pg_stat_ssl` check. Never copy a private key or database password when exporting the public root certificate. Do not use `rejectUnauthorized=false`, `sslmode=no-verify` or `NODE_TLS_REJECT_UNAUTHORIZED=0`.

Certificate validity observed: 2026-09-22 through 2028-12-20; provider template may renew it. Recheck public CA trust after provider certificate changes before restarting clients. Source: [Railway PostgreSQL image](https://github.com/railwayapp-templates/postgres-ssl/blob/main/init-ssl.sh).

## Non-destructive staging verification

Verify role attributes, memberships, database CREATE/TEMP and schema CREATE privileges using catalog queries. Verify table ownership and schema_migrations/audit grants. Connect using the runtime credential with verified TLS and execute normal M1 flows. Do not try DROP/DELETE against staging to prove denial.

`tests/native-runtime-role.test.ts` attempts forbidden DDL, migration/audit mutation and escalation only in a newly created disposable CI database with random role names. It verifies normal writes and migration-role DDL separately. CI cleanup deletes only those resources created by that test, never the Railway database.

## Current stop point

Role script CODED; native verification pending this commit's CI. Staging roles/password/API TLS not provisioned yet. Phase B–E are NOT_RUN. No Web URL is available. Do not treat old bootstrap or CI evidence as deployed API/UAT/backup evidence.
