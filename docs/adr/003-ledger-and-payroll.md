# ADR-003 — แยก ledger และ snapshot การคำนวณ

- วันที่ 2026-09-21; baseline D-004/D-006, MASTER §5/5.1/6; additional key/precision design Proposed
- Context: เวลาเดียวกันใช้คิดต้นทุนและจ่ายค่าจ้าง แต่บวก Payroll เข้า Actual ซ้ำไม่ได้ การ retry ต้องไม่เพิ่มเงิน และประวัติต้องตรวจย้อนกลับหลัง rate เปลี่ยน
- Proposal: approved source revision มี posting group เดียว; WORK แตก LABOR+MEAL components, OT แตก OT, expense แตก EXPENSE มี unique typed source/revision/component; transaction approval+ledger+outbox เดียวกัน; reversal ผูก original unique และใช้ยอดตรงข้ามเดิม
- Money: integer satang persisted; exact rational calculation; OT hourly = HALF_UP((daily/8)×multiplier) เป็นบาทเต็มก่อนคูณชั่วโมงตาม baseline 970 → 243/364; final sub-satang rounding/minute increments pending Q-03
- Rate/policy effective interval [from,to) ตาม work date ไม่ใช่ approved date; no overlap; snapshot employee name/rate/formula/calendar/source set/result กับ revision
- Payroll ledger ลงตอน approval ของ run; lock freeze revision; reopen ก่อนจ่ายสร้าง revision ใหม่พร้อม reversal ของ approved payroll posting เก่าและ repost ใหม่ ไม่แตะ Cost Ledger หาก source ไม่เปลี่ยน; หลังจ่ายใช้ delta รอบถัดไป/correction payment ที่ Owner อนุมัติ
- Manual payroll add/deduct ไม่เป็น Project cost อัตโนมัติ; ถ้าต้องเป็น cost ใช้ Owner adjustment ที่เชื่อมเหตุผลแยกเพื่อไม่บวกซ้ำ
- Alternatives: query source totals หลายตารางกับ payroll total ทำ double count; mutable ledger ลบหลักฐาน; ปัด OT หลังคูณชั่วโมงทำผลต่างจาก requirement
- Consequences: SQL uniqueness + locks จริงจำเป็น; อนุมัติ source ที่ไม่มี rate ใช้ exception ไม่อ้างว่า posted; Q-04 หลาย Project หยุดเฉพาะ policy ที่ยังไม่มีคำตอบ
- Validation: repeated event 10, concurrent approvals, partial rollback, one reversal, reopen delta, rate boundary, last day/calendar tests ใน payroll cases และ pilot script
