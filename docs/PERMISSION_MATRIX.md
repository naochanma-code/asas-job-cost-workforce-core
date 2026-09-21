# Permission matrix — Owner decisions รอบ2

กติกาธุรกิจ Accepted ตาม [ADR-007](adr/007-owner-decisions-m0-r2.md) / MASTER v2.3; การบังคับสิทธิ์จริงยัง DESIGNED ไม่ได้มี backend

OWNER รองรับหลายบัญชีสำหรับหุ้นส่วน3คน สิทธิ์เท่ากัน audit แยก actor ไม่ใช้บัญชีร่วม ADMIN ทำงานธุรการ PM จำกัด assigned Project TECH จำกัดงานและรายการตนเอง สมาชิกกลุ่มภายนอกไม่มีสิทธิ์ธุรกิจ

| Resource/action | OWNER | ADMIN | PM | TECH | ภายนอก |
| --- | --- | --- | --- | --- | --- |
| Project/site/job/team/master ที่ไม่มีเงิน | ทุกProject | จัดการ | assigned ตามpolicy | assigned read | deny |
| จำนวนคน / วันเข้างาน / วันทำงาน / OT | ทุกProject | ดู/ตรวจ | assigned ดู/ตรวจเมื่อเปิดpolicy | own | deny |
| Work/OT submit | มีactor audit | กรอกแทนพร้อมaudit | ตามpolicy | own assigned | deny |
| Work/OT approve | allow | allow | assigned เมื่อOwner enable | deny | deny |
| Budget / expense amount / Actual / ค่าแรง / กำไร / Payroll | allow | denyทั้งหมด | denyทั้งหมด | เฉพาะexpenseที่ตนส่ง ไม่เห็นเงินประเภทอื่น | deny |
| Expense submit + รูปหลักฐาน | allow | denyในต้นแบบ | denyในต้นแบบ | own assigned | deny |
| Expense แก้ยอด / approve / reject | allowพร้อมเหตุผล | deny | deny | แก้draftตนเอง | deny |
| รูปบิล / ใบเสร็จ / สลิป / raw description / original filenames | allow | deny | deny | own expense | deny |
| Expense folder ZIP / manifest / สรุปเงินรายเดือน | allow | deny | deny | deny | deny |
| PAYROLL_INPUT_TIME | allow | allow | deny default | ส่งเวลาตนเอง | deny |
| PAYROLL_VIEW_AMOUNT / EDIT_RATE / ADJUST_AMOUNT | allow | deny | deny | deny | deny |
| PAYROLL_APPROVE / lock / reopen / PAY | allow | deny | deny | deny | deny |
| Payment proof / financial audit | allow | deny | deny | deny | deny |
| Operational audit / status | all | nonfinancial | assigned nonfinancial | own | deny |

## ไม่มีช่องทางเห็นเงินสำหรับ Admin/PM

ห้ามส่ง amount, rate, budget, actual, profit, variance, remaining, monetary utilization/forecast, financial snapshot, raw expense note, ชื่อไฟล์ผู้ใช้ หรือ receipt bytes/URLs ผ่านหน้าเว็บ API export search notification error audit หรือตารางรวม รูปบิลอาจมีราคาแม้ซ่อน field amount แล้ว จึงไม่ให้ signed URL ด้วย

Admin time projection allowlist: entry_id, employee_display_name, project_code, nullable job_code, work_date, day_part, hours, review_status, exception_code, version จำนวนวันเข้างานใช้ distinct(employee,date); man-days sum day_fraction; headcount distinct employee ไม่ส่ง field เงินเพื่อซ่อน CSS ทีหลัง

Owner เงินเปิดดูหลังยืนยัน role/capability; masking เป็น UX ไม่ใช่ authorization ทุกOwnerมี user_id ของตนและ optimistic version/unique action key ป้องกันอนุมัติหรือจ่ายซ้ำพร้อมกัน ไม่ได้กำหนดให้ทั้ง3คนต้องอนุมัติร่วม

TECH กรอกเงินและเห็นหลักฐานของตนใน private view ตาม expense flow; group confirmation ไม่มีราคา/PII/Budget/Payroll แม้ผู้ส่งเป็นOwner

## Enforcement ที่ต้องทำในระบบจริง

ตรวจ role+capability+project membership+ownership+state ที่ application service ก่อน query/serialize และซ้ำที่ export worker/download การถอนสิทธิ์ต้อง deny download ใหม่ สิทธิ์เก่า/เดา ID ไม่ให้ผ่าน Logs ไม่มีไฟล์หรือข้อมูลเงินจริง Financial audit เก็บใน secure datastore

ต้นแบบ role switch เป็น simulation ที่ทุกคนเปิดดู source ได้ จึงไม่ใช่ความปลอดภัยจริง ใช้ข้อมูลสมมติและไม่มีการเข้าถึงบัญชีจริง

## Acceptance

- ADMIN/PM เปิดทุกหน้าที่เข้าได้: ไม่มีบาท/rate/expense amount/Budget/ภาพบิล/ZIP link หรือ notesที่มีเงิน
- ADMIN/PM เดา evidence/export/payroll API IDs ต้อง deny ใน backend tests (NOT_RUN)
- TECH T2 ไม่เห็น expense/files ของ T1; PM ของBไม่เห็นA
- OWNER1/2/3 ดูเงินและทำactionได้ตามrole แต่ event audit ต้องตรงactor; duplicate/concurrent pay ลงครั้งเดียวใน DB tests (NOT_RUN)
- Admin เห็น AM A + PM B เป็นจำนวนงานครึ่งวันตามProject สรุปทั้งคนรวม1วันเข้างาน/1man-day ไม่เห็นค่ากิน60/120
