# M1 — Browser recovery checklist

Status: PREPARED / NOT_RUN. This procedure creates no PASS evidence by itself. Module owner: Codex. Use the current M1 checkout and record its exact commit. Main evidence remains in [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md), [PROJECT_STATUS](PROJECT_STATUS.md), and [S05](M1_STAGING_TEST_MATRIX.md).

## Evidence boundaries

| Execution | What it proves | What it does not prove |
| --- | --- | --- |
| Local PGlite + real browser below | Restored synthetic accounts can log in; browser scope and session behavior survive logical recovery | Staging HTTPS, provider recovery, scheduled backup, PITR, real LINE or Owner acceptance |
| `tests/native-restore.test.ts` on disposable PostgreSQL | Native restore/reopen, API login, old-session rejection, scope/revocation and omitted transient credentials | Browser or provider recovery UAT |
| Approved isolated Staging recovery + browser | Only the checks actually observed against that recovery environment | Scheduled backup/PITR or full M1 acceptance unless separately evidenced |

## Safety and prerequisites

- Use only newly generated synthetic accounts/data. Never use the existing Staging backup or production data as a test fixture; never point `TEST_DATABASE_URL` at either one or a real-data copy.
- Keep source and target separate, outside OneDrive/Git, with private local access. The logical CLI writes unencrypted JSON containing password hashes; this local recipe is synthetic-only. Real backup handling requires the separately approved encrypted workflow.
- No provider database/service is assumed to exist. This checklist authorizes no deployment, paid service, changes to live connection settings, or overwrite. Confirm any required write access to the chosen private local directory before execution.
- Keep both LINE modes false, do not start a worker, and use loopback ports only. Stop local API before every embedded database backup/restore; PGlite permits one process per directory.
- Stop on command failure. Do not retry into an existing target or delete directories to make a retry work. Verify resolved paths before any later cleanup.

## Local synthetic browser drill

Commands below are PowerShell, run from the M1 checkout with existing dependencies installed. Use fresh shells without inherited live credentials. Check that ports 3000/3001 are available; do not stop an unrelated process.

```powershell
$m1Repo = (Get-Location).Path
$m1Drill = Join-Path $env:LOCALAPPDATA ('ASAS-CoreApp/recovery-drills/' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $m1Drill | Out-Null
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:TEST_DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:MIGRATION_ROLE -ErrorAction SilentlyContinue
$env:NODE_ENV = 'development'
$env:LINE_ENABLED = 'false'
$env:LINE_ENROLLMENT_ENABLED = 'false'
Push-Location $m1Drill
try {
  & (Join-Path $m1Repo 'node_modules/.bin/tsx.cmd') (Join-Path $m1Repo 'scripts/seed-local.ts')
  if ($LASTEXITCODE -ne 0) { throw 'Synthetic seed failed; stop drill' }
} finally { Pop-Location }
$env:LOCAL_DB_DIR = Join-Path $m1Drill '.local/pgdata'
$env:WEB_ORIGIN = 'http://127.0.0.1:3000'
$env:HOST = '127.0.0.1'
$env:PORT = '3001'
pnpm dev:api
```

`seed-local.ts` calls `openDatabase()` without a directory argument: it **does not honor LOCAL_DB_DIR**. Running it from the fresh drill directory is deliberate. Its generated credentials are in that directory's `.local/demo-accounts.json`; use them privately, never print or attach them to evidence. It creates accounts only, not Project fixtures.

In a second terminal at the same checkout, set `API_URL=http://127.0.0.1:3001` for that process and run `pnpm dev:web`. Open `http://127.0.0.1:3000`.

1. As synthetic ADMIN, create a customer, Project A without Site/Job, and Project B with Site and two Jobs. Assign synthetic TECH to A only. Record synthetic IDs and expected scope privately. Use separate browser profiles for ADMIN and TECH.
2. As TECH, verify A opens without a Job prompt; B is absent and its direct URL is denied. Keep this authenticated browser profile open so its pre-backup cookie remains available for the stale-session check. Do not copy cookie values.
3. Stop the API with Ctrl+C, keeping browser/Web available. In the original terminal, back up the source, then migrate and restore a fresh target:

```powershell
$env:LOCAL_DATABASE_OFFLINE = 'true'
$m1Snapshot = Join-Path $m1Drill 'synthetic-snapshot.json'
pnpm backup backup $m1Snapshot
if ($LASTEXITCODE -ne 0) { throw 'Backup failed; stop drill' }
$env:LOCAL_DB_DIR = Join-Path $m1Drill 'restored-pgdata'
pnpm migrate
if ($LASTEXITCODE -ne 0) { throw 'Target migration failed; stop drill' }
pnpm backup restore $m1Snapshot
if ($LASTEXITCODE -ne 0) { throw 'Restore failed; stop drill' }
Remove-Item Env:LOCAL_DATABASE_OFFLINE -ErrorAction SilentlyContinue
pnpm dev:api
```

The CLI verifies the schema and rejects a nonempty target; it does not create/migrate the schema during restore. Do not seed the target.

4. Reload TECH's existing browser profile before logging in again: the old session must be rejected. Then log in with the same synthetic credentials and verify A/no-Job behavior and denied B again. Record actual UI/API status, not cookie values.
5. Log ADMIN in again. Confirm restored customer/Projects/Jobs/assignment, then revoke TECH's A assignment through the application. A must disappear and its direct URL must be denied after refresh.
6. Assign TECH only one Job in B. Verify the TECH browser shows B and only its assigned Job, without visibility of the sibling Job. Verify assignment/revocation audit through an authorized read-only inspection; do not infer audit success from UI alone.
7. Logout TECH and verify refresh cannot reopen an authenticated page. Stop API and Web when finished. Record elapsed restore-to-successful-login time as this drill's duration, not a production RTO guarantee.

Optional existing native regression, only with an explicitly verified disposable PostgreSQL `TEST_DATABASE_URL` supplied privately:

```powershell
pnpm exec tsx --test --test-concurrency=1 tests/native-restore.test.ts
```

An unset `TEST_DATABASE_URL` skips that test; SKIP is not native recovery PASS. The test creates and drops its own random schemas.

## Isolated Staging browser gate

Before execution, identify an approved empty recovery destination and an isolated API/Web routing plan, exact tested release/schema, synthetic source fixtures, private operator/runtime credentials, TLS and least-privilege controls, and available cost allowance. If these are absent, retain NOT_RUN and present the concrete plan for approval. Do not repoint the active Pilot or reuse a real-data recovery database as the synthetic target.

With that environment approved and available, use the existing logical CLI (`pnpm backup backup <private-file>` / `pnpm backup restore <private-file>`) with each destination selected privately. Prepare the empty target's matching schema using the approved migration operator; never run `seed-local.ts` on Staging. Repeat browser steps 2–7 through the isolated HTTPS endpoint, including the old-session check on the same isolated origin before/after recovery. Check Secure/HttpOnly/SameSite flags without recording values, restored scope/audit, and no restored session/nonce/pending reply credentials. Keep LINE disabled throughout.

Record release SHA, environment/evidence level, time, synthetic fixture checks, old-session result, new login, scope/revoke/Job visibility, logout, observed recovery duration, and individual PASS/FAIL/NOT_RUN results. Store no passwords, connection strings, cookies, raw backups or HAR files in Git/chat/logs. Scheduled daily backup trigger, retention/operator agreement, and provider PITR remain separate checks; this browser drill does not close them.
