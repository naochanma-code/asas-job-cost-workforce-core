# M1 Alignment — รายการส่งตรวจ

## 24 กันยายน 2026 — DEPLOYED_STAGING / รอ Owner UAT

Owner อนุมัติ Backup/Recovery และ migration003/grants/Deploy SHA cda461d แล้ว ทั้ง API/Web Online; encrypted backup และ isolated restore PASS; legacy business digest ไม่เปลี่ยน; HTTPS24 checks และ restart persistence PASS; log sample ไม่พบ secret patterns LINE=false ไม่เปลี่ยนแผน ไม่ Merge/M2/M3/Production ดู [หลักฐาน Staging](M1_ALIGNMENT_STAGING_EVIDENCE.md) สถานะรออนุมัติด้านล่างเป็นประวัติที่แก้ไขแล้ว


วันที่ 23 กันยายน 2026 · Code commit c8a522db94f473c2fd81b048cb20e2f876cb0a84 · PR #2 ยัง Draft

## ผลที่ผู้ใช้จะได้รับหลังอนุมัติ Deploy

- Admin/Owner ตั้งค่า Project Type 5 และ Job Type 10 ประเภทเริ่มต้น เพิ่มประเภทเอง แก้ชื่อ เรียงลำดับ และเปิด/ปิดได้ ข้อมูลเก่าเก็บประเภทและชื่อ snapshot เดิม
- Project แสดงลูกค้าและข้อมูลแผนงานครบ สร้างโดยไม่มี Site/Job ได้ Job มีรายละเอียด ผู้รับผิดชอบ วันที่ สถานะ และความคืบหน้า
- PM จัดทีม TECH ได้เฉพาะ Project ที่รับผิดชอบ ทุกการเพิ่ม/ถอนมี Audit และตรวจสิทธิ์ฝั่ง API
- ระบบออกรหัส Project/Job โดยไม่ซ้ำเมื่อบันทึกพร้อมกัน และเก็บประวัติรหัสใน Backup

## การทดสอบและข้อจำกัด

ดูผล Local/CI และลิงก์หลักฐานที่ [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md) สถานะ Deploy/UAT แยกไว้ใน [PROJECT_STATUS](PROJECT_STATUS.md)

Web form tests เป็นการ render/serialize component และ API integration ไม่ใช่ browser E2E ของ flow ใหม่หรือ Owner UAT บน Railway; ต้องตรวจหน้าจอและ responsive หลัง approved deployment อีกครั้ง CI ใช้ PostgreSQL 17 ส่วน Railway เดิมเป็น PostgreSQL 18 จึงยังต้อง preflight/verification บนรุ่นจริงหลังอนุมัติ

ข้อมูล Job เก่าขาด creator/date จึงใช้ของ Project เป็น fallback ที่ระบุไว้ ไม่สามารถกู้ประวัติ Job ที่ไม่เคยบันทึกได้ รหัสเก่า/UUID ไม่เปลี่ยน ประเภทที่ไม่ทราบใช้ Other ความคืบหน้าเริ่ม 0 และวัน/ผู้รับผิดชอบที่ไม่ทราบเป็น NULL

ไม่มี Expense/Payroll module หรือ placeholder; Expense approval เป็น test plan ในอนาคตเท่านั้น LINE จริงยังปิด M1 ทั้ง milestone ยังไม่ UAT_PASSED/READY_TO_MERGE

## ขั้นตอนหลัง Owner อนุมัติ

ใช้ [แผน Dry Run / Recovery](M1_ALIGNMENT_MIGRATION_PLAN.md): ยืนยันเครดิต Trial, Backup ข้อมูลจริงแบบ private/encrypted และการกู้คืนที่ได้รับอนุมัติ, หยุด writes ชั่วคราว, migrate 003 ด้วย operator, grant สิทธิ์ตารางใหม่, Deploy Web/API คู่กัน แล้วตรวจชุดข้อมูลสมมติ แผนนี้ไม่อนุญาตให้ลบหรือเขียนทับ Staging เดิม

Owner ตรวจรอบรวมหลังระบบทดสอบเอง: ประเภทงาน, Project ไม่มี Site/Job, Project มี Site/หลาย Job, PM จัดทีมและ TECH เห็นเฉพาะงานที่มอบหมาย โดยไม่ต้องสลับบัญชีเพื่อช่วย automated tests ทีละขั้น

## ไฟล์ที่เปลี่ยนใน code commit (35 ไฟล์)

- .env.example
- apps/api/src/app.ts
- apps/api/src/foundation.ts
- apps/web/app/foundation-fields.tsx
- apps/web/app/page.tsx
- apps/web/app/style.css
- deploy/grant-m1-alignment.sql
- deploy/provision-m1-roles.sql
- docs/CHANGELOG.md
- docs/DATABASE_SCHEMA.md
- docs/DATA_DICTIONARY.md
- docs/DECISION_LOG.md
- docs/M1_ALIGNMENT_MIGRATION_PLAN.md
- docs/M1_API_CONTRACT.md
- docs/M1_TEST_EVIDENCE.md
- docs/M3_EXPENSE_TEST_PLAN.md
- docs/MASTER_PROMPT.md
- docs/MASTER_V3_GAP_ANALYSIS.md
- docs/OPERATIONS_RUNBOOK.md
- docs/PERMISSION_MATRIX.md
- docs/PROJECT_STATUS.md
- docs/adr/011-m1-v3-alignment.md
- docs/adr/README.md
- packages/database/backup.ts
- packages/database/index.ts
- packages/database/migrations/003_m1_alignment.sql
- packages/database/runtime-security.ts
- packages/domain/foundation.ts
- packages/domain/projects.ts
- scripts/migrate.ts
- tests/alignment-web.test.ts
- tests/alignment.test.ts
- tests/foundation.test.ts
- tests/native-restore.test.ts
- tests/native-runtime-role.test.ts

เอกสาร release นี้และการบันทึกผล CI เป็น documentation follow-up แยกจาก code commit ไม่ทำให้การ Deploy เกิดขึ้น
