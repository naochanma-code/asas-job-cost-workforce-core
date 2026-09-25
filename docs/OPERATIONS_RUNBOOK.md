# Foundation operations — local / test only

## 24 กันยายน 2026 — DEPLOYED_STAGING / รอ Owner UAT

Owner อนุมัติ Backup/Recovery และ migration003/grants/Deploy SHA cda461d แล้ว ทั้ง API/Web Online; encrypted backup และ isolated restore PASS; legacy business digest ไม่เปลี่ยน; HTTPS24 checks และ restart persistence PASS; log sample ไม่พบ secret patterns LINE=false ไม่เปลี่ยนแผน ไม่ Merge/M2/M3/Production ดู [หลักฐาน Staging](M1_ALIGNMENT_STAGING_EVIDENCE.md) สถานะรออนุมัติด้านล่างเป็นประวัติที่แก้ไขแล้ว


## M1 Alignment 003 — อนุมัติและ Deploy แล้ว 24 กันยายน

ใช้ [Dry Run / Recovery Plan](M1_ALIGNMENT_MIGRATION_PLAN.md) รุ่นใหม่เพิ่ม types/counters/fields ต้องรัน approved migration job ด้วย operator แยก runtime และ MIGRATION_ROLE=asas_m1_migrator ก่อน Deploy Web/API คู่กัน ห้ามชี้ฐานจริงทดสอบ รหัสผ่านสมมติสร้างอัตโนมัติใน tests ไม่ต้องให้ Owner สลับบัญชี

Backup format 2 รวม types/counters/reservations และใช้ได้เฉพาะ schema checksum ตรงกัน; target ต้องไม่มี business data และ seed types ยังไม่แก้ Backup format 1 ให้ใช้รุ่นเก่า restore ลงฐานใหม่ก่อน migrate ไม่ overwrite ฐานเดิม ห้ามใช้ provision-m1-roles ซ้ำกับ roles ที่มีแล้ว; ใช้ grant-m1-alignment หลัง migration ที่อนุมัติแทน

## ประวัติการเตรียม Staging 2026-09-22 (สถานะปัจจุบันดู PROJECT_STATUS)

Owner อนุมัติ Railway Trial ตาม D-017 แล้ว ดู [คู่มือ Railway](M1_RAILWAY_SETUP.md) แทนสถานะรอเลือก server ด้านล่าง ยังไม่ deploy สำเร็จหรือส่ง LINE จริง. production-mode API/worker ตรวจ schema เท่านั้น operator ต้อง migrate/bootstrap แยกก่อนเริ่ม runtime ไม่ให้ runtime ใช้ credential ผู้ดูแล DB

Owner อนุมัติพัฒนา M1 และยืนยันว่ามี OA/กลุ่มทดสอบแล้ว ยังไม่ระบุ server/domain/รายชื่อ allowlist จึงยังไม่ deploy หรือส่ง LINE จริง

## เริ่มบนเครื่อง

ใช้ Node 24 และ pnpm 11.19.0 ที่ตรง packageManager; `pnpm install --frozen-lockfile` แล้ว `pnpm typecheck`, `pnpm test`, `pnpm build`

สำหรับฐานทดสอบใหม่เท่านั้น: `pnpm exec tsx scripts/seed-local.ts` สร้างบัญชีสมมติพร้อมรหัสสุ่มใน `.local/demo-accounts.json` ที่ไม่เข้า Git ถ้าฐานมี users แล้วจะไม่เขียนทับ ห้ามใช้กับ staging/production

เปิดสอง terminal: `pnpm dev:api` และ `pnpm dev:web` แล้วเปิด http://127.0.0.1:3000 API ฟัง 127.0.0.1:3001 ใช้ PGlite `.local/pgdata` เปิด DB นี้ได้ process เดียว ต้องปิด API ก่อนใช้ migrate/seed/backup แยก process ไม่วาง local database ใน OneDrive ที่ sync ข้ามเครื่องพร้อมกัน

บัญชีทดสอบ Admin สร้างลูกค้า → Project → เลือก Project → มอบหมาย TECH ได้ทันทีโดยไม่มี Site/Job; TECH login เห็นเฉพาะงานตน Owner สร้างผู้ใช้จริงภายหลังได้ ก่อนทดลองข้อมูลบุคคลจริงให้ย้ายไป staging ที่ควบคุมสิทธิ์และ encrypted disk

