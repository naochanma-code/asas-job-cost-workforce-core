# Master Prompt v3.0 — Gap Analysis

## M1 Alignment — implementation รอบ 23 กันยายน 2026

ช่องว่าง 1–6 มี implementation ใน 003/API/Web/permission tests แล้ว: types, fields, atomic codes, scoped PM assignment/revoke และ Job-level TECH read ขอบเขตแยก Project seed5 ตามคำตอบ Owner D-023; Job seed10 Local 32 PASS/2 native-only SKIP; typecheck/build PASS Native PostgreSQL/container รอ CI ไม่ใช่ DEPLOYED_STAGING/UAT

ช่องว่าง7–8ยังไม่ปิด: migrationและรุ่นใหม่ไม่ deploy; Real LINE ยังปิด และไม่เริ่ม M2/M3 ดู [แผน migration](M1_ALIGNMENT_MIGRATION_PLAN.md), [หลักฐาน](M1_TEST_EVIDENCE.md), [Expense future test plan](M3_EXPENSE_TEST_PLAN.md).

วันที่ตรวจ: 23 กันยายน 2026  
ฐานที่ตรวจ: Draft PR #2 branch `codex/milestone-1-foundation`  
ขอบเขตการตรวจ: ความเข้ากันได้ของ Master v3.0 กับ Foundation ปัจจุบัน ไม่ใช่การรับรอง Production

## สรุป

พัฒนาตาม Master v3.0 ต่อได้โดยไม่ต้องรื้อ Foundation ปัจจุบัน แนวทาง Modular Monolith, TypeScript/PostgreSQL, UUID, optional Site/Job, server-side authorization, audit และ LINE durable inbox/outbox สอดคล้องกับ Target Architecture

ต้องใช้ migration ใหม่แบบ append-only และเพิ่ม API/UI เป็น Milestone ห้ามแก้ `001_foundation.sql` หรือ `002_line_outbox.sql` ที่ใช้แล้ว และห้ามตีความเอกสาร Target ว่า Feature ถูกสร้างแล้ว

## สิ่งที่เข้ากันได้กับโค้ดปัจจุบัน

| เรื่อง | สถานะ | หลักฐาน/หมายเหตุ |
| --- | --- | --- |
| OWNER/ADMIN/PM/TECH | CODED / TESTED | Authentication และ scope ตรวจฝั่ง Server |
| Customer → optional Site → Project | CODED / TESTED | Project สร้างได้โดยไม่มี Site |
| Project → optional Job | CODED / TESTED | Assignment ใช้ `job_id = null` ได้ |
| UUID + Human Code | CODED | แยก ID กับ Code แล้ว |
| Project/Job scope enforcement | CODED / TESTED | Composite FK และ authorization |
| Audit | CODED / TESTED_LOCAL/CI | Foundation actions มี audit |
| LINE account/group binding | CODED / SIMULATED | Real LINE ยังไม่ผ่าน |
| Durable inbox/outbox | CODED / TESTED_INTEGRATION | PostgreSQL-backed; Real LINE ยังไม่ผ่าน |
| TypeScript strict / PostgreSQL / Web/API/Worker | CODED | สอดคล้อง Modular Monolith |
| Railway Staging foundation | IN_PROGRESS | PostgreSQL/Owner bootstrap เตรียมแล้ว; Web/API/UAT ต้องดู PROJECT_STATUS ล่าสุด |

## ช่องว่างที่ต้องปิดใน Milestone 1

1. เพิ่ม `project_types` และ `job_types` แบบ configurable พร้อม stable code, display name, sort order, active flag และ snapshot/display history ตามความเหมาะสม
2. เพิ่ม Project fields: type, manager, start date, target completion date, priority, description, progress และสถานะ PLANNED/ACTIVE/COMPLETED/CLOSED
3. เพิ่ม Job fields: type, description, responsible person, planned date, status และ progress
4. กำหนด concurrency-safe Project/Job code generation และห้ามนำ Code ที่ยกเลิกแล้วกลับมาใช้ซ้ำ
5. ปรับ Project/Job API contract, validation, audit และ Web UX ให้ตรง Master
6. Implement PM assignment policy: PM เพิ่ม/ถอน TECH ได้เฉพาะ Project ที่ตนรับผิดชอบ ห้ามสร้าง User/เปลี่ยน Role/แต่งตั้ง PM และต้อง Audit
7. ทดสอบ Project A ไม่มี Site/Job และ Project B มี Site/Jobs บน Staging
8. ปิด Gate M1 ด้วย Real LINE “งานของฉัน”, account linking และ group binding ก่อน Merge

การเพิ่มเหล่านี้ทำด้วย migration ใหม่ ไม่ต้องรื้อข้อมูล/ตาราง Foundation

## งานที่ต้องพัฒนาตามลำดับ

| Milestone | สิ่งที่ยังไม่มีจริง |
| --- | --- |
| M2 Work & OT | Work/OT tables, flow, approval, conflict, rate snapshot และ hidden cost posting |
| M3 Expense & Evidence | Typed parser, concurrent draft, private object storage, review history, signed URL, evidence export |
| M4 Owner Financial | แยก financial tables/service/API, Selling Price, Estimated Cost, Budget, Profit/Margin/Forecast |
| M5 SMEMOVE Cost | Hardware status, manual actual, references, reconciliation และ completeness |
| M6 Commercial References | Quotation/PO/Invoice references |
| M7 Payroll Summary | Rate/holiday/policy versions, periods, adjustments, lock/revision/paid |
| M8 Pilot | 2–3 Projects จริง, Real LINE, backup/restore และคู่ขนานกับวิธีเดิม |

