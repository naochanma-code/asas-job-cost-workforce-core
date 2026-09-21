# AGENTS.md — กติกาสำหรับ Codex และ Work

Repository นี้เป็นระบบใหม่ของ ASAS Job Cost & Workforce Core ห้ามนำ source code, migration หรือฐานข้อมูลจากแอปเก่ามารวมโดยอัตโนมัติ

## ลำดับเอกสารที่ต้องอ่านก่อนทำงาน

1. `docs/MASTER_PROMPT.md`
2. `docs/PROJECT_STATUS.md`
3. `docs/DECISION_LOG.md`
4. `docs/DATABASE_SCHEMA.md`
5. เอกสาร contract/spec ของ module ที่กำลังแก้

หากแชทขัดกับ Repository ให้หยุดเฉพาะส่วนที่ขัดและบันทึกคำถามใน `PROJECT_STATUS.md` ห้ามใช้ความจำจากแชทแทนเอกสารกลาง

## กติกาการทำงาน

- ทำ vertical slice ทีละ flow และพิสูจน์ด้วย test ก่อนเพิ่มเมนูใหม่
- ใช้ branch แยกงาน เช่น `codex/...` หรือ `work/...`; ระบุ owner ของ module ใน `PROJECT_STATUS.md`
- ห้ามให้ Codex และ Work แก้ module/schema เดียวกันพร้อมกันโดยไม่ตกลง owner
- การเปลี่ยน schema, API contract, permission หรือสูตรเงินต้องบันทึกใน `DECISION_LOG.md` หรือ ADR ก่อน merge
- ทุกการเปลี่ยนต้องอัปเดต `PROJECT_STATUS.md` และ `CHANGELOG.md`
- แยกสถานะ CODED, TESTED, DEPLOYED และ UAT_PASSED ห้ามใช้คำว่า “เสร็จ” โดยไม่มีหลักฐาน
- ห้าม deploy production, ส่ง LINE จริง, เปลี่ยนข้อมูลจริง หรือใช้บริการเสียเงินโดยไม่ได้รับอนุญาต
- ห้ามเก็บ secret, token, รูปบิล, ค่าแรง หรือข้อมูลส่วนบุคคลใน Git, log หรือเอกสาร

## Product rules ที่ห้ามทำผิด

- Project เป็นหน่วยหลัก; Site และ Job เป็น optional
- Project ที่ไม่มี Job ต้องทำ flow ได้ครบและระบบต้องไม่ถาม Job
- Admin ตรวจ แก้ไข และอนุมัติค่าใช้จ่ายรายรายการได้ รวมจำนวน รายละเอียด เงิน และรูป แต่ไม่เห็นยอดรวมต้นทุน/ยอดใช้ไปของโครงการ อัตราค่าแรงหรือ Payroll; PM ไม่เห็นเงินหรือรูปบิลของผู้อื่น ยกเว้นรายการที่ตนส่ง (MASTER v2.5 / ADR-008)
- Owner เป็นผู้กรอกอัตรารายวัน เห็นยอด อนุมัติและ lock รอบค่าจ้าง รองรับหลายบัญชีสำหรับหุ้นส่วน3คน เก็บ audit แยกบัญชี
- Core private storage เป็นแหล่งหลักของรูปหลักฐาน; Drive เป็นเพียง optional export mirror
- Pending ไม่เป็น Actual; approved source ลง ledger ครั้งเดียว; การแก้ย้อนหลังใช้ reversal/revision


- ตาม MASTER v2.5 / ADR-009: PM/Admin/Owner ลงวันทำงานและ OT แทนพนักงานใน Project ที่มีสิทธิ์ได้ โดยเก็บผู้กรอกแยกจากพนักงาน ทุกบทบาทส่งค่าใช้จ่ายได้ PM เห็นยอดและรูปเฉพาะรายการที่ตนส่ง LINE expense ทุกบทบาทต้องรอ Admin หรือ Owner กดอนุมัติแยกทุกครั้งก่อนเป็น Actual; Web คงขั้นรอตรวจเดิม ไม่มี auto-approve