ไม่อ่าน `.env` อัตโนมัติ ใช้ environment ของ process หรือ Node `--env-file=.env --import tsx apps/api/src/main.ts`; `.env.example` มีชื่อ fields เท่านั้น ไม่คัดลอกค่าเป็น secret ผ่าน chat/log/Git

## Native PostgreSQL / CI

DATABASE_URL ชี้ PostgreSQL 17+; `pnpm migrate` รัน SQL ที่มี checksum ตามลำดับ Bootstrap จากฐานว่างด้วย BOOTSTRAP_USERNAME และ BOOTSTRAP_PASSWORD จาก secret manager แล้ว `pnpm bootstrap`; ลบ bootstrap variables หลังใช้ API/worker ใช้ app DB user แยก migration role ก่อน staging

CI ใช้ฐาน service ว่างและ TEST_DATABASE_URL (ห้ามชี้ฐานจริง): รัน tests ทั้ง PGlite และ PostgreSQL; migrations/constraints/scope ผ่านชุดเดียวกัน CI ถูกเพิ่มใน repo แต่ผลต้องตรวจจาก GitHub ก่อนอ้าง PASS

HTTPS reverse proxy route `/api/*` ไป Fastify, ที่เหลือไป Next.js WEB_ORIGIN ต้องตรง public HTTPS origin ห้ามเปิด API port ต่อ internet โดยตรง; ปิด request URL/body logging ที่อาจมี LINE linkToken ตั้งค่า DB TLS และ encrypted storage ตาม provider ก่อน staging Production มี guard ไม่ให้ใช้ embedded DB/HTTP cookie

## สำรองและกู้คืน

ไฟล์ backup มีข้อมูลส่วนบุคคล/password hashes ใช้ private encrypted storage แยกเครื่อง สิทธิ์เฉพาะ operator/Owner; ห้าม commit หรือส่งในแชท ตั้งรายวันก่อน pilot และทดลองกู้คืนก่อนเปิดใช้งานจริง กำหนดผู้ดูแล/retention ของ foundation backup กับ Owner; นโยบายบิล 2 ปีเป็น M0 design และไม่ใช่ TTL ของ backup นี้

1. Native DB: `pnpm backup backup <private-file.json>` เก็บ consistent logical snapshot ไม่ overwrite ไฟล์เดิม; ถ้า local ต้อง stop API ก่อนและกำหนด LOCAL_DATABASE_OFFLINE=true
2. สร้างฐานกู้คืนแยกที่ว่าง ให้ผู้ดูแล migration เตรียม schema เดียวกันก่อน แล้ว `pnpm backup restore <private-file.json>`; CLI ตรวจ schema เท่านั้น ไม่รัน migration และไม่เขียนทับฐานที่มี users/data
3. ตรวจ counts/Project/assignment/audit และ login ใหม่; session/nonce/pending reply tokens ไม่ถูกกู้คืน ไม่ส่งข้อความเก่า
4. ใช้ `pg_dump`/PITR ของ provider เพิ่มก่อน production; logical tool นี้ไม่ใช่ full disaster recovery ของ cluster หรือ encrypted object storage

## เปิด LINE pilot เมื่อ environment ได้รับอนุญาต

ต้องมี OA bot destination, HTTPS webhook URL, test user/group IDs และ test participants ที่ Owner อนุญาต เก็บ LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN, LINE_PAYLOAD_KEY (random 32 bytes base64) ใน environment/secret manager แยก staging; LINE_TEST_USER_IDS / LINE_TEST_GROUP_IDS เป็น allowlists คั่นด้วย comma เปิด LINE_ENABLED=true เฉพาะ pilot

รัน API และ `pnpm worker` บน PostgreSQL เดียวกัน; worker จะไม่เริ่มถ้าไม่มี HTTPS/allowlists/key ตั้ง webhook ของ OA ไป `/api/line/webhook`; ตรวจ Verify ก่อนให้ผู้ทดสอบส่ง “เชื่อมบัญชี” ในแชทส่วนตัว → login → ยืนยัน → กลับ LINE ส่ง “งานของฉัน”

Admin หรือ Owner ที่เชื่อมแล้วสร้าง code ในหน้า Project และส่งคำสั่งในกลุ่มทดสอบภายใน 10 นาที ต้องเป็น LINE ของบัญชีที่สร้างรหัส กลุ่มได้รับเพียงข้อความยืนยัน ไม่มีชื่อพนักงาน/เงิน/รายละเอียด Project

