# PROJECT STATUS

อัปเดตล่าสุด: 21 กันยายน 2026 · ขอบเขตปัจจุบัน Milestone 0 เท่านั้น

## ภาพรวมและสิ่งที่ใช้งานได้จริง

มีเอกสารและต้นแบบ HTML ที่เปิดทดลอง flow ในเครื่องได้ด้วยข้อมูลสมมติ ยังไม่มี production application, backend, database, migration, environment ที่ deploy หรือ LINE OA จริง เริ่มอ่าน [MILESTONE_0](MILESTONE_0.md)

| Workstream | DESIGNED | CODED | TESTED_LOCAL | TESTED_INTEGRATION | DEPLOYED_STAGING | UAT_PASSED | PRODUCTION_READY | Owner / หลักฐาน |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Master requirement v2.2 | YES baseline | N/A | N/A | N/A | NO | NO | NO | Owner / [MASTER_PROMPT](MASTER_PROMPT.md) |
| UX/Wireflow + state | YES proposed | N/A docs | consistency checked | NOT_RUN | NO | NO | NO | Codex / [WIREFLOWS](WIREFLOWS.md), [STATE_DIAGRAMS](STATE_DIAGRAMS.md) |
| Database/contracts/permission | YES proposed | NOT_STARTED | docs only | NOT_RUN | NO | NO | NO | Codex / [dictionary](DATA_DICTIONARY.md), [matrix](PERMISSION_MATRIX.md), [ADR](adr/README.md) |
| Payroll examples/export/pilot specs | YES proposed | N/A docs | arithmetic fixtures only | NOT_RUN | NO | NO | NO | Codex / [TEST_EVIDENCE](TEST_EVIDENCE.md) |
| Clickable process prototype | YES | MOCK_ONLY | browser smoke | N/A no backend | NO | NO | NO | Codex / [prototype](prototype/index.html) |
| Web/LINE production application | NOT_STARTED | NOT_STARTED | NOT_RUN | NOT_RUN | NO | NO | NO | Unassigned until M0 gate |
| Staging/production/real pilot | NOT_STARTED | N/A | NOT_RUN | NOT_RUN | NO | NO | NO | Owner must authorize later scope |

TESTED_LOCAL หมายถึงเฉพาะสิ่งที่ระบุใน [TEST_EVIDENCE](TEST_EVIDENCE.md) ไม่ใช่การทดสอบ API/permission/database/real LINE. M0 ยังเป็น OWNER_REVIEW_PENDING ไม่ผ่าน process gate จากการตรวจของ Codex แทน Owner

## งานในรอบนี้

- ส่งมอบ wireflow Web/LINE, state diagrams, field-level dictionary, permission matrix, Payroll calculation tests, accounting evidence specification, pilot acceptance script และ ADR 6 ฉบับ
- ต้นแบบจำลอง Project A ไม่มี Site/Job และ Project B มี Site/สอง Jobs พร้อมผู้ส่งสองคน; browser smoke A ครบ flow และ B เลือก Job/แยกผู้ส่งผ่าน; local fixture/document checks 24 ข้อผ่าน ไม่มีการใช้ข้อมูลจริง
- Codex รับผิดชอบ docs/schema logical design/prototype ชุดนี้ทั้งหมด; Work ยังไม่มี assignment ร่วม ห้ามแก้ module/schema เดียวกันพร้อมกันโดยไม่ตกลง
- Baseline D-001–D-007 คงเดิม; D-008 และ ADR แยก Proposed จาก Accepted; ไม่แก้ Master Prompt/PAYROLL_POLICY เพื่อกลบข้อขัดแย้ง

## Version / Commit / Environment

- Master Prompt v2.2; base main ตรวจแล้ว: `dd7cbcc2e5379b7fb83c283833332e2710bba936`
- Branch: `codex/milestone-0-process-design`; repository `naochanma-code/asas-job-cost-workforce-core` (Private)
- Artifact version: M0-2026-09-21; commit ตรวจรับระบุใน TEST_EVIDENCE/PR
- Migration: ไม่มี; environment: local HTML + Node fixture checks เท่านั้น
- Deployment: NOT_DEPLOYED; real LINE: NOT_RUN; Owner UAT: NOT_RUN

## Blocker / known issues / ต้องยืนยัน

รายละเอียดพร้อมแหล่งข้อกำหนดและทางเลือกอยู่ [OWNER_QUESTIONS](OWNER_QUESTIONS.md)

1. **Q-01** ADMIN/PM ดูต้นทุน Project แต่ต้องไม่อนุมานค่าจ้าง: หยุด final aggregate visibility; ต้นแบบใช้ non-pay FUEL subset ติดป้าย
2. **Q-02** ตัวอย่าง “ไม่มี Job” เป็น exception ใน MASTER §11 ขัด optional Job: หยุด exception wording; Project A ยังคงไม่ถาม Job ตาม hard rule
3. **Q-03** OT รายนาที/เศษสตางค์/ข้ามคืน/ไม่มี Work: หยุดเฉพาะ formula edge policy; golden whole/half hour ใช้สูตรยืนยันแล้ว
4. **Q-04** วันทำงาน/ค่ากินหลาย Project ต่อวัน: หยุด allocation policy ที่ยังไม่ยืนยัน
5. **Q-05** นิยาม Budget allocation vs additional: เสนอ envelope ไม่บวกซ้ำ รอ Owner
6. **Q-06** เดือน export และ retention 7 ปี: รอ Owner/บัญชีก่อน production
7. **Q-07** งาน/คน/งบ/การจ่าย/restore owner สำหรับ real pilot: checklist รอ milestone ที่เหมาะสม

ส่วนที่ไม่ติดคำตอบได้จัดทำต่อครบตาม scope เอกสาร ไม่มีการตัดสินเรื่องเงิน/สิทธิ์แทน Owner
Prototype ไม่มี required-job mode, durable save, file upload/ZIP generation, effective-rate editor, manual adjustment, reopen/late resolution, API authorization หรือ concurrent worker; flows เหล่านี้มี spec สำหรับ review/implementation ถัดไป ห้ามเรียกว่า tested production feature

## ขั้นตอนถัดไป

1. Owner ตรวจ Q-01 ก่อน (คำแนะนำ: non-pay category view สำหรับ Admin/PM) และพิจารณาคำถามอื่นทีละข้อ
2. Owner ทดลอง 7 tasks ตาม [PILOT_ACCEPTANCE_SCRIPT](PILOT_ACCEPTANCE_SCRIPT.md) พร้อมจด evidence/assistance ไม่ให้ Codex ลงชื่อผ่านแทน
3. Codex ปรับเอกสาร/ต้นแบบตามผล review, update status/changelog/ADR; ยังไม่เริ่ม Milestone 1 จน process gate ผ่าน
