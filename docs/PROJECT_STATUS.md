# PROJECT STATUS — Milestone 1

## 24 กันยายน 2026 — แก้ enrollment รับรหัสอย่างเดียว (ยังไม่ Deploy)

Ownerแจ้งส่งครบ แต่ GETผลรอบปัจจุบันยัง0/3และ0/1 ตรวจHTTPmetadataพบWebhook200หลายครั้ง endpointactiveถูกต้อง deploymentไม่เปลี่ยน. เปรียบเทียบเฉพาะข้อความที่แสดงในOAทดสอบกับรหัสในหน้าเว็บในหน่วยความจำ: มีตัวรหัสตรง แต่ไม่มีprefixคำสั่ง ไม่เก็บข้อความ/รหัส/IDsในหลักฐาน

Root cause: captureรับเฉพาะ “ลงทะเบียนทดลอง <รหัส>” จึงไม่รับ barecode. แก้ให้ยอมรับทั้ง barecode32ตัวอักษรและคำสั่งเดิม โดยยังตรวจexacthash/one-use/15นาที/3LINEusersไม่ซ้ำ/groupโดยผู้สมัครแล้ว/signature/destination ไม่มีauto-grantหรือwildcard ไม่มีschema/Web change

Regression synthetic REDก่อนแก้2tests; GREENหลังแก้3/3 + typecheck PASS. CI/fullNativePGรอpush. OwnerUAT/enrollmentจริงยังไม่ผ่านและbusinessLINEยังfalse. รอบเดิมหมดอายุแล้ว ต้องเริ่มรอบใหม่หลังDeployที่ตรวจผ่าน ไม่ให้ส่งซ้ำระหว่างกำลังแก้

อัปเดต 24 กันยายน 2026 · Module owner: Codex (Foundation/API/LINE/เอกสาร); task Reviwer ดู design reference · branch codex/milestone-1-foundation · PR #2 ยัง Draft / ไม่ Merge

## ตอนนี้ถึงไหน

**Web ใช้งานได้ และ LINE Webhook ทดสอบจริงผ่านแล้ว — พร้อมลงทะเบียนผู้ทดลอง 3 คน/1 กลุ่ม** ยังไม่เปิดคำสั่งเชื่อมบัญชี/งานของฉัน/ผูกกลุ่ม จนกว่าจะรับผู้ทดลองครบ ตั้ง allowlist และตรวจ worker ผ่าน

API และ Web ใช้ commit **84df39ce386d4892c943baae36822084a3421a4a** ทั้งคู่ ไม่มี migration ใหม่ ไม่แก้ข้อมูลจริงบน Staging

