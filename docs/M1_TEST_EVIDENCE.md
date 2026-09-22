# M1 Test Evidence — 2026-09-21

## Runtime password saved; API secret handoff — 2026-09-22

Owner completed both hidden password entries. Latest read-only boolean check confirms runtime password present=true; no password/hash retrieved. Enabled LOGIN for asas_m1_runtime after credential/role preflight and verified LOGIN=true. Migrator remains NOLOGIN and runtime grants stay restricted. The first guarded command hit shell-quoting syntax error before mutation; the literal SQL heredoc completed successfully. Actual password authentication from API is still NOT_RUN.

API configuration staged (not deployed): public CA, password-free runtime connection using Railway private references, and start command node --import tsx scripts/verify-runtime-db.ts. Restart Never, M1 branch and Auto deploy disabled verified. No administrator credential returned to API. PGPASSWORD field is prepared for Owner to enter the same existing runtime password directly and click Add; do not request the value in chat.

PASS: installed pg compatibility check confirms PGPASSWORD is used verbatim with a password-free connection URL, including URL-special characters (synthetic fixture only; no connection opened). Latest checked PR head a1a8c13 remains Draft/not merged/mergeable; CI [35732225713](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35732225713) SUCCESS. No application source change this checkpoint.

Phase A runtime connection/TLS/log scan pending API secret; B–E NOT_RUN. LINE=false, no Web URL, no merge/M2/production/paid upgrade or data deletion. Continue with one-shot verification once Owner confirms Add.

## Credential handoff verification — 2026-09-22

Owner reported typing a password but seeing no confirmation. Read-only check returned runtime password present=false and LOGIN enabled=false. The active Console was at a fresh shell prompt, with no password-confirmation prompt visible; the reason the prior entry did not persist is unconfirmed. No password/hash was selected or printed, and no credential was reset. Runtime login/API TLS and Staging B–E remain NOT_RUN.

Reopen the private psql password prompt for Owner to complete both entries. Do not infer success from typing or missing echo; confirm password presence with a boolean and later test the runtime connection. If a future reset is needed, an authorized administrator can set a new runtime password and update the API secret consistently; business data and the Owner web account are unaffected. Owner must enter credentials directly, never in chat. No deploy/merge/LINE/paid changes.

## Current handoff — 2026-09-22

CI [35728917876](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35728917876) for code 997e231 SUCCESS: typecheck; PGlite suite; native PostgreSQL suite including runtime denial/restore; Next build; Docker Web/API build and smoke; verified TLS with restricted runtime; untrusted CA rejection; M0 checks. No Railway HTTP deployment was performed by this CI.

PASS: staging runtime/migrator roles created and restricted (both still NOLOGIN), M1 schema checksums, console verify-full TLS. NOT_RUN: runtime credential login/API TLS and log scan, all Staging B–E/UAT. FAIL: none outstanding from the executed final checks; initial CI failure remains historical evidence.

Owner action required: complete the hidden password prompt in the existing Railway Postgres Console and report only completion. Browser credential-entry policy requires Owner handoff; no secret is requested in chat. Afterward configure API runtime credentials and run the one-shot verification before HTTP. Public CA is the only pending staged API variable change. LINE remains false. No Web trial URL yet; no paid upgrade, merge PR #2, M2, production, data deletion or restore overwrite.

Updated .env.example, M1_API_CONTRACT and M1_RAILWAY_SETUP to match the new TLS/runtime requirements and current authorization. Branch remains codex/milestone-1-foundation.

## Phase A — Runtime roles provisioned, Owner credential handoff pending

2026-09-22: CI [35728088352](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35728088352) on c4cb5df SUCCESS: native PostgreSQL privilege/restore tests, TLS API container smoke, Web container, build/typecheck and M0. Local tests 22 /20 PASS /0 FAIL /2 native-only SKIP; M0 45 checks PASS. Earlier CI failure 35727645655 was fixed before touching staging roles.

