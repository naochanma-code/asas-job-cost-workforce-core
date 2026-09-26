# ประวัติสถานะ M1 ก่อนรายงาน Owner รอบล่าสุด

## 24 กันยายน 2026 — DEPLOYED_STAGING / รอ Owner UAT

Owner อนุมัติ Backup/Recovery และ migration003/grants/Deploy SHA cda461d แล้ว ทั้ง API/Web Online; encrypted backup และ isolated restore PASS; legacy business digest ไม่เปลี่ยน; HTTPS24 checks และ restart persistence PASS; log sample ไม่พบ secret patterns LINE=false ไม่เปลี่ยนแผน ไม่ Merge/M2/M3/Production ดู [หลักฐาน Staging](M1_ALIGNMENT_STAGING_EVIDENCE.md) สถานะรออนุมัติด้านล่างเป็นประวัติที่แก้ไขแล้ว


สถานะในไฟล์นี้เป็นประวัติ ให้ดู PROJECT_STATUS.md สำหรับสถานะปัจจุบัน

# PROJECT STATUS

## Owner Web login handoff — 2026-09-22

Release 4fcb29e deployed: API 66ce64bf-c1f8-4a1a-abc2-5292b33c734c and Web 4202ccc1-70f1-480b-af33-8b1a7c8da635 ACTIVE; Details on both independently match full commit and M1 branch. Post-deploy / and /api/health returned 200, database ready. API startup message verified; limited credential-pattern scan negative. Owner browser handoff pending. This evidence-only documentation update does not change deployed application code.


Staging URL: https://web-staging-cb6f.up.railway.app/ . Login page rendered at 390x844 with scrollWidth=390 and no horizontal overflow; authenticated mobile screens remain NOT_RUN. PostgreSQL Settings showed Add Public Access (not enabled); API remains unexposed. Latest Trial indicator $4.99 /30 days; no upgrade or paid add-on.

Release 4fcb29e5625caad99b2d6c3056ebd08a344b7728: CI 35738098892 verify job SUCCESS including both test suites, native PostgreSQL, typecheck, Web build, both Docker builds, Web/API smoke, verified TLS, runtime-role backup CLI and M0 checks. Local: 22 PASS, 2 native SKIP, 0 FAIL; M0 45/45 PASS. PR #2 remains Draft, not merged, mergeable; main base 0d5da8a and behind count 0. Both services now have a non-secret M1_RELEASE_COMMIT annotation; deployment metadata must independently match it (annotation does not pin source).

Current gates: A PASS; B HTTPS/health/CSRF/anonymous scope/forwarded spoof checks PASS, live cookie/rate checks pending; C Login page/mobile PASS, Owner login/logout/expiry NOT_RUN; D synthetic role/Project A+B/restart tests NOT_RUN; E isolated Staging restore NOT_RUN. Owner must enter existing Web credentials directly; no credential requested in chat. LINE=false. No claim of overall A-E/UAT acceptance.

## Web/API Staging live checkpoint — 2026-09-22

API deployment abc2992b-7b07-4f56-84f2-3fbda1e12ac4 ACTIVE, release 9c70a0805ee6d891bfdf0249d171c009b36e0627 / codex/milestone-1-foundation. Runtime-only DB credential, verified TLS startup gates, private API (no public domain), HTTPS WEB_ORIGIN set to https://web-staging-cb6f.up.railway.app. Web deployment e193de78-4523-4f55-a63d-1ef8b686af55 serves HTTPS through private API. Auto deploy disabled on both services; LINE=false.

PASS live: HTTPS /api/health 200 with database ready; HTTP redirects 301 to HTTPS; anonymous /api/me and /api/projects 401; missing/foreign Origin POST 403; spoofed forwarded headers do not authenticate (401); LINE webhook disabled (503); no-store/nosniff headers. Visible API startup log has fixed success message and no connection-URI/private-key/bearer/password-assignment pattern. This scan covers only the inspected deployment log.

