# Expense approval/correction — future M3 specification

DESIGNED ONLY ตาม D-022. ไม่สร้าง application/table/menu ใน M1 และไม่มีผล runtime test ของ Expense.

| Test | Expected |
| --- | --- |
| ADMIN ส่ง Expense แล้วอนุมัติเอง | submit เป็น PENDING_REVIEW; approve แยก action ผ่าน; เก็บ approver/time/audit |
| OWNER ส่ง Expense แล้วอนุมัติเอง/รายการอื่น | อนุมัติได้ตาม scope และมี actor/time/audit |
| PM หรือ TECH เรียก approve API/ปลอม role | deny; ไม่มี Actual/ledger/audit approval ปลอม |
| Submit ทุกช่องทางรวม LINE โดย actor ผู้อนุมัติ | ยัง PENDING_REVIEW ไม่ auto-approve ไม่เป็น Actual |
| Approve retry/พร้อมกัน | หนึ่ง revision ลง Actual/Cost Ledger ครั้งเดียว; ไม่สร้าง posting ซ้ำ |
| ADMIN แก้รายการ APPROVED ก่อน financial lock | correction/revision; Before/After/Reason/Changed By/Changed At ครบ; source เดิมตรวจย้อนหลังได้ |
| Correct หลัง ledger posted | reversal อ้าง original แล้ว corrected posting; ห้ามแก้ยอดใน ledger เดิม |
| Correction approval โดย ADMIN คนที่แก้เอง | allowed ตาม D-022 พร้อม audit แยก edit/approve |
| Financial LOCKED | ห้ามแก้ตามปกติ รวม ADMIN; OWNER unlock พร้อมเหตุผล/audit หรือ financial revision ก่อน |
| PM/TECH อ่าน expense ของผู้อื่น หรือ Admin เรียก aggregate | deny; Admin ไม่มี Project total/rate/payroll/financial snapshot |
| Missing correction reason/stale revision | reject โดยไม่เปลี่ยน source/ledger |
| Evidence และ reversal/history export | รักษาต้นฉบับและ lineage; exportไม่บวกยอด evidence ซ้ำ |

ต้องพิสูจน์บน native PostgreSQL transactions, retries/concurrency, API scopes และ private storage ใน M3 ไม่ใช้ผล M1 หรือ Prototype แทน.
