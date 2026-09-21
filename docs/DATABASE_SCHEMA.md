# DATABASE SCHEMA — Design Rules

สถานะ: Target design ของระบบทั้งหมด ไม่ใช่ migration ทั้งระบบ; M1 เริ่ม executable subset ใน packages/database/migrations/001_foundation.sql และ 002_line_outbox.sql ดู [implemented dictionary/API contract](M1_API_CONTRACT.md) และ [ADR-010](adr/010-foundation-implementation.md) ตารางการเงิน/เวลา/หลักฐานด้านล่างยังไม่ implement

## Scope rule

- ตาราง Project transaction ต้องมี `project_id NOT NULL`
- `job_id` เป็น nullable และเมื่อมีค่าต้องอ้าง Job ที่อยู่ใน Project เดียวกัน
- `site_id` ของ Project เป็น nullable
- ห้ามสร้าง Site/Job ปลอมเพื่อหลบข้อจำกัดฐานข้อมูล
- Assignment รองรับระดับ Project และ optional Job
- Budget line ระบุ scope ชัดเจนและห้ามนับ Project/Job budget ซ้ำ

## Money and audit

- เงินเก็บเป็น integer satang
- Ledger line immutable; correction ใช้ reversal/revision
- Rate/policy มี effective date และ snapshot ตอนคำนวณ
- Migration เป็น append-only หลังใช้ใน environment ร่วม

รายละเอียด entity, constraint และ index ต้องจัดทำใน Milestone 0 ก่อนสร้าง migration แรก

## Milestone 0 logical design — 2026-09-21

รายละเอียดเสนอแล้วใน [DATA_DICTIONARY](DATA_DICTIONARY.md) และ [ADR index](adr/README.md); ยังไม่มี DDL, migration หรือฐานข้อมูลที่ apply แล้ว

- UUID internal ID และ human code คงที่; Project transaction มี project_id NOT NULL, job_id nullable พร้อม composite foreign key ป้องกัน Job ข้าม Project
- Rate/policy effective intervals ไม่ overlap; immutable snapshot สำหรับ ledger/run; เงิน integer satang และ exact arithmetic ตาม [golden cases](PAYROLL_CALCULATION_TEST_CASES.md)
- Approval/source revision มี typed FK; unique source/revision/component ป้องกัน retry ซ้ำ โดย Work มี LABOR+MEAL components; reverses_id unique ป้องกัน reversal ซ้ำ
- Payroll run revision และ payroll ledger แยก Cost Ledger; approved source set/snapshot frozen, late adjustment ไม่แก้ run เดิม
- Evidence/private object metadata แยก binary; accounting export items snapshot และ immutable package revision
- Dictionary เพิ่ม supporting entities สำหรับ policy version, binding code, manual cost adjustment และ commitment ตาม requirement ที่มีอยู่; Opportunity เป็น logical future boundary ยังไม่สร้าง speculative migration
- คำตอบล่าสุด [ADR-008](adr/008-admin-review-ot-retention.md): Admin ตรวจ แก้ไข และอนุมัติค่าใช้จ่ายรายรายการได้ รวมจำนวน รายละเอียด เงิน และรูป แต่ไม่เห็นยอดรวมต้นทุน/ยอดใช้ไปของโครงการ อัตราค่าแรงหรือ Payroll; PM ไม่เห็นเงินหรือรูปบิลของผู้อื่น ยกเว้นรายการที่ตนส่ง; OT hours>0 และ hours*2 เป็นจำนวนเต็ม; expense quantity/unit optional; evidence stored_at/retain_until เก็บ2ปี; Admin approveเวลาเป็นครั้งสุดท้าย Ownerตรวจเงินเท่านั้น เป็น logical design ไม่มี migration
- OT logical fields เปลี่ยนเป็น work_date + hours:decimal ไม่ใช้ started_at/ended_at หรือบังคับ duration_minutes; ไม่ใส่ unique role OWNER เพื่อรองรับหุ้นส่วน3คน; เป็น design ไม่มี migration

Query-driven indexes, concurrency, FK/exclusion enforcement และ restore ต้องทดสอบกับ PostgreSQL จริงใน milestone ถัดไป M0 ไม่มีหลักฐาน TESTED_INTEGRATION

## คำตอบรอบ4 — ลงแทนและรอตรวจ

PM/Admin/Owner ลงวันทำงานและ OT แทนพนักงานใน Project ที่มีสิทธิ์ได้ โดยเก็บผู้กรอกแยกจากพนักงาน ทุกบทบาทส่งค่าใช้จ่ายได้ PM เห็นยอดและรูปเฉพาะรายการที่ตนส่ง LINE expense ทุกบทบาทต้องรอ Admin หรือ Owner กดอนุมัติแยกทุกครั้งก่อนเป็น Actual; Web คงขั้นรอตรวจเดิม ไม่มี auto-approve ตาม [ADR-009](adr/009-delegated-entry-and-expense-review.md) ต้นแบบแสดงช่องทางจำลอง ไม่มีLINEจริง
