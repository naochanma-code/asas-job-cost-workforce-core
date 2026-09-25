# Permission matrix — Master v3.0

Accepted ตาม [ADR-009](adr/009-delegated-entry-and-expense-review.md) ต่อจาก ADR-008 / MASTER v2.5; M1 operational authorization มี implementation; ส่วน Work/Expense/Financial/Payroll ยังเป็น target design

| Resource/action | OWNER | ADMIN | PM | TECH |
| --- | --- | --- | --- | --- |
| Project/Site/Job/team ไม่มีเงิน | ทุกProject | จัดการ | จัดการ Job และเพิ่ม/ถอน TECH เฉพาะ Project ที่รับผิดชอบ; ห้ามจัดการ Role/PM | assigned read |
| คน/วันเข้างาน/วันทำงาน/OT | ดู | ดู/ตรวจ/อนุมัติ | assigned ตามpolicy | own |
| Work/OT ลงแทนพนักงาน | allow scoped | allow scoped | assigned Project | ตนเองเท่านั้น |
| Expense submit | allow | allow | own assigned | own assigned |
| Work/OT อนุมัติ | fallbackตามpolicy ไม่ต้องอนุมัติซ้ำ | อนุมัติแล้วผ่าน | เมื่อเปิดpolicy | deny |
| Expense วันที่/ประเภท/จำนวน/หน่วย/รายละเอียด/เงินรายรายการ | allow | อ่าน/แก้ก่อนอนุมัติพร้อมเหตุผล | own submit/read | own submit/draft |
| Expense รูปบิล/ใบเสร็จ/สลิป | allow | เปิด/เพิ่ม/ลบจากdraftแก้ไข/แทนที่ก่อนอนุมัติพร้อมประวัติ | own | own |
| Expense approve/reject | allow รวมรายการตนเอง | allow รวมรายการตนเองตาม scope | deny | deny |
| Budget/Actual/ยอดต้นทุนรวม/ยอดใช้ไปรวม/Remaining/Profit | allow | deny | deny | deny |
| อัตราค่าจ้าง/ยอดPayroll/รายการเพิ่มหักเงิน | allow | deny | deny | deny |
| ปิดข้อมูลเวลาประจำเดือน | fallback | allow ไม่มีเงิน | deny | deny |
| Payroll approve/lock/reopen/pay | allow | deny | deny | deny |
| สรุปค่าใช้จ่ายรายเดือน/ZIPทั้งเดือน | allow | deny | deny | deny |
| Audit | allตามสิทธิ์ | เวลาที่ตรวจ/expenseรายรายการ ไม่มีaggregateหรือPAY | assigned nonfinancial | own status |

ภายนอกdenyทั้งหมด Owner3บัญชีสิทธิ์เท่ากัน auditแยกactor ไม่บังคับอนุมัติร่วม3คน PMเห็นexpenseของตนตามADR-009 ไม่ได้สิทธิ์ตรวจexpenseผู้อื่น

## ขอบเขตข้อมูล

Admin time projection: entry_id, employee, project, nullablejob, work_date, day_part, hours, status, exceptions, version ไม่มีrate/amount/raw notesที่เปิดเผยค่าแรง

Admin expense-review projection: id, sender, project, optionaljob, date, category, quantity/unit, note, amount, evidenceที่มีสิทธิ์, status, version, auditก่อนหลังรายรายการ ไม่มีProject totals, budget, payroll หรือfinancial snapshot; signed URLต้องตรวจสิทธิ์รายรายการก่อนออก ไม่ให้bulk export

Adminที่เห็นเงินหลายรายการอาจบวกเองได้ ข้อกำหนดนี้ไม่ให้ระบบแสดง/ส่งยอดรวม ไม่รับรองว่าป้องกันการบวกเองได้ PMไม่รับexpenseหรือreceipt bytes/URLของผู้อื่น

TECHเห็นเฉพาะexpenseของตน ข้อความกลุ่มLINEไม่มีราคา/PII/Payroll ตรวจrole+capability+scope+ownership+stateก่อนqueryและserializeทุกAPI/export/download การถอนสิทธิ์ต้องdenyใหม่ บันทึกก่อน/หลังและเหตุผลการแก้; รายการapprovedแก้ผ่านrevision/reversalเท่านั้น

## Acceptance

- Adminอ่านและแก้expenseรายรายการรวมรูปได้ แต่ไม่มีProject cost total/rate/payroll/ZIP; PMเห็นเฉพาะเงิน/รูปexpenseของตน
- Adminapproveเวลาแล้วไม่มีOwner time queue ปิดเดือนระบบคำนวณ Ownerตรวจเงินเท่านั้น
- TECH T2ไม่เห็นexpenseของT1; PMที่assignedBไม่เห็นA
- Owner1/2/3เก็บactorแยก; staleversion/duplicate/concurrent payต้องตรวจในbackendก่อนproduction (NOT_RUN)

Role switchของต้นแบบเป็นsimulation ทุกคนอ่านsourceได้ ไม่ใช่securityจริง ใช้ข้อมูลสมมติเท่านั้น

## ส่งรายการรอบ4