Railway staging: provision-m1-roles.sql transaction COMMIT. Runtime role has no elevated flags, memberships, schema CREATE, database CREATE/TEMP or owned tables (all false/0); migration history SELECT-only; audit SELECT/INSERT-only; migrator owns all18 M1 tables. Runtime and migrator remain NOLOGIN. Schema checksums match the committed Linux migration bytes. No rows/tables deleted, restored or overwritten. Console verify-full TLSv1.3/256 PASS; runtime credential/API connection NOT_RUN.

Public root CA added as DATABASE_SSL_CA in API Variables (one staged change; not deployed). No private key/secret retrieved. Existing API still exits without HTTP/DB; LINE=false, no Web/worker/public endpoint. Owner handoff opened the hidden psql password prompt for asas_m1_runtime; awaiting Owner entry, never request password text. B–E remain NOT_RUN and no Owner Web URL exists yet.

Added API startup checks rejecting elevated database privileges and missing modern TLS; one-shot scripts/verify-runtime-db.ts emits only fixed PASS/FAIL. New CI will exercise restricted-role startup and reject an untrusted CA. This latest guard is CODED/typecheck PASS, CI pending; not deployed.

### Phase A implementation update

Added verified TLS by default for production-mode PostgreSQL; DATABASE_SSL_CA accepts the public CA only. URL SSL overrides and disabled certificate verification are rejected. API startup/background errors use fixed messages. CI container smoke now configures a disposable PostgreSQL certificate and trusted CA. Runtime-role CI initially failed (run 35727645655) because pool.query discarded a connection after a deliberately denied statement; the test now pins one client and sets session authorization to the restricted role, preventing admin-session escalation. No staging mutation occurred. Typecheck PASS; local suite 22 total /20 PASS /0 FAIL /2 native-only SKIP; revised native/TLS CI pending.

## M1 Staging Phase A–E — 2026-09-22 (current checkpoint)

Owner authorized existing Railway Trial only; no upgrade/paid service, merge PR #2, M2 or production. LINE remains disabled even after A–E. Codex owns this work in the isolated M1 checkout; paused root M2 files are untouched.

- PASS: PR #2 head 3f92930, Draft/not merged/mergeable; CI [35718682955](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35718682955) success. Dashboard Trial shows $5.00/30 days at inspection.
- PASS (Phase A partial): Postgres 18.6 read-only console checks: TLS enabled, private hostname SAN, verify-full connection reports TLSv1.3/256 bits. SQL statement logging=none; error statement logging=error, parameter logging=-1/0. No secret values were read. These settings are not a claim that all provider logs are secret-free.
- CODED: one-time NOLOGIN runtime/migration role script and native privilege test; no staging role mutation yet. Typecheck PASS; local tests 21 total / 19 PASS / 0 FAIL / 2 native-only SKIP; native test awaits CI. See [M1_DATABASE_SECURITY](M1_DATABASE_SECURITY.md).
- NOT_RUN: actual runtime role/password and API TLS/log scan; B API HTTPS/security; C Web login/logout/expiry/mobile; D fixtures/scope/restart; E isolated backup/restore. No Web URL, no UAT claim, not Ready to Merge.

Historical checkpoints below are superseded by this section where different.

## Bootstrap Owner บน Railway — 2026-09-22

Owner ยืนยันกรอกตัวแปรแล้ว Codex ตรวจเฉพาะชื่อ BOOTSTRAP_USERNAME/BOOTSTRAP_PASSWORD และค่าถูกปิดบัง ไม่เปิดหรือคัดลอกรหัส Deployment 13df75fd-935d-4f60-b3c0-c82f67a3b96b จาก f12f66c ใช้ pnpm bootstrap/Never restart จบ Completed; runtime log ยืนยัน Owner created; password not logged. UI เคยตอบ500ตอนกดDeploy แต่ตรวจพบงานเริ่มแล้วจึงไม่สั่งซ้ำ

CI ของ f12f66c: [35711131799](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35711131799) SUCCESS. Bootstrapสำเร็จเป็นหลักฐาน migration/สร้างบัญชีบนPostgreSQL18 ไม่ใช่ผลLogin/HTTPS/UAT. Webยังไม่เปิด LINEปิด PR#2ยังDraft ไม่Merge/M2/Production/อัปเกรดเสียเงิน

