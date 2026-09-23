# PROJECT STATUS — M1 Alignment v3.0

## Staging preflight — 23 กันยายน 2026 หลัง Owner ให้เริ่มต่อ

Owner อนุมัติให้เริ่มกระบวนการตามแผนที่เสนอ จึงเดินหน้า preflight ภายใน Trial เดิม ไม่ขออนุมัติ Deploy ซ้ำ แต่ยังต้องผ่าน Backup/Restore และ maintenance gate ก่อนเปลี่ยนฐานข้อมูล

PASS: fetch ยืนยัน branch ตรง origin ที่ 9bcbe3e; [CI ของ head 35872859835](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35872859835) SUCCESS; Railway แสดง API/Web/Postgres Online; Limited Trial เหลือ $4.89 / 29 วัน ณเวลาตรวจ

BLOCKED_BACKUP_AUTH: หน้า Postgres > Backups ระบุ Create Backup/PITR ต้อง Pro จึงไม่ใช้และไม่อัปเกรด ทางเลือกที่เตรียมคือ pg_dump เข้ารหัส + ดาวน์โหลดไฟล์เข้ารหัสออกจาก provider ผ่าน official Railway CLI และตรวจ Restore ในฐานแยก ต้อง Login CLI บนเครื่องก่อน ขณะนี้ยังไม่มี CLI session ที่ใช้ได้ การเริ่ม Login แบบ background ไม่สำเร็จและยกเลิก process ของ task แล้ว ไม่มีการเก็บหรือแสดง token

เตรียม CLI ทางการ v5.61.0 ใน ignored .local/operator-tools และตัวเปิด .local/RAILWAY-LOGIN.cmd สำหรับ Owner เข้าสู่ระบบโดยตรง ไม่เพิ่ม application dependency หรือบริการ Railway; npm installer ล้มเหลว จึงใช้ binary จาก official railwayapp/cli release แทน

NOT_RUN: Backup ข้อมูลจริง, Restore recovery verification, write freeze, migration003, Deploy Alignment, live UAT ไม่เปิด LINE ไม่ Merge/M2/M3/Production ไม่สร้างบริการเสียเงิน ไม่แก้ข้อมูลจริง ต้องให้ Owner ยืนยัน Login CLI ต่อกับ Railway โดยตรง ไม่ส่ง password/token ในแชท หลัง authentication จะตรวจว่าดาวน์โหลดได้ภายใต้ Trial; หากต้องเสียเงินเพิ่มให้หยุด

อัปเดต 23 กันยายน 2026 · ผู้รับผิดชอบ module: Codex · Branch codex/milestone-1-foundation · Draft PR #2

## ตอนนี้ถึงไหน

พัฒนาและทดสอบ M1 Alignment ผ่าน Local และ CI แล้ว โค้ด c8a522db94f473c2fd81b048cb20e2f876cb0a84 พร้อมเสนออนุมัติ Deploy ไป Staging โดยต้องผ่านเงื่อนไข Backup/maintenance/preflight ก่อนลงมือ ยังไม่ได้ Deploy migration 003 หรือ Web/API รุ่นใหม่ และยังไม่ผ่าน Owner UAT ของรุ่นนี้

| Definition of Done | สถานะและหลักฐาน |
| --- | --- |
| DESIGNED | PASS — Master v3.0, D-021/D-022/D-023, ADR-011 และแผน migration |
| CODED | PASS — Types 5/10, ข้อมูล Project/Job, รหัสไม่ซ้ำ, PM จัดทีม TECH, Audit และ Web forms |
| TESTED_LOCAL | PASS — 32 PASS / 2 native-only SKIP / 0 FAIL; Type Check และ Production Build ผ่าน; M0 45 checks ผ่าน |
| TESTED_INTEGRATION | PASS — [CI 35872122374](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35872122374): Native PostgreSQL 17 รวม 34 PASS / 0 SKIP / 0 FAIL, Docker API/Web build และ smoke ผ่าน |
| DEPLOYED_STAGING | NOT_DEPLOYED สำหรับ Alignment; หลักฐาน deployment ล่าสุดยังเป็นรุ่น 4fcb29e |
| REAL_INTEGRATION_TESTED | NOT_RUN — Real LINE ยังปิด |
| UAT_PASSED | NOT_RUN สำหรับ Alignment; ผล Owner รุ่นเก่าไม่ใช้แทนการรับรุ่นนี้ |
| PRODUCTION_READY | NO — ไม่ Merge PR #2 และไม่ Deploy Production |

## สิ่งที่เพิ่ม

