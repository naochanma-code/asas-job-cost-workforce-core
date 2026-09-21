# Milestone 0 — ชุดตรวจแบบกระบวนการ

วันที่ 2026-09-21 · Owner ของงานเอกสาร/ต้นแบบ: Codex · สถานะ OWNER_ACCEPTED / READY_TO_MERGE · รอบ4ตาม MASTER v2.5

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

[ADR-007](adr/007-owner-decisions-m0-r2.md) บันทึกคำตอบแล้ว: Adminดูเงิน/รูปexpenseรายรายการได้แต่ไม่มีต้นทุนรวม/ค่าแรง; PMเห็นexpenseของตน, 3Owner accounts, OTdate+hoursย้อนหลังได้ไม่แยกวัน, สองProjectแบ่งครึ่ง เพิ่มเลือกไฟล์/previewและZIPรายเดือนแบบlocal พร้อม9หมวดexpense เริ่มทดลองโดยเปิด prototype/index.html หรือรัน node docs/verification/serve-m0.mjs ที่ localhost:4174/prototype/index.html

## ขอบเขตของหลักฐาน

Prototype แสดงกระบวนการและข้อความเท่านั้น การสลับ role เป็นตัวช่วย review ไม่ใช่ระบบ authentication หรือหลักฐาน permission ฝั่ง server ทุกรายการอยู่ใน memory และล้างเมื่อ refresh ไม่ส่งข้อมูลออกเครือข่าย

Owner ยืนยันผ่านทั้ง7งานรวมfeedbackล่าสุดเมื่อทดสอบผ่านแล้ว; Codex regressionผ่าน ดู [M0_ACCEPTANCE](M0_ACCEPTANCE.md) ปิดเฉพาะgateกระบวนการM0 ไม่ใช่real pilot และยังไม่อนุญาตmerge/M1

รอบ3ตาม [ADR-008](adr/008-admin-review-ot-retention.md): เวลาAdminอนุมัติครั้งเดียว ไม่ส่งOwnerซ้ำ OTทีละ0.5 และหลักฐานเก็บ2ปี