Owner อนุมัติถอน bootstrap และยืนยันเฉพาะ DATABASE_URL ใน api เพิ่มหลัง automatic approval review ปฏิเสธครั้งแรกแล้ว จึงลบเฉพาะตัวแปรทั้ง3และ apply สำเร็จ: cleanup deployment e49929ec-3dde-4f72-9543-84620c1ae01d Completed; งาน13df75fd/4a27f1daเดิมเป็น Removed. ค่าปัจจุบันของapiเหลือ5variablesไม่มีbootstrap/DBผู้ดูแล; commandชั่วคราวเพียงพิมพ์สถานะแล้วจบทันที ไม่มีHTTPหรือDBconnection, restart Never, Auto deploy disabled. ไม่ลบฐานข้อมูล/บัญชีOwner และไม่อ้างว่าmetadataของdeploymentเก่าถูกลบหมด. ขั้นถัดไป: เตรียมruntime DB roleที่ไม่มีDDL/credentialผู้ดูแล, ตรวจTLS/HTTPS/backup/restoreก่อนให้ผู้ทดลองเข้าใช้


## สถานะส่งต่อ Railway — 2026-09-22

- GitHub App: บันทึกและตรวจ Only select repositories = asas-job-cost-workforce-core เพียง1repo; Railway มองเห็น source แล้ว ไม่ต้องขออนุมัติสิทธิ์เดิมซ้ำ
- PostgreSQL18 template บน volume เปิด Online แล้วใน Trial เป็นฐานใหม่ ไม่มี app schema/ข้อมูลผู้ทดลอง; ไม่ถือ DEPLOYED_STAGING ของทั้งแอป
- API build ครั้งแรก 7c0efb71 ล้มเหลวที่ Railpack prepare: ใช้ main/M0 และ0variables ไม่ได้เริ่ม runtime. แก้ staging configuration เป็น branch codex/milestone-1-foundation + deploy/Dockerfile.api แล้ว แต่ยังไม่ deploy ใหม่
- API มี9 staged changes: 6variables (Dockerfile/NODE_ENV/HOST/PORT/LINE_ENABLED=false/DATABASE_URL reference), branch M1, restart NEVER, start pnpm bootstrap; Auto deploy disabled. Credential Postgres ผู้ดูแลใช้เฉพาะ bootstrap jobชั่วคราว ห้ามใช้เปิด HTTP runtime ต้องเปลี่ยนเป็น runtime roleและถอนbootstrap varsก่อน
- รอ Owner กรอก BOOTSTRAP_USERNAME/BOOTSTRAP_PASSWORD ใน Railway Variables เองอย่างน้อย12ตัว ไม่ส่งรหัสในแชท ไม่ใช้รหัส demo เดิม ยังไม่กด Deploy จนตรวจค่าตั้งต้นครบ
- ยังไม่สร้าง Web/worker; HTTPS/UAT/restore/DB role/TLS/real LINE ยัง NOT_RUN; ไม่อัปเกรดแผน/merge PR #2/M2/Production
- ข้อควรระวัง: Railway Deploy Changes อาจรวมบริการอื่นที่เปลี่ยนค้างไว้ ต้องตรวจ source commit/branch/commandของทุกserviceก่อนกด ไม่ถือรายการท้ายmodalว่าเป็นบริการเดียวที่จะเริ่ม


อัปเดตผล: commit 0d68bba push แล้ว; [CI 35709354964](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35709354964) SUCCESS ทุก step รวม native PostgreSQL, Next build, Docker Web/API build และ smoke health ทั้งสอง container, M0 45 checks. Owner อนุมัติ Railway GitHub App เฉพาะ Repository นี้แล้ว ตรวจพบ installation มีอยู่และเลือก All repositories จึงลดเป็น Only select repositories /asas-job-cost-workforce-core และตรวจค่าที่บันทึกแล้วสำเร็จ App เดิมมี read/write actions, administration, checks, code, statuses, deployments, PRs, workflows ไม่ได้เพิ่มชนิดสิทธิ์; ยังไม่ deploy.


