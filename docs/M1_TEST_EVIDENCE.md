# M1 Test Evidence — 2026-09-21

## 24 กันยายน 2026 — รอบแก้หลัง Owner ทดลองมือถือ (ยังไม่ Deploy)

Owner ยืนยันว่ามือถือเข้าใช้งานได้ แต่รายงานสร้าง Job แล้วไม่เห็น จึงเป็น UAT_PARTIAL / OPEN_ISSUE ไม่ใช่ UAT_PASSED ทั้งระบบ งาน Job UI รับผิดชอบ task Reviwer; Codex task Milestone รับผิดชอบ LINE disabled guard และรวมผลตรวจ

พบ LINE=false ยังสร้าง group binding code และแสดง LINE controls ได้ แก้ /api/me ให้คืน line_enabled boolean และปิด controls ตามค่า true เท่านั้น; API ปฏิเสธ link/unlink/group-code เมื่อ disabled ก่อนเปลี่ยนข้อมูล ไม่เปิด LINE ไม่เปลี่ยน schema/permission role

Local 33 PASS / 2 native-only SKIP / 0 FAIL; typecheck และ production build PASS (หลังรับ Job UI patch และ LINE guards) CI/container รอผล; Staging ยังเป็น cda461d ไม่อ้างว่า patch Deploy แล้ว ไม่แก้ข้อมูลจริง ไม่ Merge/M2/Production


## 24 กันยายน 2026 — DEPLOYED_STAGING / รอ Owner UAT

Owner อนุมัติ Backup/Recovery และ migration003/grants/Deploy SHA cda461d แล้ว ทั้ง API/Web Online; encrypted backup และ isolated restore PASS; legacy business digest ไม่เปลี่ยน; HTTPS24 checks และ restart persistence PASS; log sample ไม่พบ secret patterns LINE=false ไม่เปลี่ยนแผน ไม่ Merge/M2/M3/Production ดู [หลักฐาน Staging](M1_ALIGNMENT_STAGING_EVIDENCE.md) สถานะรออนุมัติด้านล่างเป็นประวัติที่แก้ไขแล้ว

## ประวัติ Staging preflight — 23 กันยายน 2026 (ใช้สถานะ 24 กันยายนด้านบน)

Owner อนุมัติให้เริ่มกระบวนการตามแผนที่เสนอ จึงเดินหน้า preflight ภายใน Trial เดิม ไม่ขออนุมัติ Deploy ซ้ำ แต่ยังต้องผ่าน Backup/Restore และ maintenance gate ก่อนเปลี่ยนฐานข้อมูล

PASS: fetch ยืนยัน branch ตรง origin ที่ 9bcbe3e; [CI ของ head 35872859835](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35872859835) SUCCESS; Railway แสดง API/Web/Postgres Online; Limited Trial เหลือ $4.89 / 29 วัน ณเวลาตรวจ

BLOCKED_BACKUP_AUTH: หน้า Postgres > Backups ระบุ Create Backup/PITR ต้อง Pro จึงไม่ใช้และไม่อัปเกรด ทางเลือกที่เตรียมคือ pg_dump เข้ารหัส + ดาวน์โหลดไฟล์เข้ารหัสออกจาก provider ผ่าน official Railway CLI และตรวจ Restore ในฐานแยก ต้อง Login CLI บนเครื่องก่อน ขณะนี้ยังไม่มี CLI session ที่ใช้ได้ การเริ่ม Login แบบ background ไม่สำเร็จและยกเลิก process ของ task แล้ว ไม่มีการเก็บหรือแสดง token

เตรียม CLI ทางการ v5.61.0 ใน ignored .local/operator-tools และตัวเปิด .local/RAILWAY-LOGIN.cmd สำหรับ Owner เข้าสู่ระบบโดยตรง ไม่เพิ่ม application dependency หรือบริการ Railway; npm installer ล้มเหลว จึงใช้ binary จาก official railwayapp/cli release แทน

