# Permission matrix

DESIGNED; baseline MASTER §4/5/9/10 และ PAYROLL_POLICY; Q-01 เปิดรอ Owner ขอบเขต deny-by-default นี้เป็นข้อเสนอใน ADR-002 ไม่ใช่การเพิ่มสิทธิ์ให้ role

O = OWNER ทุก Project; A = ADMIN ทุก Project ตามงานธุรการ; P = PM เฉพาะ assigned Project; T = TECH เฉพาะ assigned Project และรายการตนเอง; X = สมาชิกกลุ่มภายนอก ไม่มีบัญชีธุรกิจ

| Resource/action | O | A | P | T | X |
| --- | --- | --- | --- | --- | --- |
| Project/site/job/master data | read/write | read/write | assigned read/manage ตาม policy | assigned read แบบจำกัด | deny |
| Project assignment/group binding | allow | allow | deny default | deny | deny |
| Budget non-pay categories | allow | allow | assigned ตาม policy | deny | deny |
| Budget/Actual รวมค่าจ้าง, profit/margin | allow | deny รอ Q-01 | deny รอ Q-01 | deny | deny |
| Actual expense non-pay categories | allow | allow | assigned read | own expense เท่านั้น | deny |
| วัน/ชั่วโมง/จำนวนคน | allow | allow | assigned | own | deny |
| Work/OT/Expense submit | allow ตาม actor audit | allow ในนามพร้อม audit | assigned ตาม policy | own assigned | deny |
| Review/approve Work/OT/Expense | allow | allow | assigned เฉพาะ Owner enable | deny | deny |
| Review แก้ยอด Expense | allow + reason | allow + reason | เมื่อ policy enable + reason | แก้ draft ของตน | deny |
| Manual Cost Ledger adjustment | allow + reason | deny | deny | deny | deny |
| Signed evidence/download/export Expense | allow | allow scoped non-pay | assigned ตาม policy; default deny bulk | own evidence; deny bulk | deny |
| PAYROLL_INPUT_TIME | allow | allow | deny default | own submission เท่านั้น | deny |
| PAYROLL_VIEW_AMOUNT | allow | deny | deny | deny | deny |
| PAYROLL_EDIT_RATE | allow | deny | deny | deny | deny |
| PAYROLL_ADJUST_AMOUNT | allow | deny | deny | deny | deny |
| PAYROLL_APPROVE (รวม lock/reopen) | allow | deny | deny | deny | deny |
| PAYROLL_PAY | allow | deny | deny | deny | deny |
| Payroll export/payment proof/rate snapshot | allow | deny | deny | deny | deny |
| Audit | all ใน secure view | non-pay operational | assigned non-pay | own status history | deny |
| LINE group response | สถานะรายการขั้นต่ำทุก role; ไม่มีข้อมูลจำกัดสิทธิ์ในกลุ่ม | เช่นเดียวกัน | เช่นเดียวกัน | เช่นเดียวกัน | อ่านข้อความสถานะได้แต่สั่งธุรกิจไม่ได้ |

## Contract projections (ตัวอย่างชื่อเพื่อออกแบบ ไม่ได้สร้าง API)

Admin time row allowlist: entry_id, employee_display_name, project_code, nullable job_code, work_date, day_part, minutes, review_status, exception_code, version; ไม่ส่ง rate_id, daily_rate_satang, hourly_rate, wage/meal/OT/net/gross amount, rate/policy expression, financial snapshot หรือ payroll checksum ที่ dereference ได้

Owner amount projection แยก capability และ request; default mask ในหน้าจอจน Owner เปิดดู ตาม MASTER §11 การ mask ไม่ทดแทน authorization

Admin expense row เห็น expense_amount_satang ได้เพราะเป็นรายจ่ายตรวจบิล แต่ payroll-derived meal allowance และ labour component ไม่ใช้ serializer เดียวกัน ห้ามเอาข้อมูลแรงงานไปใส่ field amount ทั่วไป

Q-01 pending: Admin Dashboard แสดง “เฉพาะหมวดค่าใช้จ่ายที่มีสิทธิ์” ไม่แสดง Project total, remaining, variance, utilization, forecast หรือ downloadable report ที่รวม restricted labour แม้ซ่อนแถว LABOR/OT แล้ว ตัวเลขคนเดียวก็ยัง restricted

## Enforcement ทุกช่องทาง

ตรวจ role + capability + Project membership + ownership + resource state ที่ application service และ query projection ก่อน serialize ทุกครั้ง รวม URL เดา ID, batch endpoint, error, search, notification, worker export และ signed URL issuance ห้ามใช้ client role switch เป็นสิทธิ์จริง

- Export ตรวจตอนขอ/ตอน worker build/ตอน download; ถ้าถูกถอนสิทธิ์ระหว่างทำให้หยุดหรือ deny download ไม่ใช้สิทธิ์เก่าค้าง
- LINE group ห้าม Budget, Actual รวม, Profit/Margin, ค่าแรง, ข้อมูลส่วนบุคคล และหลักฐานที่มี PII; ให้ลิงก์ private authenticated view เฉพาะผู้มีสิทธิ์
- Logs มี correlation ID, opaque source ID, error category ไม่มี raw payload, receipt, credentials, employee rates หรือหมายเลขบัญชี; audit ที่จำเป็นต้องเก็บค่าเงินจริงอยู่ secure data store ไม่ใช่ operational log
- Payroll financial audit และ payment evidence เป็น Owner-only แยกจากศูนย์หลักฐาน expense ของ Admin

## Negative acceptance ที่ต้องพิสูจน์เมื่อมี backend

PM ของ B เดา Project A ID ถูก deny; TECH เดาอีกคน entry/evidence ถูก deny; Admin เรียก rate/payroll API และ export ถูก deny แม้รู้ ID; Admin time JSON ไม่มี forbidden fields; pagination/search/error ไม่ leak; Admin กรองเหลือคนเดียวหรือหัก total กับ expense ไม่อนุมานค่าแรง; notification/group ไม่มี restricted amount; download หลัง revoke deny ข้อเหล่านี้เป็น test specifications ยังไม่ผ่าน integration