Owner login handoff opened on Web. Authenticated role tests, Secure Cookie attributes, logout/session expiry, runtime restart persistence and isolated Staging restore remain NOT_RUN; do not infer UAT success from health checks. API rate limit live probe deferred during Owner login to avoid shared-proxy throttling.

Preparing Phase E uncovered backup CLI calling migrations even for a read-only snapshot. Changed CLI to verify existing schema only; restore destination must be prepared separately by migration operator. Errors now emit a fixed category instead of potentially sensitive connection details. Added CLI round-trip/refusal-to-overwrite and credential-safe failure regression tests; local M1 suite: 24 tests, 22 PASS / 2 native PostgreSQL SKIP / 0 FAIL; typecheck PASS. CI and deployment of this CLI change pending. No Staging restore or production/LINE/paid/merge action.

## Phase A live verification PASS — 2026-09-22

Railway API one-shot deployment 90dc89a1-a4c0-4d23-baaa-0cd77733e6e0 completed from PR #2 commit 9c70a0805ee6d891bfdf0249d171c009b36e0627 (CI 35734400358 SUCCESS). Deployed command scripts/verify-runtime-db.ts reported PASS for runtime privileges, schema and verified TLS using the Owner-entered PGPASSWORD. No HTTP opened; runtime role only, no administrator credential. Visible deployment log scan found no connection URI/private-key/bearer/password-assignment patterns; this is limited to the inspected log, not a proof about every historical provider log. Trial balance observed $4.99/30 days.

Web service 0664e9f2-1450-4ba0-80ad-45a2b01bc2a1 created from M1, with deploy/Dockerfile.web, internal API reference and PORT3000; no database credentials. Initial build 74f5003d-c8f1-42ef-9878-02c63366ddd0 uses a temporary exit-only command to reserve the service/domain before opening API. Web auto deploy disabled. Phase B/C configuration in progress; B–E live functional/UAT/restore NOT_RUN, LINE=false.

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


## ล่าสุด 2026-09-22 — Railway Trial ได้รับอนุมัติ

Owner เลือก Railway Trial และอนุมัติเริ่ม Staging แล้วตาม D-017 ใช้เฉพาะเครดิตทดลอง ห้ามเพิ่มแพ็กเกจ/ขนาด/บริการเสียเงินเอง ต้องแจ้งและรอ Owner อนุมัติก่อน ยังห้าม Merge PR #2, Production และ M2

Codex ดูแล M1 บน isolated checkout เดิม สร้าง Railway project asas-m1-staging/environment staging แล้ว ยังไม่มี service/database/application deployment Dashboard แสดง Limited Trial $5/สูงสุด30วัน ต้องพิสูจน์ outbound ก่อน LINE

CODED: Dockerfiles Web/API และ runtime ตรวจ schema โดยไม่ migrate; TESTED_LOCAL: typecheck PASS, 20 tests/19 PASS/1 native-only SKIP; TESTED_CI: PASS 0d68bba/35709354964; DEPLOYED_STAGING: NO; REAL_LINE/UAT: NOT_RUN; READY_TO_MERGE: NO

ติดขัด: automatic approval review ปฏิเสธ Configure GitHub App เพราะอาจให้ Railway เข้าถึง GitHub ต้องให้ Owner อนุมัติ/ติดตั้งเฉพาะ naochanma-code/asas-job-cost-workforce-core ไม่ให้ทุก repository และไม่ใช้ทางเลี่ยง

ถัดไป: CI/สิทธิ์ GitHub → DB ใหม่/role/TLS → Web/API ปิด LINE → HTTPS/backup/restore → LINE checklist ดู [คู่มือ Railway](M1_RAILWAY_SETUP.md)

ข้อความด้านล่างเป็นประวัติก่อนอนุมัติ Trial ไม่ห้าม Trial ที่อนุมัติใหม่

