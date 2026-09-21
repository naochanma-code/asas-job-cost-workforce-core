# DATABASE SCHEMA — Design Rules

สถานะ: Draft; ยังไม่ใช่ migration

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

