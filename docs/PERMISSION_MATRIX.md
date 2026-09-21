# Permission matrix — คำตอบรอบ3

Accepted ตาม [ADR-008](adr/008-admin-review-ot-retention.md) / MASTER v2.4; backend authorization ยัง DESIGNED ไม่ได้พัฒนา

| Resource/action | OWNER | ADMIN | PM | TECH |
| --- | --- | --- | --- | --- |
| Project/Site/Job/team ไม่มีเงิน | ทุกProject | จัดการ | assigned | assigned read |
| คน/วันเข้างาน/วันทำงาน/OT | ดู | ดู/ตรวจ/อนุมัติ | assigned ตามpolicy | own |
| Work/OT อนุมัติ | fallbackตามpolicy ไม่ต้องอนุมัติซ้ำ | อนุมัติแล้วผ่าน | เมื่อเปิดpolicy | deny |
| Expense วันที่/ประเภท/จำนวน/หน่วย/รายละเอียด/เงินรายรายการ | allow | อ่าน/แก้ก่อนอนุมัติพร้อมเหตุผล | deny | own submit/draft |
| Expense รูปบิล/ใบเสร็จ/สลิป | allow | เปิด/เพิ่ม/ลบจากdraftแก้ไข/แทนที่ก่อนอนุมัติพร้อมประวัติ | deny | own |
| Expense approve/reject | allow | allow | deny | deny |
| Budget/Actual/ยอดต้นทุนรวม/ยอดใช้ไปรวม/Remaining/Profit | allow | deny | deny | deny |
| อัตราค่าจ้าง/ยอดPayroll/รายการเพิ่มหักเงิน | allow | deny | deny | deny |
| ปิดข้อมูลเวลาประจำเดือน | fallback | allow ไม่มีเงิน | deny | deny |
| Payroll approve/lock/reopen/pay | allow | deny | deny | deny |
| สรุปค่าใช้จ่ายรายเดือน/ZIPทั้งเดือน | allow | deny | deny | deny |
| Audit | allตามสิทธิ์ | เวลาที่ตรวจ/expenseรายรายการ ไม่มีaggregateหรือPAY | assigned nonfinancial | own status |

ภายนอกdenyทั้งหมด Owner3บัญชีสิทธิ์เท่ากัน auditแยกactor ไม่บังคับอนุมัติร่วม3คน PMไม่ขยายสิทธิ์เงินตามAdmin

## ขอบเขตข้อมูล

Admin time projection: entry_id, employee, project, nullablejob, work_date, day_part, hours, status, exceptions, version ไม่มีrate/amount/raw notesที่เปิดเผยค่าแรง

Admin expense-review projection: id, sender, project, optionaljob, date, category, quantity/unit, note, amount, evidenceที่มีสิทธิ์, status, version, auditก่อนหลังรายรายการ ไม่มีProject totals, budget, payroll หรือfinancial snapshot; signed URLต้องตรวจสิทธิ์รายรายการก่อนออก ไม่ให้bulk export

Adminที่เห็นเงินหลายรายการอาจบวกเองได้ ข้อกำหนดนี้ไม่ให้ระบบแสดง/ส่งยอดรวม ไม่รับรองว่าป้องกันการบวกเองได้ PMไม่รับexpenseหรือreceipt bytes/URL

TECHเห็นเฉพาะexpenseของตน ข้อความกลุ่มLINEไม่มีราคา/PII/Payroll ตรวจrole+capability+scope+ownership+stateก่อนqueryและserializeทุกAPI/export/download การถอนสิทธิ์ต้องdenyใหม่ บันทึกก่อน/หลังและเหตุผลการแก้; รายการapprovedแก้ผ่านrevision/reversalเท่านั้น

## Acceptance

- Adminอ่านและแก้expenseรายรายการรวมรูปได้ แต่ไม่มีProject cost total/rate/payroll/ZIP; PMไม่มีเงิน/รูป
- Adminapproveเวลาแล้วไม่มีOwner time queue ปิดเดือนระบบคำนวณ Ownerตรวจเงินเท่านั้น
- TECH T2ไม่เห็นexpenseของT1; PMที่assignedBไม่เห็นA
- Owner1/2/3เก็บactorแยก; staleversion/duplicate/concurrent payต้องตรวจในbackendก่อนproduction (NOT_RUN)

Role switchของต้นแบบเป็นsimulation ทุกคนอ่านsourceได้ ไม่ใช่securityจริง ใช้ข้อมูลสมมติเท่านั้น