- Project Type เริ่ม 5 ประเภทตาม Owner: Installation, Service, Survey, POC, Other; Job Type เริ่ม 10 ประเภท Admin/Owner เพิ่ม แก้ชื่อ เรียง และเปิด/ปิดได้ ประเภทมาจากฐานข้อมูล
- Project แสดงลูกค้า ประเภท PM วันที่ ความสำคัญ รายละเอียด ความคืบหน้า และสถานะ; Site/Job ยังไม่บังคับ ไม่มีรายการปลอม
- Job มีประเภท รายละเอียด ผู้รับผิดชอบ วันที่วางแผน 5 สถานะ ความคืบหน้า และผู้สร้าง/เวลา; TECH ที่มอบหมายเฉพาะ Job เห็นเฉพาะ Job ของตน
- PM เพิ่ม/ถอนเฉพาะ TECH ใน Project ที่ตนเป็น PM ตรวจ Backend พร้อม Audit ห้ามเปลี่ยนบัญชี Role หรือแต่งตั้ง PM
- รหัสใหม่ PRJ-YYMM-NNN และ JOB-projectNamespace-NN ใช้ตัวนับและทะเบียนรหัสใน transaction รหัสเดิมกับ UUID ไม่เปลี่ยน
- Expense D-022 อยู่ใน [ข้อกำหนดทดสอบอนาคต](M3_EXPENSE_TEST_PLAN.md) เท่านั้น ไม่มี Expense/Payroll API, table หรือ placeholder

## Migration และความเสี่ยงที่เหลือ

เพิ่ม 003_m1_alignment.sql แบบ append-only ไม่แก้ 001/002 ทดสอบย้ายข้อมูลสมมติจาก 001/002, backfill, รันซ้ำ, Backup/Restore และออกรหัสต่อหลัง Restore ผ่านแล้ว ดู [แผน Dry Run / Recovery](M1_ALIGNMENT_MIGRATION_PLAN.md)

ข้อมูลเดิมที่ไม่ทราบประเภทใช้ Other ความคืบหน้าเริ่ม 0 วัน/ผู้รับผิดชอบที่ไม่ทราบเป็น NULL ข้อมูล Job เก่าใช้ผู้สร้าง/เวลาของ Project เป็น fallback ไม่อ้างว่าเป็นประวัติ Job เดิม Primary PM เติมเมื่อมีสมาชิก PM คนเดียว กรณีหลายคนเก็บสมาชิกเดิมทั้งหมด

Backup format 2 เพิ่ม types/counters/reservations; format 1 ต้องกู้ด้วยรุ่นเก่าลงฐานใหม่ก่อน migrate API รุ่นเก่าไม่รองรับ schema 003 ตอน restart จึงต้องหยุด writes ชั่วคราวและ Deploy Web/API คู่กัน ใช้ migration role แยกจาก runtime

Staging มีข้อมูลจริงปน ยังไม่คัดลอก/ลบ/แก้ข้อมูลเหล่านั้น CI ใช้ PostgreSQL 17 ส่วน Railway เดิมใช้ 18; ยังต้องตรวจรุ่นจริงหลังได้รับอนุมัติ Web form render/API tests ไม่ใช่ browser E2E หรือ responsive/UAT ของรุ่นใหม่

## สิ่งที่ Owner ต้องทำต่อ

Owner ให้เริ่มกระบวนการแล้ว ขณะนี้ต้องยืนยันการเข้าสู่ระบบ Railway CLI บนเครื่องเพื่อเตรียมทางเลือก Backup แบบเข้ารหัสก่อน migration ไม่มีการอนุมัติแผนเสียเงินหรือข้าม Backup gate; ช่วง maintenance จะเริ่มได้เมื่อ preflight พร้อมเท่านั้น

Owner ยังไม่ต้องสลับบัญชีทดสอบ รอ Codex ตรวจระบบอัตโนมัติบนชุดสมมติให้ครบหลัง approved deployment แล้วส่งตรวจหน้าจอและ flow เป็นรอบรวม

สถานะ: **Owner ให้เริ่มแล้ว / BLOCKED_BACKUP_AUTH ก่อน Deploy Staging** ยังไม่ใช่ M1 accepted หรือ READY_TO_MERGE ไม่เริ่ม M2/M3, Real LINE หรือ Production

## หลักฐานและไฟล์

[รายการไฟล์และข้อจำกัด](M1_ALIGNMENT_RELEASE.md) · [Test Evidence](M1_TEST_EVIDENCE.md) · [Gap Analysis](MASTER_V3_GAP_ANALYSIS.md) · [ประวัติ Staging](M1_STAGING_HISTORY.md)

Baseline ก่อนแก้ 543a899: fetch/fast-forward แล้ว, CI เดิมผ่าน, PR #2 Draft/ไม่มี conflict/ไม่ตกหลัง main; HTTPS health ของ Staging 200/database ready แบบอ่านอย่างเดียว ไม่อนุมานว่าโค้ดใหม่ deploy แล้ว

งาน M1 อยู่ใน .local/m1-staging โฟลเดอร์หลักยังเป็น branch M2 ที่พักไว้ ไม่รวม migration003_time_entries.sql หรือการแก้ M2 เข้ามาใน PR #2 เอกสารที่บันทึกหลักฐาน CI หลัง code commit ไม่เปลี่ยน application/schema