NOT_RUN: Backup ข้อมูลจริง, Restore recovery verification, write freeze, migration003, Deploy Alignment, live UAT ไม่เปิด LINE ไม่ Merge/M2/M3/Production ไม่สร้างบริการเสียเงิน ไม่แก้ข้อมูลจริง ต้องให้ Owner ยืนยัน Login CLI ต่อกับ Railway โดยตรง ไม่ส่ง password/token ในแชท หลัง authentication จะตรวจว่าดาวน์โหลดได้ภายใต้ Trial; หากต้องเสียเงินเพิ่มให้หยุด

## M1 Alignment v3.0 — ผลตรวจ 23 กันยายน 2026

Code commit: c8a522db94f473c2fd81b048cb20e2f876cb0a84 บน branch codex/milestone-1-foundation; [Foundation CI 35872122374](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35872122374), verify job 107218612210 SUCCESS ทุก step

| การตรวจ | ผล |
| --- | --- |
| Local และ CI PGlite suite | PASS 32 / SKIP 2 native-only / FAIL 0 รวม 34 tests |
| Native PostgreSQL 17 suite | PASS 34 / SKIP 0 / FAIL 0 |
| Type Check / Next production build | PASS ทั้ง Local และ CI |
| Docker API/Web build | PASS ใน CI |
| Web container smoke | PASS ใน CI ไม่มี public deployment |
| API container smoke / TLS / runtime role / backup CLI | PASS ในฐาน CI แยก; CA ไม่ถูกต้องถูกปฏิเสธ |
| M0 regression | PASS 24+14+7 = 45 checks |
| Migration 001/002 → 003 / seed replay / restore | PASS ด้วยข้อมูลสมมติ; 001/002 ไม่มี diff |
| Git diff check | PASS |
| Alignment Staging migration / browser UAT / Real LINE | NOT_RUN ไม่ใช้ผล Local/CI แทน |

Coverage: Project A ไม่มี Site/Job, B มี Site/หลาย Job; ประเภทเพิ่ม/แก้ชื่อ/เรียง/ปิดและข้อมูลเดิมยังใช้ได้; concurrent 24 Projects + 24 Jobs; PM assign/revoke เฉพาะ TECH ใน Project ตนและ Audit ครั้งเดียว; deny role/user/PM appointment/cross-project/OWNER/ADMIN/PM targets; ADMIN/OWNER regression; TECH job scope; legacy backfill, migrate ซ้ำ, Backup/Restore/counter continuity และออกรหัสใหม่หลัง Restore

รหัสผ่านบัญชีสมมติสุ่มในหน่วยความจำ ไม่มีบัญชีจริงจาก Staging ผล Local รอบสุดท้าย 44.00 วินาที ไม่พบ fail; native-only 2 รายการผ่านจริงใน CI Native run ไม่ได้ skip

Baseline543a899: CI35863738772 SUCCESS, PR#2 Draft/not merged/mergeable, behind main 0; Staging HTTPS health200/database ready แบบอ่านอย่างเดียว รุ่นที่ deploy ตามหลักฐานเดิมยัง 4fcb29e ไม่ได้ตรวจ source commit สดจาก provider ในรอบนี้

ข้อจำกัด: CI ใช้ PostgreSQL17 แต่ Railway เดิม18; form render ไม่ใช่ browser E2E/Owner UAT รุ่นใหม่ ไม่มี Docker/PostgreSQL CLI ใน PATH เครื่อง local จึงใช้ CI เป็นหลักฐาน native/container; ไม่ใช้ข้อมูลจริงทดสอบ ไม่มี deployment หรือ LINE จริง เอกสารหลักฐานที่ commit ตามหลังเป็น docs-only ดู [release manifest](M1_ALIGNMENT_RELEASE.md)

## ประวัติเริ่มงาน M1 Alignment v3.0 (สถานะปัจจุบันอยู่ด้านบน)