PM/Admin/Owner ลงวันทำงานและ OT แทนพนักงานใน Project ที่มีสิทธิ์ได้ โดยเก็บผู้กรอกแยกจากพนักงาน ทุกบทบาทส่งค่าใช้จ่ายได้ PM เห็นยอดและรูปเฉพาะรายการที่ตนส่ง LINE expense ทุกบทบาทต้องรอ Admin หรือ Owner กดอนุมัติแยกทุกครั้งก่อนเป็น Actual; Web คงขั้นรอตรวจเดิม ไม่มี auto-approve ดู [ADR-009](adr/009-delegated-entry-and-expense-review.md) เก็บsubmitted_by/employee_id/source_channel/submitted_at/reviewed_by/at การapproveแยกจากsubmitแม้ผู้ส่งมีroleผู้ตรวจ

## Master v3.0 additions — 2026-09-23

- OWNER เท่านั้นเข้าถึง Selling Price, Estimated/Actual Cost aggregate, Budget, Profit, Margin, Forecast, Rate, Payroll, Financial Adjustment/Lock และ External Actual Cost
- ADMIN อ่าน/แก้/อนุมัติ Expense transaction พร้อม amount/evidence ได้ แต่ API/export/dashboard ห้ามคืน Project cost total, budget-vs-actual หรือ profitability
- PM ส่งและอ่าน Expense ของตนตาม assigned Project ได้ ไม่อ่านของผู้อื่นและไม่เป็น reviewer โดย default
- ADMIN และ OWNER อนุมัติ Expense ที่ตนกรอกได้ตาม D-022 ทุกครั้งต้องมี actor/time/audit; PM/TECH อนุมัติไม่ได้
- Financial service/query/serializer แยกจาก operational view ห้ามใช้ CSS hide เป็น permission
- Project Type/Job Type จัดการได้โดย OWNER/ADMIN; stable code ที่ใช้งานแล้วเปลี่ยนความหมายย้อนหลังไม่ได้


## Post-approval correction — D-022

ADMIN แก้ Expense หลังอนุมัติได้ก่อน Financial Lock ผ่าน Correction/Revision พร้อมเหตุผลและ before/after หาก Cost Ledger ถูก post แล้วต้องสร้าง Reversal และ corrected posting ห้าม update ledger/source เดิมแบบเงียบ เมื่อ Financial Status=LOCKED ต้องให้ OWNER Unlock/สร้าง Financial Revision ก่อน

## M1 Alignment API enforcement — D-022/D-023

| Action | OWNER / ADMIN | PM | TECH |
| --- | --- | --- | --- |
| Type create/rename/order/enable | allow | deny | deny |
| Type read | allow | allow | allow (operational reference only) |
| Create Project / assign primary PM / change PM membership | allow | deny | deny |
| Edit Project operational fields / create-edit Job | allow | membership of this Project required; cannot set manager | deny |
| Candidate technician lookup | scoped active TECH fields only | own Project; employee ID/name only; no account directory | deny |
| Assignment list/assign/revoke | existing operational authority | own Project AND target role TECH; cannot target OWNER/ADMIN/PM | deny |
| User create/change active/role | create/active OWNER only; role change absent | deny | deny |
| Project/Job read | all | PM membership only (employee assignment not enough) | Project-level assignment: jobs in that project; Job-level assignment: only assigned jobs |

Project lock serializes PM grant/revoke with team operations. Target employee/user row locks serialize status changes. Every successful assignment/revoke has actor/time/audit; duplicate assignment and repeated revoke do not create extra audit. Tests call API directly, not UI role-switch. Financial fields/Expense menus absent.

## LINE Pilot ชั่วคราว — D-030 / ADR-012

เฉพาะ OWNER เริ่ม private enrollment และเฉพาะ OWNER ผู้เริ่มรอบอ่านผลได้ ADMIN/PM/TECH403; ต้องเปิด enrollmentmode โดย operator และปิดbusinessLINEก่อน. ขั้นนี้ไม่เชื่อมบัญชีหรือgrantสิทธิ์อัตโนมัติ ผลIDsมีไว้ตั้งRailwayVariablesโดยตรง ไม่ส่งChat/Git/Log

บนbusinessLINE ทุกบทบาทรวมOWNERเห็นได้เฉพาะ intersection ของสิทธิ์เดิมกับ LINE_TEST_PROJECT_IDS; allowlistว่างไม่เห็นProjectใด. Group codeต้องอยู่ในallowlistทั้งตอนสร้างและconsume. Sourceผู้ส่ง/กลุ่มตรวจซ้ำก่อนprocessและdelivery ไม่แก้สิทธิ์WebหรืออนุมัติM2/M3


D-032: AccountingConnector/InventoryConnector และ optionalAIinterface ต้องบังคับ permission/scope เดิม ไม่ให้servicecredentialหรือproviderresponseขยายสิทธิ์ actor. เปลี่ยนproviderไม่เปลี่ยนสิทธิ์OWNER/ADMIN/PM/TECH และไม่ทำauto-approval; ดู [ADR-013](adr/013-provider-agnostic-integrations.md)
