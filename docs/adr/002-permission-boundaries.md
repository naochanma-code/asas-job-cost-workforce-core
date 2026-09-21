# ADR-002 — จำกัดข้อมูลค่าจ้างทุกช่องทาง

- วันที่ 2026-09-21; baseline D-004/PAYROLL_POLICY ยืนยัน; แนวทาง aggregate visibility Proposed Q-01
- Context: การซ่อน rate แต่เปิด Actual รวมของงานคนเดียวทำให้หาค่าแรงด้วยการลบ expense ได้; Admin ต้องตรวจเวลาได้โดยไม่รับยอดเงิน
- Proposal: time projection แบบ allowlist แยก Owner financial projection; capability server-side ทั้ง API/export/notification/LINE/audit; Admin/PM ไม่มี payroll amount/rate/derived formula; deny cost aggregate ที่เปิดเผย labour จน Owner ตอบ Q-01
- Admin ยังตรวจ expense amount ได้และเห็น Budget vs Actual เฉพาะ non-pay categories โดยติดป้าย subset; Owner ดู total/reconcile ได้ครบ ไม่แอบแสดง total เป็น subset
- Separate payroll payment evidence จาก expense accounting evidence เพื่อไม่ให้ Admin download หลักฐานจ่ายค่าจ้าง
- Alternatives: CSS masking ไม่กัน network; aggregate without rate ยัง infer ได้; ให้ Admin payroll permission ขัด hard rule จึงไม่ใช้
- Consequences: reporting/query/export ต้องสร้างตาม capability ไม่ serialize แล้วค่อยซ่อน; role switch ใน prototype ไม่ใช่ security proof; PM reviewer ต้อง explicit policy ตาม Project
- Validation: denied ID/URL/export; no amount/rate keys in Admin time JSON; infer-by-subtraction case; group external; revoke download; ยังไม่รัน server tests ใน M0