ฐานก่อนแก้: 543a899; CI 35863738772 SUCCESS; PR #2 Draft/ไม่ Merge/ไม่มี conflict และไม่ตกหลัง origin/main; executable migrations มี 001/002 เท่านั้น HTTPS Staging health 200/database ready แบบอ่านอย่างเดียว รุ่นที่ deploy ตามหลักฐานเดิม 4fcb29e ไม่ได้ deploy ใหม่

ขอบเขตรอบนี้: configurable types, Project/Job operational fields, code generation, D-022 PM assignment และ automated tests ในฐานสมมติแยก ยังไม่เริ่ม M2/M3/Expense/Payroll/Real LINE ยังไม่อนุมัติ migration หรือ deployment ไป Staging

คำถามเดิมปิดแล้ว: Owner ยืนยันเริ่ม Project Type 5 ประเภทตามคำสั่งรอบนี้ บันทึก D-023 และแก้ Master/seed/test ให้ตรงกันแล้ว

## 23 กันยายน 2026 — ปรับ UX และทดสอบอัตโนมัติก่อนส่ง Owner

Owner ขอให้พัฒนาและทดสอบเป็นชุดก่อนส่งตรวจ ไม่ต้องสลับบัญชีทีละขั้น จึงพักคำขอ Login TECH ก่อนหน้า ไม่รอ Owner เพื่อทดสอบอัตโนมัติ ใช้บัญชี OWNER/ADMIN/PM/TECH ที่ชุดทดสอบสร้างเองในฐานสมมติแยก รหัสผ่านสุ่มในหน่วยความจำ ไม่พิมพ์/บันทึกและไม่ใช้กับ Staging ที่มีข้อมูลจริง

CODED: เพิ่มชื่อลูกค้า/สถานที่บนการ์ดและรายละเอียดโครงการ เปิดรายการ Job และแบบฟอร์มเพิ่ม Job ให้มองเห็นชัด ตัวเลือกมอบหมายทั้งโครงการ/Job แสดงทันทีเมื่อมี Job เท่านั้น โครงการไม่มี Job ยังไม่ถาม Job ล้างข้อมูลหน้าจอเมื่อ Logout ป้องกันข้อมูลค้างข้ามบัญชี

TESTED: Local regression 24 tests: 22 PASS / 2 native-PostgreSQL-only SKIP / 0 FAIL; typecheck และ Next production build PASS; M0 document checks 24/24 PASS; git diff --check PASS. ชุดใหม่ตรวจ customer/site ตาม scope, ห้ามอ่าน directory, A ไม่มี Job และ B มี Job โดยสร้างบัญชี/รหัสผ่านอัตโนมัติในฐานแยก CI รุ่นใหม่ยังรอผล DEPLOYED: Staging ยังเป็น release 4fcb29e จึงยังไม่เห็น UX ใหม่ UAT: ยังไม่ส่ง Owner ตรวจรอบใหม่ ไม่ถือผล automated เป็น Owner acceptance

ยังไม่เปิด LINE ไม่ Merge PR #2 ไม่เริ่ม M2/Production ไม่แก้ข้อมูลจริงหรือเพิ่มค่าใช้จ่าย ส่ง Owner ตรวจเป็น flow เดียวหลังรุ่นพร้อม และขอ Owner เฉพาะเรื่องที่ต้องตัดสินใจ/กรอก secret ของบริการจริง

## 23 กันยายน 2026 — Admin และชุด PILOT A/B

PASS บน Web Staging release 4fcb29e: reload แล้วยืนยันบทบาท ADMIN; Admin สร้างลูกค้า PILOT-20260923-Customer และ Project A โดยไม่กรอก Site/Job ได้ มอบหมายช่างสมมติที่เคย Login ให้ A โดยแบบฟอร์มมีเฉพาะพนักงาน ไม่มีช่อง Job หลังบันทึกพบช่างสมมติและปุ่มถอนมอบหมาย

