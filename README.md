# ASAS Job Cost & Workforce Core

ระบบใหม่สำหรับจัดการต้นทุน Project งานภาคสนาม หลักฐานค่าใช้จ่าย และสรุปค่าจ้างพนักงานรายวันของ ASAS IT

สถานะปัจจุบัน: `M0 MERGED / M1 IN_PROGRESS` — เริ่ม Foundation ตามคำอนุมัติ Owner มี Web/API และฐานข้อมูลทดสอบบนเครื่อง ยังไม่ deploy หรือผ่าน LINE จริง ดู [วิธีรัน](docs/OPERATIONS_RUNBOOK.md), [สถานะ](docs/PROJECT_STATUS.md) และ [ผลทดสอบ M1](docs/M1_TEST_EVIDENCE.md)

## เป้าหมาย Release แรก

- Web สำหรับ Owner/Admin/PM
- LINE สำหรับช่าง: ดูงาน ลงวันทำงาน ลง OT ส่งค่าใช้จ่าย และตรวจสถานะ
- Project-level Budget vs Actual โดย Site/Job เป็น optional
- หลักฐานบัญชีรายเดือนและ export
- สรุปค่าจ้างรายวัน โดย Admin ไม่เห็นยอดเงินและ Owner อนุมัติ

เริ่มทำงานโดยอ่าน `AGENTS.md` และ `docs/MASTER_PROMPT.md` ก่อนเสมอ


## ทดลอง Milestone 0 รอบ2

เปิด [ต้นแบบ](docs/prototype/index.html) ใน browser หรือรัน `node docs/verification/serve-m0.mjs` แล้วเปิด `http://127.0.0.1:4174/prototype/index.html` ใช้ภาพทดสอบ เลือกไฟล์จากเครื่องได้แต่ไม่ส่ง server และ refresh ล้างข้อมูล

Admin ตรวจexpenseรายรายการรวมเงิน/รูปได้ ไม่เห็นต้นทุนรวม/ค่าแรง; PM เห็นคน/วัน/ชั่วโมงและexpenseของตน ทุกบทบาทลงexpenseได้ PM/Admin/Ownerลงเวลาแทนได้ Owner3บัญชีดูเงินและดาวน์โหลดfolderบิลรายเดือน (ZIP) รายละเอียด [คำตอบโอ๋](docs/OWNER_QUESTIONS.md) และ [หลักฐานตรวจ](docs/TEST_EVIDENCE.md) ยังไม่ใช่Production/LINEจริง

Milestone 0: OWNER_ACCEPTED / MERGED ตาม [ผลตรวจรับ](docs/M0_ACCEPTANCE.md) Merge PR#1 เข้า main แล้ว Milestone 1 พัฒนาบน branch แยกตาม [ขอบเขตที่ Owner อนุมัติ](docs/M1_FOUNDATION_PROPOSAL.md)
