# ADR-011 — M1 Alignment v3.0

2026-09-23 · Owner module: Codex · Implementation decision within D-021/D-022; no Staging migration approval.

## Data and compatibility

Append `003_m1_alignment.sql`; never edit 001/002. UUIDs and existing human codes remain unchanged. Backfill missing type as Other, progress=0, descriptions empty, dates/responsible person unknown=NULL. Existing jobs use their project's creator/date as a documented legacy fallback (not a claim about original Job event time). Existing ACTIVE/CLOSED project states remain.

Project manager is a nullable primary PM. Backfill only when exactly one valid PM membership exists. Preserve all existing memberships; PM authority always requires an actual PM role and membership, never an ordinary employee assignment. Replacing a primary PM explicitly removes that primary membership and adds the replacement in one audited transaction; legacy additional memberships stay until explicitly revoked. Only ADMIN/OWNER can do this.

Types have stable UUID/code, editable display name/order/enabled, optimistic version and audit. Codes are immutable even when unused; changing business meaning requires a new code. No delete endpoint. Existing records retain a type-name snapshot and can keep a disabled type; selecting a disabled type for new/different data is rejected. Seeds are insert-on-conflict-do-nothing and never reset operator customizations.

## Codes and concurrency

Project code `PRJ-YYMM-NNN` uses Bangkok creation month and a transactionally locked counter. Width is a minimum (1000 is not truncated). Jobs use `JOB-<project namespace>-NN` with a per-project counter. Legacy project codes stay unchanged and receive a separate namespace for new Job codes. Migration reserves all old codes and initializes high-water marks. A committed issued code is never reused; failed transactions before commit have not issued a code. No delete/reset API. The append-only reservation registry prevents accidental reuse; preserve registry/counters during backup and roll-forward.

All project/team mutations lock the project before testing PM authority; PM membership changes use the same lock. Assign/revoke lock the target user/employee so role/active status cannot race the policy. PM can target only active TECH for assign and TECH for revoke. ADMIN/OWNER behavior is preserved. TECH with project-level assignment reads all its jobs; job-only assignment reads only those jobs.

## Scope and verification

No financial tables or menus. D-022 Expense acceptance/correction cases are specification only for M3. Unit, API, native PostgreSQL concurrency/backfill/idempotency, backup and runtime privilege tests precede approval. Existing Staging contains real data and is never the test target. Staging stays on old release until Owner approves an explicit migration/deployment plan.