PASS: สร้าง Site B เลือก Site นี้ตอนสร้าง Project B และเพิ่ม Job B ได้ ตรวจพบ Job B ในรายละเอียด และ B ไม่มี assignment ช่าง ทั้งหมดใช้ชื่อขึ้นต้น PILOT-20260923 ไม่แก้รายการจริงเดิม Owner ยืนยันเพิ่มเติมว่า Admin เลือกช่างได้ถูกต้อง

ประวัติก่อนเปลี่ยนวิธีทดสอบ: เคยรอ Login ช่างสมมติเพื่อตรวจ A/B; คำขอนี้พักแล้วตามคำสั่ง Owner ล่าสุด ยังไม่ลง PASS ให้ cross-project, ถอนสิทธิ์, PM หรือ security live ที่เหลือ LINE ยังคงปิด ไม่มี deploy/merge/M2/ค่าใช้จ่ายเพิ่ม

## 23 กันยายน 2026 — Restart, Logout และ Rate Limit

PASS: ยืนยัน Restart API/Web จากการยืนยันใน provider และ startup/ready log รอบที่สอง; / และ /api/health กลับมา HTTP 200, database ready. Read-only checksum ของชุด IDs ใน users/employees/customers/sites/projects/jobs/assignments/audit ตรง baseline ก่อน restart โดยไม่พิมพ์ ID หรือ row data. ชุด restore สมมติ counts ยังครบ

PASS: Owner Logout แล้ว reload กลับหน้า Login; Owner Login บัญชี TECH สมมติสำเร็จ บน browser เห็น 1 project card, ไม่มีเมนูบัญชีผู้ใช้/ลูกค้าและทีม/สร้างโครงการ; เมื่อเปิดรายละเอียดไม่มีปุ่มแก้ไขหรือมอบหมาย บันทึกเฉพาะผล ไม่บันทึกชื่อหรือข้อมูลจริง ยังไม่ใช่ PASS ของ cross-project/revoke

PASS: ทดสอบบน API container จริงผ่าน loopback เพื่อไม่กินโควตาผู้ใช้ Web: login malformed body 12 ครั้งให้ 400 จำนวน10 และ 429 จำนวน2; health 130 ครั้งให้ 200 จำนวน120 และ 429 จำนวน10 แม้เปลี่ยน X-Forwarded-For ทุกครั้ง ไม่มี password/บัญชีที่ใช้ทดสอบ ไม่มีการล็อกบัญชีจริง ผลนี้ไม่ใช่ public-edge/multi-user rate-limit test

NOT_RUN: การเปิด privileged API โดยตรงผ่าน browser ถูก client navigation block จึงไม่อนุมานว่าได้ HTTP403. Secure Cookie attributes / expired-token replay ผ่าน CI แต่ยังไม่มีหลักฐาน live browser header/replay. Admin/TECH/PM cross-project/revocation UAT ยังไม่ครบ รอ Admin สมมติ Login. เครดิต Trial ล่าสุด $4.94 /30 days; ไม่มีการอัปเกรด

## 23 กันยายน 2026 — ผล Restore และขั้นก่อน LINE

Owner ให้ดำเนินการ process ถัดไปและถามว่าเริ่ม LINE ได้หรือยัง: ยังคง LINE=false จน gate A–E และผู้ทดลองพร้อม ไม่ Merge/M2/Production

Native pg_dump/pg_restore ซ้อมบน PostgreSQL 18 ใน Trial เดิม PASS โดยสร้าง source/restore ใหม่แยกจากฐานที่มีข้อมูลจริง ใช้เฉพาะ schema/migration metadata และสร้างแถว PILOT สมมติใหม่ ข้อมูล 9 business tables และ migration history เทียบทุก column/row ตรงกัน; counts และ Project A ไม่มี Site/Job, B มี Site/Job ผ่าน; transient sessions/codes/queues ไม่ถูกคืนมา Runtime Web ไม่มีสิทธิ์ CONNECT เข้าฐาน restore ดู M1_STAGING_RESTORE_DRILL.md สำหรับ checksum/ขอบเขต ไม่ใช่ backup ของข้อมูลจริงหรือ off-provider DR

