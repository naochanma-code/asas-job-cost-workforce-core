# ADR-001 — Project เป็นหน่วยหลัก

- วันที่ 2026-09-21; baseline D-002/MASTER §3/6/7 ยืนยันแล้ว; รายละเอียดที่เพิ่ม Proposed
- Context: Project ไม่มี Site/Job ต้องทำ assignment, budget, time, OT, expense, cost, payroll ได้ครบ ไม่ให้ optional FK กลายเป็นเงื่อนไข UI
- Decision proposal: project_id NOT NULL + job_id nullable และ composite FK scope; Project assignment ใช้ job_assignments ที่ job=null; Site ของ Project nullable; human code ไม่เปลี่ยนตามชื่อ
- Job selection: optional ซ่อนในเพิ่มเติม; required เลือกอัตโนมัติเมื่อหนึ่ง active Job, เลือกเมื่อหลาย; ไม่มี active Job ไม่ถาม Job ให้ Admin แก้ required configuration ไม่สร้าง dummy Job
- Budget proposal Q-05: ENVELOPE 10,000; ALLOCATION B1 4,000/B2 6,000 ไม่เพิ่ม total; ADDITIONAL B1 500 เพิ่ม total เป็น 10,500; allocation รวมไม่เกิน parent; Actual level Project รวม ledger ทุก job + null ครั้งเดียว
- Time Q-04: full ใช้ AM/PM สอง slot ป้องกันซ้ำและ meal เกิน 120/คน/วัน; ไม่ตัดสินกติกา payroll หลาย Project ก่อน Owner ตอบ
- UX threshold proposal: 80 และ 100 อยู่เหลือง, >100 ถึง 110 ส้ม, >110 แดง; zero budget ไม่หารศูนย์
- Rejected alternatives: fake Job/Site ทำให้ต้องถามข้อมูลที่ไม่มีจริง; polymorphic parent ID ทำให้ FK ตรวจไม่ได้; นำ Job allocation บวก envelope ทำงบซ้ำ
- Consequences: ทุก service ต้องตรวจ scope ตอน submit/approve/export; pre-sales มี typed context แยกใน M7 ไม่ลด NOT NULL ของ Project transaction
- Validation: Project A ครบ flow ไม่ถาม Job; B optional/required 0/1/2 jobs; ต่าง Project reject; budget example 10,500 ไม่ใช่ 20,500; pending Owner Q-02/04/05