- [Web Staging](https://web-staging-cb6f.up.railway.app/)
- [ลงทะเบียนผู้ทดลอง LINE](https://web-staging-cb6f.up.railway.app/line-pilot) — Owner เท่านั้น ต้องเริ่มรอบเมื่อทั้ง3คนพร้อม รหัสหมดอายุ15นาที
- [ขั้นตอนสำหรับ Owner](M1_LINE_OWNER_SETUP.md)

## สถานะตาม Definition of Done

| รายการ | สถานะและหลักฐาน |
| --- | --- |
| CODED | PASS — Foundation/Alignment เดิม + LINE Project allowlist, source revocation, worker guards และ signed private enrollment ตาม ADR-012 |
| TESTED_LOCAL | PASS — 45 PASS / 2 native SKIP; typecheck, production build และ M0 45checks ผ่าน |
| TESTED_CI | PASS — CI36018991502: Native PostgreSQL47/47, typecheck/build/API+Webcontainers/smoke/M0 ผ่าน |
| DEPLOYED_STAGING_API_WEB | PASS — exact84df39c ทั้งคู่; API a8990b9a-2e7c-4b2d-8ca5-2fcb35c366e2; Web88979aa4-f253-42f1-a154-9b3cb432e401 |
| TESTED_STAGING | PASS ตามขอบเขต — HTTPS38checks ด้วยบัญชีสมมติ Owner/Admin/TECH: health/database, Secure cookie, CSRF, role gate, disabled business LINE, signature/tamper, logout; บัญชีสมมติปิดแล้ว |
| REAL_LINE_WEBHOOK_VERIFY | PASS — LINE official test API ตอบ success=true/statusCode200/reasonOK; endpointตรงWeb Stagingและactive |
| LINE_ENROLLMENT | DEPLOYED / UAT_NOT_RUN — รับเฉพาะคำสั่งรหัสสุ่มของรอบที่ Owner เริ่ม เก็บ3user/1groupในmemory15นาที ไม่มีauto-grant/queue/reply |
| LINE_WORKER | PREPARED / NOT_DEPLOYED — serviceเปล่า ไม่มีsource/deployment/publicdomain, Tokenอยู่workerเท่านั้น, LINE_ENABLED=false |
| REAL_LINE_LINK/JOBS/GROUP/REVOKE | NOT_RUN — รอenrollmentครบ/allowlists/workerstart-stop/securitygates; ยังไม่ผ่าน M1 LINE gate |
| OWNER_UAT_JOB_CREATE / MOBILE | PASS ตามคำยืนยันOwnerจากรอบก่อน; ไม่เท่ากับรับM1ทั้งหมด |
| OWNER_UAT_ALL_M1 | PARTIAL — งานWebบางflowผ่าน, LINEยังไม่ตรวจรับ |
| BACKUP/RESTORE | PASS แบบmanual snapshot/isolated recoveryจากรอบก่อน; scheduledbackup/PITR/keyescrowข้ามเครื่องยังไม่มี |
| MERGE / M2 / M3 / PRODUCTION | NOT_AUTHORIZED — ยังไม่ดำเนินการ |

## สิ่งที่ Owner ต้องทำต่อ

ค่าลับที่กรอกผ่านRailwayได้รับและตรวจแล้ว ไม่ต้องกรอกซ้ำ Tokenตรงกับ OA ทดสอบ; ChannelSecretใช้Verifyจริงผ่าน ไม่แสดงค่าลับในหลักฐาน

เมื่อโอ๋ ฟ้า และช่างทดสอบ1คนพร้อม ให้ Owner เปิดหน้าลงทะเบียนแล้วกดเริ่มรอบ ส่งคำสั่งคนละรหัสในแชทส่วนตัวกับ OA จากนั้นให้ผู้ที่ลงทะเบียนแล้วส่งรหัสกลุ่มในกลุ่มทดสอบที่มี OA อยู่ กดตรวจผลจนได้รับครบ3คน/1กลุ่มแล้วแจ้งว่า “ลงทะเบียนครบแล้ว”. ห้ามส่งรหัส/IDs/TokenในแชทหรือGitHub

ถ้าใช้รหัสไม่ทัน15นาทีหรือAPIรีสตาร์ท ต้องเริ่มรอบใหม่ ไม่ถือเป็นข้อมูลหายจากฐาน การสมัครขั้นนี้ยังไม่ใช่การเชื่อมบัญชีแอป

## ขั้นต่อไปของ Codex / ข้อจำกัด

1. ตรวจผู้ทดลองครบ3คน/1กลุ่ม แล้วตั้ง User/Group IDs ผ่านRailwayโดยตรง พร้อมเฉพาะ UUID ของ Projectสมมติ A/B; ห้ามเปิดwildcardหรือใช้ข้อมูลจริง
2. ปิดenrollment ตรวจworkerprivate/sourceSHA/การหยุดและกู้ process/เครดิต ก่อนเปิดbusinessLINEและทดสอบ link→งานของฉัน→group→revoke
3. ผลจริงยังไม่ครบ: live rate-limit/sharedproxy, full edge-querylog review, worker lifecycle และ real nonce/code expiry/replay ตาม [Test Matrix](M1_STAGING_TEST_MATRIX.md) ไม่เปลี่ยนเป็นPASSจากlocal tests

Railway ยังisTrialing=true เหลือเครดิตประมาณ **USD4.792 / 28วัน** ณตรวจหลังDeploy มี4servicesรวมworkerที่ยังไม่รัน ไม่อัปเกรด/เพิ่มpaidservice หากเครดิตไม่พอหยุดรายงานOwner

[UI Design Direction](UI_DESIGN_DIRECTION.md): DESIGNED_REFERENCE เท่านั้น เมนูซ้ายถ่านเข้ม/แดงแบบภาพ1 เนื้อหาการ์ดขาว/น้ำเงินแบบภาพ2–5 ยังไม่ใช่UIที่deploy

## หลักฐาน

[CI36018991502](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36018991502) · [Test Evidence](M1_TEST_EVIDENCE.md) · [LINE Readiness](M1_LINE_PILOT_READINESS.md) · [ADR-012](adr/012-bounded-line-pilot.md) · [Owner UAT](M1_OWNER_UAT.md)

M1อยู่ใน .local/m1-staging โฟลเดอร์หลักเป็นM2ที่พักไว้ มีเพียงpointerให้อ่านสถานะM1 ไม่รวม source/schemaM2