## ล่าสุด 2026-09-22 — เตรียม M1 Staging / Real LINE Pilot เท่านั้น

Owner สั่งกลับมาทำ M1 ตาม PR #2: **ห้าม Merge, ห้ามเริ่ม/พัฒนา M2 ต่อ, ห้าม Deploy ทุก environment จนอนุมัติ และห้าม Production** Codex รับผิดชอบ tests/docs ของ M1 คนเดียวบน `codex/milestone-1-foundation` ใน isolated checkout `.local/m1-staging` งาน Web Time/OT ที่ค้างจากคำสั่งก่อนหน้าอยู่เฉพาะ working tree ของ `codex/milestone-2-web-time-ot` ถูกพัก ไม่รวม PR #2 และไม่ใช้ local DB ที่มี migration M2 เป็น staging

ผลตรวจเริ่มรอบ: PR #2 Draft/open/not merged, mergeable=true; head 5328b42, main 0d5da8a; behind 0 / ahead 2; CI 35610665915 SUCCESS ทั้ง PostgreSQL17/PGlite/typecheck/build/M0 ก่อนเพิ่ม tests รอบนี้ ไม่มี conflict ที่ต้อง merge/rebase

จัดทำ [แผนและราคา Hosting](M1_STAGING_PLAN.md), [LINE checklist](M1_LINE_PILOT_CHECKLIST.md), [Owner UAT 10 ข้อ](M1_OWNER_UAT.md), [Staging test matrix](M1_STAGING_TEST_MATRIX.md), [ข้อมูลสมมติ A/B](fixtures/m1-pilot.json) และเพิ่ม security/native restore tests ผลรอบใหม่บันทึกใน [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md)

CODED: M1 เดิม + tests ใหม่; TESTED_LOCAL: PASS typecheck/build/18 tests (native restore 1 SKIP บนเครื่อง)/M0 45 checks; TESTED_CI: PASS PostgreSQL17 รวม native restore ตาม run 35685633979 (code 45be1ac); DEPLOYED_STAGING: NO; REAL_LINE: NOT_RUN; UAT_PASSED: NO; READY_TO_MERGE: NO

รอ Owner ตัดสินใจ provider/งบ และวัน/ช่างที่ร่วม pilot ไม่ขอ secret ผ่านแชทหรือ GitHub รายละเอียด deployment blockers (runtime DB role/migrations, proxy rate limit, TLS, logs, enrollment IDs และ cleanup/backup) อยู่ในแผน ต้องตรวจ/แก้ก่อน live pilot ไม่ใช่ข้ออ้างให้เปิดจริงโดยอัตโนมัติ

ความขัดแย้งกับคำสั่งเก่าที่พัก LINE/เริ่ม M2: ใช้คำสั่งล่าสุดพัก M2 และเตรียม M1 ไม่ต้องถามซ้ำ ส่วน policy OT ที่ Owner ยืนยันยังเก็บในงานที่พักไว้ ไม่ได้ implement ใน M1

ข้อความด้านล่างเป็นประวัติรอบ Foundation เดิม ขั้นตอนปัจจุบันใช้แผนด้านบน

2026-09-21 · MASTER v2.5 + คำสั่งเริ่ม M1 §19 · ผู้รับผิดชอบ Codex

**Milestone 0: OWNER_ACCEPTED / MERGED** — PR #1 merge a7e5c9e08a4d2c8185a12ef65f705a190c243a8d; main 0d5da8a รวมบันทึกหลัง merge เอกสาร/prototype ครบ หลักฐาน [M0_ACCEPTANCE](M0_ACCEPTANCE.md), [TEST_EVIDENCE](TEST_EVIDENCE.md)

**Milestone 1: AUTHORIZED / IN_PROGRESS** — Owner สั่ง “เริ่มได้เลยค่ะ” และยืนยันมี OA/กลุ่มทดสอบแยกแล้ว Codex รับผิดชอบ Web/API/schema/tests/docs บน `codex/milestone-1-foundation` ไม่มีผู้แก้ร่วม ขอบเขต [M1 Foundation](M1_FOUNDATION_PROPOSAL.md), [ADR-010](adr/010-foundation-implementation.md)