ตรวจ `/api/line/status` ด้วย Admin/Owner เมื่อ DEAD ให้ตรวจ token/network/expiry โดยไม่พิมพ์ payload ใน log ให้ผู้ใช้ส่งคำสั่งใหม่ ห้าม manual replay reply token หมดอายุหรือ push ไปกลุ่มอื่น การ replay UI ยังไม่มี

ปิด pilot ด้วย LINE_ENABLED=false และหยุด worker เพิกถอน test tokens ตามต้องการ; เก็บ payload ที่ล้มเหลวแบบเข้ารหัส จำกัด DB/operator access OwnerอนุมัติTTL24ชั่วโมงตามD-033แล้ว; workerล้างเฉพาะqueuepayloadหมดอายุและคงสถานะ/Audit ต้องตรวจsweepก่อนเปิดpilot

## สิ่งที่ต้องตรวจบน staging ก่อนปิด M1

LINE จริงครบ account link/unlink, nonceหมดอายุ/ซ้ำ, bindผิดคน/ซ้ำ, งานของ T1/T2 แยกกัน, ถอนสิทธิ์มีผล, restart/restore, Secure cookie, reverse proxy rate limit และ alert failed jobs พร้อม Owner UAT ห้ามอ้าง local mock ว่าแทนรายการเหล่านี้

## แผน Staging ที่รออนุมัติ (2026-09-22)

ใช้ [M1_STAGING_PLAN](M1_STAGING_PLAN.md), [LINE Pilot Checklist](M1_LINE_PILOT_CHECKLIST.md), [Owner UAT](M1_OWNER_UAT.md) และ [Staging test matrix](M1_STAGING_TEST_MATRIX.md) ก่อนเปิดออนไลน์ ห้าม deploy/จ่ายเงิน/ส่ง LINE จน Owner อนุมัติ ข้อจำกัด runtime migration role, proxy bucket, secret logging และ enrollment IDs ในแผนยังเป็น gate ก่อน pilot

## Bounded LINE Pilot operations — ADR-012

Owner approval covers test OA/group/3 participants only; retain Trial/no-merge/no-production constraints. Credential values go directly to Railway Variables; API owns Channel Secret/Bot ID/Payload Key and worker alone owns Access Token. Inspect boolean presence/format and LINE bot-info identity without printing IDs/tokens. Railway browser variable edits may remain staged: inspect that the patch includes only intended keys, then environmentPatchCommitStaged(skipDeploys:true); do not mistake staged UI rows for runtime variables.

Enrollment: deploy exact CI-passed API/Web SHA; API LINE_ENABLED=false, LINE_ENROLLMENT_ENABLED=true; worker remains stopped/disabled with no public domain. Configure approved OA webhook to Web HTTPS /api/line/webhook and Verify its empty signed event. OWNER opens /line-pilot and issues 3 private +1group one-use commands. Capture is memory-only, 15 minutes; API restart invalidates active round, so finish deployments before issuing codes. No wildcard enrollment, raw-event logging or automatic identity grant.

After all4 slots are received, operator privately transfers exact IDs to API/worker allowlist variables (never Chat/Git/log), configures only synthetic Project UUIDs, closes enrollment, checks worker start/stop and remaining trial credit. Only then enable business LINE and run link/jobs/group/revoke UAT. Changing API flag alone does not stop an existing worker; stop worker deployment and webhook if scope/secret/cost gate fails. No push fallback for expired reply tokens.

No migration in ADR-012; roll back API/Web to previous known-good commits with both LINE modes false if needed. Never roll back schema or overwrite Staging. Blank worker service is not a deployed worker or real-pilot PASS.

## D-033 — link privacy / retention operations

Deploy Web+API+worker from tested code before enabling business LINE. Links use fragment only, client strips it; legacyquerytoken must request new link. Core usesno-referrer; never inspect/log rawaccountLinkredirect orbody/token. Testedge with syntheticcanary only.

Worker sweeps encrypted queuepayload atstartup/eachloop forinboxreceived_at olderthan24h, noevent/auditrowdeletion. Claimsrejectexpiredworkevenbeforesweep. Ifworker/providerdown,physicalcleanupwaitsrestart: inspectoverduepayloadcountonly andrunexpireLinePayloads beforebusinessresumes. Never claimexactwallclockphysicaldeletionduringoutage; stoppilotifcleanupfails. ExistingEmployee/Project/AccountLinkunaffected.
