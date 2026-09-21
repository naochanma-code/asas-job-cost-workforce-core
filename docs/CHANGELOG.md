# CHANGELOG

## 2026-09-21 — Milestone 0 รอบ2ตามคำตอบ Owner

- ยืนยัน Q-01/02/03วันที่/04/05สิทธิ์/06ขอบเขต: Admin/PMไม่มีเงินทุกประเภท, Ownerหลายบัญชีสำหรับหุ้นส่วน3คน, optional Job, OTdate+hoursย้อนหลังไม่แยกวัน, สองProjectแบ่งครึ่ง และfolderหลักฐานรายเดือน
- เพิ่ม ADR-007/D-009 และปรับ MASTER v2.3, AGENTS, Payroll policy, dictionary/schema, permission matrix, wireflow, state, export และ pilot script ให้ตรงคำตอบ; ไม่เปลี่ยนส่วนที่ Owner ยังไม่ยืนยัน
- เพิ่มเลือกไฟล์จริง/preview/ลบและเพิ่มไฟล์ก่อนส่ง, หมวดexpenseครบ9, Owner-only local ZIP รายเดือนและ3Owner selectors
- แยก UI/time projection ของ Admin/PM ไม่เปิดเงินหรือรูปบิล; ตรวจวันซ้ำและfreezeสรุปเวลาของรอบจำลอง
- 24 baseline checks +13 R2 checksผ่าน; ZIPอ่านด้วย .NET ผ่าน counts/bytes/total; browser smoke8กรณีตาม TEST_EVIDENCE
- Update PROJECT_STATUS; ไม่มี production application, migration, deployment, LINEจริง หรือข้อมูลจริง


## 2026-09-21 — อธิบายคำถามสำหรับโอ๋ให้อ่านง่าย

- เพิ่มคำอธิบายภาษาง่ายใน OWNER_QUESTIONS พร้อมระบุว่าตอนนี้ขอคำตอบเฉพาะ Q-01 และยกตัวอย่างการหาค่าแรงจากยอดต้นทุนรวม
- แยกเรื่องที่คุยภายหลังและอธิบายการลองต้นแบบ 7 งานก่อนจบ Milestone 0
- อัปเดต PROJECT_STATUS ให้ตรงกัน ไม่เปลี่ยนสูตร สิทธิ์ หรือบันทึกว่า Owner อนุมัติแล้ว

## 2026-09-21 — Milestone 0 process design (รอ Owner review)

- เพิ่ม wireflow Web/LINE ทั้ง 5 actions, state diagrams, data dictionary และ permission matrix
- เพิ่ม Payroll golden cases, monthly reconciliation, calendar/late/revision/privacy test specifications
- เพิ่ม Accounting Evidence Export Specification และ Pilot Acceptance Script แยก M0 walkthrough จาก real pilot
- เพิ่ม ADR-001–006, requirement question register และดัชนีเอกสาร Milestone 0
- เพิ่ม clickable prototype เฉพาะข้อมูลสมมติ Project A ไม่มี Site/Job และ Project B มี Site/สอง Jobs; ไม่มี production application หรือ backend
- เพิ่มการตรวจ fixture/ลิงก์และบันทึกหลักฐาน local แยกจาก integration, deployment, real LINE และ Owner UAT ที่ยังไม่รัน
- อัปเดต PROJECT_STATUS, DECISION_LOG และ DATABASE_SCHEMA; เก็บ Master Prompt/PAYROLL_POLICY accepted baseline เดิม
- ใช้ branch codex/milestone-0-process-design; ไม่มี migration/deploy/LINE OA จริง/บริการเสียเงิน
- ตรวจ local fixtures/documents 24 ข้อผ่าน และ browser smoke 8 กรณี; แก้ Job B1 option markup และรักษา click handlers ของ export/payroll ระหว่างตรวจต้นแบบ ผลนี้ไม่ใช่ Owner UAT
- บันทึก artifact commit ที่ตรวจ `be4bfc6137394f34e0b1f5399f98e8a864298f9c` และผล fetch/rebase main (up to date) เพื่อให้ตรวจซ้ำได้

## 2026-09-21 — Master Prompt v2.2

- เผยแพร่เอกสารกลางขึ้น Private GitHub Repository `naochanma-code/asas-job-cost-workforce-core`
- ยืนยันรอบค่าจ้างวันที่ 1 ถึงวันสุดท้ายของเดือน
- กำหนดโอนเงินไม่เกินวันที่ 1 ของเดือนถัดไป
- เพิ่ม workflow ปิดข้อมูลเวลา, Owner approval และ payment recording
- เพิ่ม late adjustment และ audit สำหรับข้อมูลที่มาหลังปิดรอบ
- เพิ่ม `PAYROLL_POLICY.md`

## 2026-09-21 — Master Prompt v2.1

- สร้าง Repository ใหม่แยกจากงานเดิม
- กำหนด Site เป็น optional
- กำหนด Project เป็นหน่วยหลักและ Job เป็น optional
- เพิ่ม Project-level Assignment/Budget/Time/OT/Expense/Cost
- ยืนยันค่ากิน 120/60 เฉพาะวันที่ทำงาน รวมวันหยุดที่มาทำงาน
- ยืนยันไม่ทำภาษีและประกันสังคมใน Release แรก
- กำหนด Admin กรอก/ตรวจข้อมูลเวลาโดยไม่เห็นยอด Payroll
- กำหนด Owner กรอก rate เห็นยอด อนุมัติและ lock
- เพิ่มคำถาม payroll cutoff/payment date