## ใช้งานและตรวจได้บนเครื่อง

Login บัญชีจริง 4 roles (ไม่ใช่ role selector), Owner หลายบัญชี, Customer/Project/optional Site/Job, ทีมงาน/สิทธิ์ PM, audit, health, SQL migrations, persistence และ backup/restore พร้อม [Runbook](OPERATIONS_RUNBOOK.md) Project ไม่มี Job มอบหมายได้โดยไม่ถาม Job ไม่มีโมดูลเงินหรือข้อมูลค่าจ้างใน M1

| Workstream | DESIGNED | CODED | TESTED_LOCAL | TESTED_INTEGRATION | DEPLOYED_STAGING | UAT_PASSED | PRODUCTION_READY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M0 เอกสาร/ต้นแบบ | YES | MOCK_ONLY | PASS 45 checks + ZIP + browser | NOT_APPLICABLE | NO | OWNER_ACCEPTED ทั้ง7งาน | NO |
| M1 Web/API/identity/project/team | YES | YES | PASS API+browser | PASS PostgreSQL 17 CI (API/SQL) | NO | NOT_RUN | NO |
| M1 persistence/backup | YES | YES | PASS PGlite disk restart/restore | staging NOT_RUN | NO | NOT_RUN | NO |
| M1 LINE link/group/my projects | YES | YES | PASS simulated transport | REAL_LINE_NOT_RUN | NO | NOT_RUN | NO |
| M2+ time/OT/expense/payroll | M0 design | NOT_STARTED | NOT_RUN | NOT_RUN | NO | NOT_RUN | NO |

หลักฐาน [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md) แยก automated tests, browser และรายการ NOT_RUN ชัดเจน migrations 001_foundation / 002_line_outbox ใช้ checksum ไม่มีฐานเดิมหรือ legacy code

## ข้อจำกัดและสิ่งที่รอ

Local ใช้ PGlite PostgreSQL บน disk process เดียว ไม่ใช่ native service; staging/LINE worker บังคับ DATABASE_URL และ HTTPS ไม่มี deploy/ส่ง LINE จริง ยังไม่ปิด Gate M1 จนช่างเห็นงานตนผ่าน LINE จริงและ Owner ทดสอบ

Owner ยืนยันว่ามี OA/กลุ่มทดสอบแล้ว แต่ยังไม่ระบุชื่อ/IDs, ผู้ทดลอง, server/domain หรืองบ deployment ต้องรับข้อมูลนี้และตั้ง secrets นอกแชท/Gitก่อนทดสอบจริง ยังไม่มี password recovery/MFA/role-change/group-rebind UI, automated backup schedule หรือ DEAD payload cleanup ก่อน pilotต้องประเมิน/runbookให้ครบ

ข้อถามเรื่อง OT ไม่มี Work/Job budget/month export และจุดเริ่มนับหลักฐาน 2 ปีใน [OWNER_QUESTIONS](OWNER_QUESTIONS.md) เป็น milestone ถัดไป ไม่ขวาง Foundation และไม่ถามซ้ำเรื่องสิทธิ์ที่ Owner ตอบแล้ว

## ขั้นตอนถัดไป

[Draft PR #2](https://github.com/naochanma-code/asas-job-cost-workforce-core/pull/2) เปิดแล้ว implementation commit 69c073944d8c2149e9d5f903af6da9b6d08a4ae3 push ครบ; [CI PostgreSQL 17](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35610393373) PASS ทั้ง typecheck/tests/build/M0 regression ขั้นต่อไปเตรียม staging/LINE pilot เมื่อ Owner ระบุ environment และขอบเขตที่อนุญาต ยังไม่ merge M1 หรือเริ่ม M2