## Railway Trial preparation — 2026-09-22

- tsc --noEmit: PASS
- tsx --test --test-concurrency=1 tests/*.test.ts: 20 total /19 PASS /0 FAIL /1 SKIP (native restore ไม่มี TEST_DATABASE_URL บนเครื่อง)
- runtime-schema test: SELECT อย่างเดียว, reject missing/modified/extra migrations PASS บน PGlite ไม่ใช่หลักฐาน runtime role บน Railway
- Docker build/Web smoke เพิ่มใน CI: PENDING รุ่นใหม่
- Railway UI: asas-m1-staging/environment staging สร้างแล้ว; Limited Trial $5/30วัน; ไม่มี service/deploy/DB/LINE traffic
- Configure GitHub App ถูก automatic approval review ปฏิเสธก่อนเปิด ต้องรับ Owner approval สำหรับ repository access ไม่มีการให้สิทธิ์สำเร็จ
- DEPLOYED_STAGING=NO, REAL_LINE=NOT_RUN, UAT_PASSED=NO; หลักฐานด้านล่างเป็น historical commit ตามที่ระบุ

## รอบเตรียม Staging — 2026-09-22

Baseline PR #2 head 5328b4273ef7c2536097747e63469392fdaa74a0 ตรวจ GitHub: Draft=true, merged=false, mergeable=true; main 0d5da8a, behind0/ahead2; [CI baseline 35610665915](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35610665915) SUCCESS

เพิ่ม tests/staging-security.test.ts (HTTPS guard/cookie/CSRF/logout, rate-limit spoof/lockout/global, byte-exact signature/empty Verify) และ tests/native-restore.test.ts (isolated native PG schemas, Project A/B/Site/Job/assignment/audit/LINE mapping, no transient credentials, scope/revocationหลังrestore) ผลรอบสุดท้ายบันทึกด้านล่าง แยกจาก baseline

Staging HTTPS/proxy/DB TLS, LINE จริง, provider restart/PITR/backup scheduler, Owner UAT ทั้งหมด **NOT_RUN** ไม่มีการสมัคร/ชำระเงิน/deploy/ส่งข้อความ และยังไม่ Ready to Merge

แผนทดสอบที่เตรียม: [matrix](M1_STAGING_TEST_MATRIX.md), [UAT](M1_OWNER_UAT.md), [pilot checklist](M1_LINE_PILOT_CHECKLIST.md), [deployment plan](M1_STAGING_PLAN.md) ไม่ใช้สถานะเอกสาร PREPARED เป็น TESTED_STAGING

## หลักฐานเดิม 2026-09-21

ผู้ทดสอบ: Codex · branch codex/milestone-1-foundation จาก main 0d5da8a · ข้อมูลทั้งหมดสมมติ

Artifact implementation ที่ตรวจ: `69c073944d8c2149e9d5f903af6da9b6d08a4ae3` · [Draft PR #2](https://github.com/naochanma-code/asas-job-cost-workforce-core/pull/2) · [GitHub Actions run 35610393373](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35610393373) verify job SUCCESS: frozen install, strict typecheck, PGlite tests, native PostgreSQL 17 tests, Next build และ M0 regression ทุก step ผ่าน

## ผลที่ตรวจแล้วบนเครื่อง

| การตรวจ | ผล / หลักฐาน |
| --- | --- |
| TypeScript strict | PASS `pnpm typecheck`; web tsconfig strict=true |
| Next build | PASS `pnpm build` สร้าง static route / และ API rewrite; ไม่มี deployment |
| Foundation API/database suite | PASS 9 subtests + parent ใช้ Fastify inject กับ PGlite PostgreSQL; tests/foundation.test.ts |
| Persistence/backup | PASS 1 test: ปิด–เปิดฐาน disk, consistent backup, restore ลงฐานว่าง, reject non-empty/tampered backup; tests/persistence.test.ts |
| Browser login + no Job | PASS บัญชี Admin จริงของ local test สร้างลูกค้า/Project A ที่ไม่มี Site/Job แล้วมอบหมาย TECH ไม่มีช่องถาม Job |
| Browser scope/persistence | PASS TECH เห็น A หลัง login และ refresh; TECH2 ไม่เห็น A; logout/login เป็น session จริง ไม่มี role selector |
| M0 regression | PASS 24 + 14 + 7 = 45 checks และ independent .NET ZIP reader; ไม่แก้ prototype |
| Dependency audit | PASS `pnpm audit --prod`: No known vulnerabilities found ณ วันที่ตรวจ ไม่ใช่ security audit ของระบบ |
| Native PostgreSQL 17 CI | PASS ชุด API/SQL/permission/LINE mock เดียวกันกับ local; backup disk case ยังคงใช้ PGlite ไม่ใช่ provider restore |
| Documentation links | PASS local links 96 รายการไม่มีไฟล์หาย; git diff --check ผ่าน |

Node test runner รายงาน 11 tests PASS (รวม parent 1 และ leaf cases 10); ไม่ใช่ 11 independent acceptance tasks

API cases ครอบคลุม missing/forged/expired session, CSRF Origin, wrong password, multiple Owner audit, Owner-only account creation, API ไม่มี password/financial fields, optional scope constraints, duplicate assignment rollback รวม audit, PM cross-scope/stale version/ถอนสิทธิ์, TECH forbidden edit, signed LINE body/destination/dedupe, one-use nonce, retry/lease, recheck access ก่อนส่ง, group wrong actor/expired/replay, unlink/deactivate/logout และ health

LINE transport เป็น fake sender ทั้งหมด ไม่มี request ไป LINE OA ผลนี้ไม่แทน real integration และไม่เป็น Owner UAT ของ M1

## ยังไม่ตรวจ / ข้อจำกัด

- Native PostgreSQL CI ผ่านตาม run ด้านบน; load/concurrency testing และ provider backup restore ยัง NOT_RUN
- HTTPS staging, DB TLS, secret rotation, reverse proxy rate limit และ provider backup/PITR: NOT_RUN
- LINE จริงกับ OA/กลุ่มที่ Owner มี: NOT_RUN รอระบุ environment/allowlist/credentials ผ่าน secret manager
- Owner UAT M1: NOT_RUN การยืนยัน 7 งานก่อนหน้านี้เป็น M0 เท่านั้น
- ไม่มี password recovery/MFA/role-change/group-rebind UI, automated backup scheduler หรือ DEAD payload TTL purge; ไม่มีเวลา/OT/ค่าใช้จ่าย/รูปบิลใน M1

สถานะ M1: IN_PROGRESS; ยังไม่ READY_TO_MERGE / UAT_PASSED / PRODUCTION_READY

## ผล local รอบเพิ่ม tests (2026-09-22)

- frozen offline install, strict typecheck และ Next build PASS
- Node runner 19 total: 18 PASS / 0 FAIL / 1 SKIP (native restore ต้อง TEST_DATABASE_URL; CI PostgreSQL17 ผ่านตามหลักฐานด้านล่าง)
- M0 regression 24+14+7 =45 checks PASS; git diff --check PASS
- ผลนี้มาจาก isolated M1 checkout ไม่มี migration003/time API ของ M2 ไม่มี real LINE หรือ staging transport

## ผล CI รอบ Staging preparation

Artifact code/tests/docs: 45be1acfe136338df8867dd3ba98ecd6f841a212; [Foundation run 35685633979](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35685633979), verify job 106611718741 SUCCESS ทุก step: frozen install/typecheck/PGlite tests/native PostgreSQL17 tests/Next build/M0 regression

Native restore case PASS จริงใน CI ไม่ได้ skip ใน native run: แยก source/target schemas, restore แล้ว reopen connection, ตรวจ A/B/Site/Job/assignment/audit/LINE mappings และทดสอบ scope กับการถอน assignment หลัง restore ไม่ใช่ provider backup/PITR หรือ Staging restart

Commit หลักฐานถัดจาก45be1acเปลี่ยนเอกสารเท่านั้น; ไม่อ้างว่า CI commitเก่าคือ headใหม่ ผล PRยังDraft/ไม่merge/ไม่deploy/M2พัก
