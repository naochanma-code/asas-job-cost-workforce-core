# ADR-009 — ลงเวลาแทนและค่าใช้จ่ายทุกบทบาท

Accepted ตามคำสั่ง Owner รอบ4 วันที่21กันยายน2026; แทนADR-008เฉพาะการส่งรายการและPMเห็นexpenseของตน

- PM, Admin, Owner ลงวันทำงาน/OTแทนพนักงานในProjectที่มีสิทธิ์ได้ แยก employee_id ผู้ทำงานออกจาก submitted_by ผู้กรอกจริง; ตรวจassignmentของทั้งผู้กรอกและพนักงาน ไม่ให้สลับactorเพื่อปลอมผู้ส่ง TECHลงเวลาตนเองเท่านั้น
- ทุกบทบาทลงค่าใช้จ่ายของตนได้ PMเห็นเงิน/ภาพเฉพาะที่ตนส่ง ไม่เห็นของคนอื่นหรือยอดรวมProject/Payroll สิทธิ์AdminตรวจexpenseรายรายการและOwnerดูเงินตามเดิม
- ExpenseจากLINEทุกบทบาทรวมAdmin/Ownerเข้าPENDING_REVIEWทุกครั้ง ต้องมีการกดอนุมัติโดยADMINหรือOWNERแยกจากsubmitก่อนเป็นActual ไม่มีauto-approveตามroleผู้ส่ง
- Webคงขั้นรอตรวจเดิมด้วย ไม่ตีความว่าผู้ใช้ยกเว้นWebโดยอัตโนมัติ ผู้มีสิทธิ์อนุมัติสามารถกดตรวจแยกต่างหาก ไม่เพิ่มเงื่อนไขว่าต้องคนละบัญชีโดยไม่มีคำสั่ง
- เก็บsubmitted_by, employee_id(เวลา), source_channel WEB/LINE, submitted_at, reviewed_by/at และrevision audit; approvalครั้งเดียวตามstate/version สถานะpendingไม่เข้าต้นทุนหรือZIP
- M0ใช้ตัวเลือกช่องทางจำลอง ไม่มีLINEจริง ไม่มีการเปลี่ยนproduction permissions

GateปิดM0ต้องแยกผลทดสอบCodexกับคำยืนยันOwnerทั้ง7งาน ไม่สร้างเวลา/assistanceที่ไม่มีหลักฐาน PRพร้อมreviewไม่ได้อนุญาตmergeหรือเริ่มM1
