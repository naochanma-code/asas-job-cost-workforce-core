# CHANGELOG

## 2026-09-21 — Master Prompt v2.2

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
