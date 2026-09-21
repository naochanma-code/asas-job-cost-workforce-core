# Milestone 0 — ชุดตรวจแบบกระบวนการ

วันที่ 2026-09-21 · Owner ของงานเอกสาร/ต้นแบบ: Codex · สถานะ DESIGNED / OWNER_PROCESS_REVIEW_PENDING · รอบ2ตาม MASTER v2.3

รอบแรกอ่านเอกสารบังคับครบ: AGENTS, MASTER_PROMPT v2.2, PROJECT_STATUS, DECISION_LOG, DATABASE_SCHEMA และ PAYROLL_POLICY จาก main `dd7cbcc2e5379b7fb83c283833332e2710bba936` ก่อนออกแบบ ไม่มี production application, migration, deployment, LINE OA หรือบริการเสียเงินในงานนี้

## เอกสารส่งตรวจ

| สิ่งส่งมอบ | เอกสาร |
| --- | --- |
| Web และ LINE wireflow | [WIREFLOWS](WIREFLOWS.md) |
| สถานะและ transition guards | [STATE_DIAGRAMS](STATE_DIAGRAMS.md) |
| Entity/field/constraint/index | [DATA_DICTIONARY](DATA_DICTIONARY.md), [DATABASE_SCHEMA](DATABASE_SCHEMA.md) |
| Permission และการป้องกันข้อมูลเงิน | [PERMISSION_MATRIX](PERMISSION_MATRIX.md) |
| สูตรและตัวอย่างตรวจมือ | [PAYROLL_CALCULATION_TEST_CASES](PAYROLL_CALCULATION_TEST_CASES.md) |
| Export หลักฐานบัญชี | [ACCOUNTING_EVIDENCE](ACCOUNTING_EVIDENCE.md) |
| บทตรวจรับและเกณฑ์ | [PILOT_ACCEPTANCE_SCRIPT](PILOT_ACCEPTANCE_SCRIPT.md) |
| ข้อเสนอทางสถาปัตยกรรม | [ADR index](adr/README.md) |
| คำถาม/ข้อขัดแย้ง | [OWNER_QUESTIONS](OWNER_QUESTIONS.md) |
| หลักฐานตรวจในเครื่อง | [TEST_EVIDENCE](TEST_EVIDENCE.md) |
| ต้นแบบทดลองกด | [prototype/index.html](prototype/index.html) |

## ข้อมูลสมมติเท่านั้น

- Project A `DEMO-PRJ-A`: ไม่มี Site, ไม่มี Job, job_required=false; งบ FUEL 2,000 บาท; ช่าง `DEMO-T1`, `DEMO-T2` มอบหมายระดับ Project
- Project B `DEMO-PRJ-B`: Site `DEMO-SITE-B`; งาน `DEMO-JOB-B1` ติดตั้ง และ `DEMO-JOB-B2` ทดสอบ; default job_required=false; มีชุดทดสอบ required=true แยก
- `DEMO-OWNER-1/2/3`, `DEMO-ADMIN`, `DEMO-PM` เป็น role สมมติ ไม่ใช่บัญชีจริง; PM มอบหมายเฉพาะ B
- วันที่ตัวอย่าง 2026-09-21; กรณีวันอาทิตย์ใช้ 2026-09-27; ปฏิทินวันหยุดสมมติ 2026-09-28
- อัตรา 970/1,000 บาทในเอกสารสูตรเป็น test fixture ที่ Master Prompt ใช้ ไม่ใช่ค่าจ้างพนักงานจริง ห้ามนำข้อมูลส่วนบุคคลหรือบิลจริงเข้า Git

## การปรับรอบ2ตามคำตอบโอ๋

[ADR-007](adr/007-owner-decisions-m0-r2.md) บันทึกคำตอบแล้ว: Admin/PMไม่มีเงิน, 3Owner accounts, OTdate+hoursย้อนหลังได้ไม่แยกวัน, สองProjectแบ่งครึ่ง เพิ่มเลือกไฟล์/previewและZIPรายเดือนแบบlocal พร้อม9หมวดexpense เริ่มทดลองโดยเปิด prototype/index.html หรือรัน node docs/verification/serve-m0.mjs ที่ localhost:4174/prototype/index.html

## ขอบเขตของหลักฐาน

Prototype แสดงกระบวนการและข้อความเท่านั้น การสลับ role เป็นตัวช่วย review ไม่ใช่ระบบ authentication หรือหลักฐาน permission ฝั่ง server ทุกรายการอยู่ใน memory และล้างเมื่อ refresh ไม่ส่งข้อมูลออกเครือข่าย

Milestone 0 ยังไม่ผ่าน gate จน Owner ทำ 7 tasks โดยไม่ต้องมีผู้ชี้ขั้นตอนและยืนยันคำศัพท์/flow ส่วนที่ขัดกันหยุดเฉพาะการตัดสินใจนั้นตาม [คำถาม](OWNER_QUESTIONS.md) ไม่เริ่ม Milestone 1 จากการมีเอกสารเพียงอย่างเดียว