## จุดเสี่ยงที่ต้องควบคุม

1. **Financial leakage:** ต้องแยก operational/financial query และ serializer ตั้งแต่ M2 ห้ามส่งข้อมูลเงินแล้วซ่อนใน UI
2. **Double cost:** Work/OT/Expense/SMEMOVE ใช้ immutable ledger และ idempotency component key; Payroll total ห้าม post เข้า Project Cost ซ้ำ
3. **Expense self-approval:** ตาม D-022 ADMIN/OWNER อนุมัติรายการตนเองได้ PM/TECH อนุมัติไม่ได้ ต้องทดสอบ actor/time/audit และ correction/reversal หลัง approval
4. **Admin aggregate:** Admin เห็น transaction amount ได้ แต่ API/export ต้องไม่มี Project financial total หรือ profitability projection
5. **Evidence retention:** ห้ามเปิด auto-delete จนกำหนดวันเริ่มนับ การพักลบ (legal hold) และได้รับการยืนยันจาก Owner/ผู้ทำบัญชี ระหว่างนี้เก็บโดยไม่ลบอัตโนมัติ
6. **Cost completeness:** COMPLETE ต้องไม่อาศัย Hardware Status อย่างเดียว ต้องไม่มี source/posting/reconciliation ค้างและ Owner ยืนยัน
7. **Override Work >1.0:** เป็น exception ของ Owner พร้อมเหตุผลและต้องเข้า payroll anomaly review ห้ามเพิ่มยอดจ่ายแบบเงียบ
8. **Migration safety:** Migration ที่ apply แล้ว append-only; ห้ามแก้ไฟล์เดิมเพื่อให้ตรง Target Schema
9. **Scope control:** เอกสาร Required บางไฟล์ยังไม่มี ต้องสร้างเมื่อเริ่ม module นั้น ไม่สร้างเมนูหรือ table speculative

## ข้อเสนอ Default ที่ใช้พัฒนาต่อได้

- Project Code: `PRJ-YYMM-NNN`, sequence atomic ต่อเดือน, ไม่ reuse
- Job Code: `JOB-YYMM-NNN-NN`, sequence ภายใน Project, ไม่ reuse
- PM ส่ง Expense ของตนได้และเห็นเฉพาะรายการตน แต่ไม่ Review รายการผู้อื่น
- ADMIN/OWNER Review Expense ได้รวมรายการตนเองตาม D-022; PM/TECH Review ไม่ได้
- Hardware Status เริ่มจาก `PENDING` เฉพาะเมื่อ Owner ระบุว่า Project มี Hardware; งานบริการเริ่ม `NOT_APPLICABLE`
- Evidence retention 2 ปีเป็น business setting แต่ auto-delete ปิดไว้จน policy/lifecycle ได้รับอนุมัติ
- OT ไม่มี Work Entry เป็น review exception ไม่ reject อัตโนมัติ

## คำถามที่ยังต้องให้ Owner ยืนยันภายหลัง

ไม่ขวางการปิด M1:

1. ระยะเก็บหลักฐาน 2 ปีให้นับจาก Expense Date, Approved Date หรือสิ้นเดือน — แนะนำ Approved Date ถึงสิ้นเดือนเดียวกันในปีที่ครบกำหนด และยังไม่ลบจนผู้ทำบัญชียืนยัน
2. OWNER Override Work เกิน 1.0 วัน ควรเพิ่ม Payroll เต็มตาม fraction หรือเป็นเพียง Operational Exception — แนะนำไม่เพิ่ม Payroll อัตโนมัติ ให้ Owner ตัดสินใน Payroll Review

## คำสั่งดำเนินงาน

1. ใช้ Master v3.0 เป็น Target Specification
2. จบและพิสูจน์ M1 Staging/Real LINE Gate ก่อน
3. ก่อน Merge PR #2 ให้เพิ่มเฉพาะช่องว่าง M1 ที่จำเป็นและไม่ขยายเข้า M2
4. หลัง M1 ผ่าน ให้สร้าง branch/PR ใหม่ต่อ Milestone
5. ทุก Critical Change ต้องมี ADR, migration, permission test และ evidence


## Decisions confirmed after review

- PM เพิ่ม/ถอน TECH ได้เฉพาะ Project ที่ตนรับผิดชอบ ห้ามสร้างผู้ใช้ เปลี่ยน Role หรือแต่งตั้ง PM คนอื่น ทุกครั้งมี Audit
- ADMIN อนุมัติ Expense ได้ทั้งหมดในขอบเขต รวมรายการที่ตนกรอก และแก้หลังอนุมัติผ่าน Correction/Revision/Reversal ที่ตรวจย้อนหลังได้
- OWNER อนุมัติ Expense ได้ทั้งหมดรวมรายการที่ตนกรอก PM/TECH อนุมัติไม่ได้
