# PROJECT STATUS

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