Restart UI ครั้งก่อน timeout ก่อนยืนยัน จึงยังไม่ลง PASS จากการกดปุ่ม ขณะนี้ตรวจต่อ ส่วน Owner UAT 5 flow เดิม PASS ตามรายงาน แต่สิทธิ์แยกบทบาท/ถอนสิทธิ์/Logout ยัง NOT_RUN

## 22 กันยายน 2026 — Owner ทดลอง Web และแก้สถานะที่อ่านไม่ตรงกัน

Owner รายงาน PASS: Login, สร้างพนักงาน, สร้างลูกค้า, สร้างโครงการ และมอบหมายคนเข้าโครงการ ไม่ได้ระบุว่าทดสอบทุกบทบาท/Project ไม่มี Site/Job/การถอนสิทธิ์ จึงไม่เติม PASS ให้ UAT ข้อเหล่านั้น ตรวจใน browser พบ session ที่เข้าสู่ระบบอยู่โดยไม่อ่านรหัสผ่านหรือบันทึกรายการจริง

Owner ยืนยันว่ามีข้อมูลจริงปนใน Staging จึงหยุด backup/restore จากฐานชุดนี้; ไม่คัดลอกข้อมูลจริง ไม่แก้/ลบรายการเดิม ทดสอบต่อเฉพาะชุดสมมติแยก ดู D-019

ปรับ PROJECT_STATUS เป็นสรุปภาษาไทยปัจจุบัน พร้อมตาราง CODED/TESTED/DEPLOYED/UAT และ 3 งานที่ Owner ทดลองต่อได้ ย้ายรายละเอียดเก่าไป M1_STAGING_HISTORY เพื่อไม่ให้สถานะเก่าปะปน เพิ่มป้ายอ้างอิงในเอกสารโฟลเดอร์หลักที่ยังพัก M2 โดยเก็บงานเดิมไว้ ไม่รวมโค้ด M2 เข้า PR #2

ไม่มี application/schema/permission change ในการปรับเอกสารนี้ ผล Local/CI ของ release 4fcb29e อ้างอิงผลเดิม ไม่อ้างว่ารันทดสอบใหม่จากการแก้เอกสาร LINE=false, Trial only, no merge/production/M2

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

## สภาพแวดล้อมทดสอบรอบ UX 23 กันยายน

คำสั่ง node --import tsx --test --test-concurrency=1 tests/*.test.ts รอบ sandbox เริ่มไม่ได้เพราะ Windows uv_os_get_passwd ENOMEM ก่อนเข้า test; รันนอก sandbox โดยล้าง TEST_DATABASE_URL แล้วได้ 22 PASS/2 SKIP/0 FAIL ใน 41.95 วินาที ไม่เชื่อมฐาน Staging และไม่ใช้รหัสผ่านจริง ผลนี้เป็น Local API/integration ไม่ใช่ browser E2E หรือ live security/UAT รุ่นใหม่ Native PostgreSQL ให้ CI ที่ใช้ฐานทิ้งได้ตรวจต่อ ไม่มี schema migration

เพิ่ม tests/alignment-web.test.ts: render ฟอร์มจาก types ที่ API ส่งมา, disabled selected type เดิม, ซ่อน PM appointment สำหรับ PM และ form serialization PASS 1 รายการ ไม่อ้าง browser E2E รวมชุดปัจจุบัน34 tests/32 PASS/2 native-only SKIP

Job UI patch จาก task Reviwer: เพิ่มรายการข้างฟอร์มและผลสำเร็จ/ข้อผิดพลาดใกล้ปุ่ม หลัง POST สำเร็จล้างฟอร์มทันที; GET refresh fail แสดงคำเตือนว่าบันทึกแล้วไม่ชวนสร้างซ้ำ. ยังไม่พิสูจน์สาเหตุ Job เดิมที่ Owner รายงาน และไม่ถือว่าผ่าน browser/UAT ของ patch. ไม่มี migration ใหม่

