# ASAS Job Cost & Workforce Core — Master Prompt v3.0

วันที่ปรับปรุง: 25 กันยายน 2026
Product Owner: โอ๋ / ASAS IT Co., Ltd.  
ผู้พัฒนา: Codex และ Work ผ่าน Repository กลาง  
สถานะ: Canonical Product Specification

เอกสารฉบับนี้เป็น Master Prompt หลักเพียงฉบับเดียว และแทน Requirement / Master Prompt เวอร์ชันก่อนหน้าที่ขัดกับเอกสารนี้ หากเอกสารอื่นใน Repository ขัดกับ Master Prompt ฉบับนี้ ให้ยึดเอกสารนี้และบันทึกการแก้ไขลง Decision Log

เลขเวอร์ชันใช้ v3.0 แทนชื่อร่าง v2.4 ที่ Owner ส่งมา เนื่องจาก Repository มี v2.5 อยู่แล้วและการเปลี่ยนครั้งนี้เป็นการปรับขอบเขตครั้งใหญ่ ห้ามตีความว่า v3.0 หมายถึง Feature ทั้งหมดถูกพัฒนาแล้ว สถานะการพัฒนาจริงให้ดูที่ `PROJECT_STATUS.md`

## 1. เป้าหมายและขอบเขตผลิตภัณฑ์

สร้างระบบบริหาร Project ของ ASAS IT โดยมุ่งเน้น:

1. Project และ Job
2. คนรับผิดชอบและคนที่เข้าทำงาน
3. วันทำงาน / Man-day
4. OT
5. ค่าใช้จ่ายหน้างาน
6. รูปและหลักฐานค่าใช้จ่าย
7. ต้นทุนจริงของ Project
8. ราคาขาย ต้นทุนประมาณการ กำไร Margin และ Forecast สำหรับ OWNER
9. สรุปค่าจ้างจาก Work / OT
10. LINE เป็นช่องทางหลักสำหรับ Technician

ระบบต้องเรียบง่าย ใช้งานจริงได้ ตรวจสอบย้อนหลังได้ และไม่สร้าง ERP ซ้ำกับระบบภายนอก

### 1.1 Product boundary

ASAS Core รับผิดชอบ:

`Project + Job + Workforce + Work Day + OT + Expense + Evidence + Project Cost + Owner Financial + Payroll Summary`

ระบบ ERP/Accounting ภายนอกที่ Owner เลือก (ปัจจุบันใช้ SMEMOVE) รับผิดชอบ:

`Product + Purchase + Receiving + Inventory + Stock + Serial + Accounting Operations`

Core เก็บเพียงยอด Actual Hardware/Material ที่ Owner นำมาอ้างอิงกับ Project และ Commercial Document Reference ที่จำเป็น ห้ามสร้าง Procurement, Stock หรือ Accounting ซ้ำ

### 1.2 Final scope rule

ก่อนเพิ่ม Feature ให้ถามว่า “จำเป็นต่อ Project, Workforce, Expense, Cost หรือ Profit หรือไม่” หากไม่ใช่ ให้พิจารณาไม่สร้างใน Core เป้าหมายคือข้อมูลน้อยแต่ถูกต้อง ใช้งานง่าย ตรวจสอบย้อนหลังได้ และทำให้ OWNER เห็นต้นทุนกับกำไรของ Project ได้จริง

### 1.3 ERP/Accounting-provider agnostic — D-032

ASAS Core ห้ามผูก Business Logic โดยตรงกับ SMEMOVE, FlowAccount หรือผู้ให้บริการรายอื่น ต้องมี `AccountingConnector` และ `InventoryConnector` เป็น Integration Boundary แยกจาก domain/application rules โดย provider adapter แปลง API/SDK/schema/status เป็น contract กลาง

FlowAccount OpenAPI เป็น Candidate Integration สำหรับ Expense/Accounting และ Inventory ในอนาคต ยังไม่ใช่การเลือก provider หรือยืนยันความสามารถ API. FlowAccount MCP เป็น Optional AI Interface ห้ามใช้เป็น System-of-Record Integration Path หรือ fallback สำหรับ sync/reconciliation

Inventory Master ยังใช้ระบบเดิม การเปลี่ยนไป FlowAccount ต้องผ่าน Stock + Warehouse + Serial POC และ Reconciliation Gate พร้อม Owner อนุมัติ cutover แยกต่างหาก รายละเอียดขอบเขต/แผนทดสอบอยู่ [ADR-013](adr/013-provider-agnostic-integrations.md). Decision นี้เป็น design ไม่เริ่ม integration/Inventory/Expense ใน M1

## 2. Product และ UX principles

- ภาษาไทยเข้าใจง่าย Mobile Friendly และ Responsive
- ลด Field และจำนวน Click ไม่ถามข้อมูลที่ระบบรู้อยู่แล้ว
- ใช้ Default ที่แก้ได้ มี Confirmation ก่อน Transaction สำคัญ
- มี Loading, Empty, Error, Retry และ Unsaved-state
- ผู้ใช้เห็นเฉพาะข้อมูลที่เกี่ยวกับหน้าที่และ Project ของตน
- Advanced Feature อยู่ใน “เพิ่มเติม”
- หน้าแรกแต่ละ Role เน้นสิ่งที่ต้องจัดการ
- ห้ามแสดง Placeholder Menu สำหรับสิ่งที่ยังใช้จริงไม่ได้
- ทำ Vertical Slice ให้จบและทดสอบก่อนขยายเมนู
- Technician ไม่ควรถูกบังคับเข้า Web สำหรับงานประจำ

## 3. Roles และ Security boundary

Role หลัก:

- OWNER
- ADMIN
- PM
- TECH

รองรับ OWNER หลายบัญชี รวมกรณีหุ้นส่วน 3 คน สิทธิ์เท่ากันและ Audit แยก actor ไม่บังคับอนุมัติร่วมกัน เว้นแต่มี Policy ใหม่

การซ่อน Menu ไม่ถือเป็น Security ต้องบังคับ Permission ที่ API, Application Service, Database Query Boundary, Export, LINE Response และ Background Job ห้าม Query Financial Data ทั้งหมดส่งเข้า Browser แล้วซ่อนด้วย CSS

### 3.1 OWNER

OWNER เห็นและจัดการ:

- ทุก Project / Job
- Selling Price และ Estimated Cost
- Financial Budget และ Actual Cost รวม
- Cost Ledger, Budget vs Actual, Profit, Margin และ Forecast
- Employee Rate และ Payroll Amount
- External Actual Hardware/Material Cost
- Financial Adjustment, Reconciliation, Audit และ Financial Lock

### 3.2 ADMIN

ADMIN จัดการ:

- Customer, optional Site, Project, Job และ Assignment
- Operational Plan, Progress และ Milestone
- Work Entry และ OT
- Expense และ Evidence
- แก้ Expense ก่อนอนุมัติพร้อมประวัติ
- ดู Amount และ Evidence ระดับ Expense Transaction

ADMIN ไม่เห็น:

- Selling Price
- Estimated Project Cost และ Financial Budget
- Project Actual Cost รวม
- Budget vs Actual, Profit, Margin และ Forecast
- Employee Daily Rate
- Labor/OT Cost Amount
- Payroll Amount
- Financial Summary, Financial Chart หรือ Profitability Dashboard

ระบบไม่ต้องป้องกัน ADMIN จากการนำ Transaction Amount ไปบวกเองภายนอก แต่ห้ามสร้างหรือส่ง Official Financial Summary ให้ ADMIN

### 3.3 PM

PM ดูเฉพาะ Project ที่ได้รับมอบหมาย จัดการ Job, Team ตาม Policy, Progress, Milestone, Work, OT และ Operational Plan ได้

PM ส่ง Expense ของตนได้และเห็น Amount/Evidence ของรายการที่ตนส่งตามขอบเขต Project แต่ไม่เป็น Financial Reviewer โดย Default และไม่เห็น Expense ของผู้อื่นหรือ Financial Summary

PM ห้ามเห็น Selling Price, Estimated Cost, Financial Budget, Actual Cost รวม, Profit, Margin, Employee Rate และ Payroll Amount

### 3.4 TECH

TECH ใช้ LINE เป็นหลักและสามารถ:

- ดูงานของตน
- ลงวันทำงาน
- ลง OT
- ส่ง Expense และแนบ Evidence
- ดูสถานะรายการของตน

TECH ห้ามเห็น Financial Project Data, Budget, Cost รวม, Profit, Margin, Employee Rate และ Payroll Summary

### 3.5 Delegated entry

PM, ADMIN และ OWNER ลง Work/OT แทนพนักงานใน Project ที่มีสิทธิ์ได้ ต้องเก็บ `employee_id`, `submitted_by`, `source_channel` และเวลาแยกกัน TECH ลงให้ตนเองเท่านั้น

PM เพิ่มหรือถอน Assignment ของ TECH ได้เฉพาะ Project ที่ PM รับผิดชอบ ห้าม PM สร้างผู้ใช้ เปลี่ยน Role มอบสิทธิ์ OWNER/ADMIN หรือแต่งตั้ง PM คนอื่น ทุกการเพิ่ม/ถอนต้องมี Audit

ทุก Role สามารถส่ง Expense ตามขอบเขตของตนได้ และ Expense ทุกช่องทางต้องผ่าน PENDING_REVIEW ก่อนเป็น Actual PM/TECH อนุมัติไม่ได้ ADMIN อนุมัติได้ทั้งหมดในขอบเขตงาน รวมรายการที่ ADMIN กรอกเอง เพื่อไม่ให้งานกองที่ OWNER และ OWNER อนุมัติได้ทั้งหมดรวมรายการที่ OWNER กรอกเอง ทุก Approval ต้องเก็บ actor/time/audit

## 4. Customer, Site, Project และ Job

รองรับทั้ง:

- `Customer → Project`
- `Customer → Site → Project`

Site เป็น optional ห้ามสร้าง Site ปลอม เช่น Default, Unknown หรือไม่ระบุ

### 4.1 Project

Project เป็นหน่วยหลัก ข้อมูลขั้นต่ำ:

- Project ID แบบ UUID/ULID
- Project Code เช่น `PRJ-2609-001`
- Project Name
- Customer
- Site optional
- Project Type
- Project Manager
- Start Date และ Target Completion Date
- Status, Priority, Description และ Progress
- Created By / Created At

Human-readable Code แยกจาก Internal ID และต้องสร้างแบบ concurrency-safe

Project Type เป็น Configurable Master Data ค่าเริ่มต้น:

- Installation
- Service
- Survey
- POC
- Other

Owner ยืนยันรอบ M1 Alignment ให้เริ่ม 5 ประเภทตาม D-023; ประเภทอื่นเพิ่มภายหลังได้

OWNER/ADMIN เพิ่ม เปลี่ยน Display Name เรียงลำดับ และ Disable ได้ Code ที่มีการใช้งานแล้วห้ามเปลี่ยนความหมายย้อนหลัง

### 4.2 Job

Project อาจไม่มี Job มีหนึ่ง Job หรือหลาย Job ได้ ห้ามบังคับสร้าง Job เพื่อให้ Schema ทำงาน

Job ข้อมูลขั้นต่ำ:

- Job ID
- Job Code เช่น `JOB-2609-001-01`
- Project ID
- Job Type
- Job Name และ Description
- Responsible Person
- Planned Date
- Status และ Progress
- Created By / Created At

Job Status:

- `PLANNED → ACTIVE`
- `ACTIVE ↔ BLOCKED`
- `ACTIVE / BLOCKED → DONE`
- `PLANNED / ACTIVE / BLOCKED → CANCELLED`

Job Type เป็น Configurable Master Data ค่าเริ่มต้น:

- Installation
- Service Support
- PM Visit
- Site Survey
- POC
- Configuration
- Testing
- Training
- Office Work
- Other

Code ที่ใช้งานแล้วห้ามเปลี่ยนความหมายย้อนหลัง

### 4.3 Assignment

Project Assignment เป็น Default และ Job Assignment เป็น optional:

- `Project → Project Members`
- `Project → Job → Job Members`

TECH เห็นเฉพาะ Project/Job ที่เกี่ยวข้องกับตน การระบุ Job ต้องตรวจว่า Job อยู่ใน Project เดียวกัน

### 4.4 Operational plan

ADMIN/PM บริหาร Planned Man-day, จำนวน Technician, Planned Duration, Planned Start/Finish, Milestone, Progress และ Responsible Person โดยไม่เห็นต้นทุนแรงงานเป็นบาท ตัวอย่าง `4 คน × 10 วัน = 40 Man-day`

## 5. Work Day / Man-day และ OT

ระบบไม่ใช่ Attendance Punch Clock ไม่เก็บ Start/End Time, Check-in/out หรือ GPS

Work Type:

- FULL = 1.0 Man-day
- AM = 0.5 Man-day
- PM = 0.5 Man-day

Work Entry เก็บ Employee, Work Date, Project, Job optional, Work Type, Description optional, Submitted By, Source Channel, Status, Reviewed By/At

Status:

`DRAFT → SUBMITTED → APPROVED / REJECTED / CANCELLED`

Employee หนึ่งคนหนึ่งวันมี Work Fraction รวมไม่เกิน 1.0 โดย Default:

- A AM + B PM = 1.0 อนุญาต
- A FULL + B PM = 1.5 ไม่อนุญาต

OWNER Override ได้พร้อมเหตุผลและ Audit

หน้า “วันนี้ใครทำงานที่ไหน” ใช้ Work Entry ไม่สร้าง Attendance Module แยก ADMIN/PM เห็น Employee, Project, Job, FULL/AM/PM และ Status โดยไม่เห็น Cost

### 5.1 OT

OT แยกจาก Work Entry ไม่เก็บ Start/End Time เก็บ Employee, Date, Project, Job optional, OT Hours, Description/Reason, Submitted By, Status และ Reviewer

OT เป็นจำนวนบวกเพิ่มทีละ 0.5 ชั่วโมง ใช้วันที่เลือกและจำนวนชั่วโมง ลงย้อนหลังได้ แม้คาบเกี่ยววันถัดไปไม่แยกวันและใช้ Rate/Calendar ของวันที่เลือกทั้งรายการ

Status:

`DRAFT → SUBMITTED → APPROVED / REJECTED / CANCELLED`

กรณี OT ไม่มี Work Entry ให้ Flag เป็น Exception เพื่อ Review แต่ไม่ Reject อัตโนมัติจนกว่าจะกำหนด Policy เพิ่ม

## 6. Expense และ Evidence

Typed Text เป็น Primary Input รูปเป็น Evidence ไม่ใช่ Source หลักของยอดเงิน OCR/AI ไม่ใช่ Critical Path และห้าม Auto-post

Expense เก็บ:

- Expense Date
- Project
- Job optional
- Expense Category
- Amount
- Description
- Expense Owner
- Submitted By
- Created By
- Evidence
- Status

Release แรกไม่บังคับ VAT, WHT, Tax ID, Invoice Line Detail หรือ Bank Verification

ค่าเริ่มต้นของ Expense Category:

- FUEL
- TRAVEL
- ACCOMMODATION
- MEAL
- MATERIAL_DIRECT
- HARDWARE_DIRECT
- SUBCONTRACTOR
- TRANSPORT
- OTHER

เพิ่ม/Rename Display Name/Disable ได้ แต่ Code ที่ใช้งานแล้วห้ามเปลี่ยนความหมาย

### 6.1 LINE expense

ตัวอย่าง:

- `น้ำมัน 500 เติมรถไปหน้างาน`
- `ซื้อสายแลน 1300 ใช้ติดตั้งหน้างาน`

ระบบ Parse อย่างน้อย Amount, Category และ Description ถ้าอยู่ใน Project Group ที่ Binding แล้วไม่ถาม Project ซ้ำ

ก่อนบันทึก Bot ต้องสรุป Project, Job, Date, Category, Amount, Description และจำนวน Evidence พร้อมปุ่ม:

- ยืนยันส่งตรวจ
- แก้ไข
- ยกเลิก

หาก Parse ไม่มั่นใจให้ผู้ใช้แก้เอง Expense Flow ต้องทำงานต่อได้เมื่อ OCR/AI ล่ม

Status:

`DRAFT → PENDING_REVIEW → APPROVED / REJECTED / CANCELLED`

Expense ยังไม่เป็น Actual Project Cost จน Approved

ADMIN แก้ Date, Category, Amount และ Description ก่อน Approve ได้ ทุกการแก้เก็บ Before, After, Changed By/At และ Reason

หลัง Approved ห้ามแก้ Source หรือ Ledger เดิมแบบเงียบ ADMIN ทำ Correction ได้ก่อน Financial Lock โดยต้องใส่เหตุผล สร้าง Revision และหาก Cost Ledger ถูก Post แล้วให้สร้าง Reversal ก่อน Post ยอดแก้ไขใหม่ ADMIN อนุมัติ Correction ของตนได้พร้อม Audit เมื่อ Financial Status=LOCKED ต้องให้ OWNER Unlock/สร้าง Financial Revision ก่อน

### 6.2 Draft concurrency safety

LINE Draft ต้องผูกกับ Channel, Group/Private, Sender, Project, Job optional และ Flow ID ห้ามใช้ “รูปล่าสุด”, “Draft ล่าสุด” หรือ “Message ล่าสุด” ของ Group เพราะผู้ใช้หลายคนอาจส่งพร้อมกัน

### 6.3 Evidence

รองรับ JPG, PNG, WebP และ PDF จำนวน 1–5 ไฟล์ต่อ Expense ขนาดเริ่มต้นไม่เกิน 10 MB/ไฟล์ ตรวจ MIME และ Magic Bytes

LINE ไม่ใช่ Permanent Storage ต้องนำไฟล์เข้า Private Object Storage ของ Core และเก็บ Evidence ID, Expense ID, Project ID, Job ID optional, File Hash, MIME, Size, Object Key, Created By/At

ใช้ Signed URL อายุสั้น ห้ามใช้ Public Permanent URL Object Key ใช้ ID ไม่ใช้ชื่อพนักงานหรือข้อมูลอ่อนไหว การลบหรือแทนที่ต้องมี Audit

Core Private Storage เป็น Source of Truth Google Drive เป็น Optional Export Mirror เท่านั้น

Evidence Center สำหรับ OWNER/ADMIN ค้นตาม Year, Month, Project, Job, Employee, Category และ Status ADMIN เห็น Transaction Amount แต่ Export ของ ADMIN ห้ามสร้าง Project Financial Summary หรือ Financial Aggregate

OWNER ส่งออก ZIP ตามเดือน โครง `YYYY/MM/PROJECTCODE/[_JOBCODE]/` พร้อม manifest CSV/XLSX, checksum, revision และ superseded history ระยะเก็บหลักฐาน 2 ปี โดย lifecycle/วันเริ่มนับต้องกำหนดก่อนเปิดงานลบจริง

## 7. Project Financial — OWNER ONLY

Financial Data ต้องแยกจาก Operational Data ตั้งแต่ Database, Application Service, API, UI และ Export

OWNER กรอก:

- Selling Price
- Estimated Total Cost
- Optional Financial Budget Breakdown
- Expected Remaining Cost

Budget Breakdown เป็น optional:

- Hardware
- Material
- Labor
- OT
- Fuel
- Travel
- Accommodation
- Meal
- Subcontractor
- Transportation
- Other

Owner สามารถเริ่มด้วย Selling Price และ Estimated Total Cost เพียงสองค่า

คำนวณ:

- Estimated Profit = Selling Price − Estimated Cost
- Estimated Margin = Estimated Profit ÷ Selling Price × 100
- Actual Profit = Selling Price − Actual Cost Ledger
- Actual Margin = Actual Profit ÷ Selling Price × 100
- Forecast Final Cost = Actual Cost + Expected Remaining Cost
- Forecast Profit = Selling Price − Forecast Final Cost
- Forecast Margin = Forecast Profit ÷ Selling Price × 100

Release แรกใช้ Rule-based Forecast ไม่ใช้ AI

## 8. External Actual Cost และ Commercial References

Core ไม่สร้าง Procurement, PO, Receiving, Inventory, Stock, Serial หรือ Accounting Operation

Project Financial Profile มี Hardware Cost Status:

- NOT_APPLICABLE — ไม่มี Hardware Cost และไม่เตือน
- PENDING — มี Hardware Cost แต่ Owner ยังไม่กรอก
- RECORDED — Owner กรอกแล้ว

OWNER กรอก Actual Hardware/Material Cost ระดับ Project หรือ Job optional โดยมี Amount, Cost Type, Provider/External Reference optional, Date, Note, Entered By/At Approved Entry สร้าง Cost Ledger

External Reference เป็นเพียง Purchase/Receiving/Invoice/Document Number หรือ Link พร้อม provider และ connection/company scope เพื่อย้อนกลับไปดูระบบต้นทาง ไม่ใช่ identity ภายในของ Core

Core เก็บ Commercial Reference:

- QUOTATION
- CUSTOMER_PO
- INVOICE

ข้อมูลขั้นต่ำ: Type, Number, Date, Project, Job optional, Provider/External Reference/Link optional, Note

Core ไม่ Copy Item Lines, ไม่ทำ Billing, AR, Collection หรือ Payment Tracking Selling Price ให้ OWNER กรอกตรง ไม่ Auto-calculate จากเอกสารเหล่านี้

ต้อง Reconcile ป้องกัน Hardware/Material รายการเดียวถูกนับทั้ง Expense และ External Actual Cost ก่อน Financial Finalization

## 9. Cost Ledger

Project Actual Cost มาจาก Cost Ledger เท่านั้น Dashboard ห้าม Sum Source Tables โดยตรง

Source:

- APPROVED_WORK_ENTRY
- APPROVED_OT_ENTRY
- APPROVED_EXPENSE
- WORK_MEAL_ALLOWANCE
- EXTERNAL_ACTUAL_COST
- OWNER_MANUAL_ADJUSTMENT
- REVERSAL

เมื่อ Work Approved ให้คำนวณ Labor และ Meal เมื่อ OT Approved ให้คำนวณ OT เมื่อ Expense Approved ให้ลง Expense Cost เมื่อ Owner Approve External Actual Cost ให้ลง Hardware/Material Cost

Unique Idempotency Key ใช้ `source_type + source_id + cost_component` เพราะ Work หนึ่งรายการสร้าง LABOR และ MEAL ได้

Ledger ที่ Approved เป็น Immutable ห้าม Delete/Update Amount หรือแก้ Source แบบเงียบ การแก้ใช้ Original → Reversal → Corrected Entry และตรวจย้อนหลังได้

จำนวนเงินทางการเก็บเป็น Integer Satang ห้าม Floating Point

### 9.1 Cost completeness

Dashboard ต้องแสดง:

- PARTIAL เมื่อ Hardware Status=PENDING หรือมี Work/OT/Expense/Cost Posting/Reconciliation ที่เกี่ยวข้องค้าง
- COMPLETE เมื่อ Hardware=NOT_APPLICABLE หรือ RECORDED, ไม่มีรายการค้างที่ต้องนับ, Ledger reconcile ผ่าน และ OWNER ยืนยันความครบถ้วน

เมื่อ PARTIAL ให้แสดง `Actual Profit (ต้นทุนยังไม่ครบ)` ห้ามทำให้เข้าใจว่าเป็น Final

## 10. Labor, Meal, Rate และ Holiday

Employee Rate เป็น OWNER ONLY และมี Employee, Daily Rate, Effective From/To, Version, Created By ช่วง Effective ห้าม Overlap แบบกำกวม

Backend ใช้ Rate ตาม Effective Date และ Snapshot Rate/Formula/Policy ลง Ledger

คำนวณ:

- FULL = Daily Rate × 1.0
- AM/PM = Daily Rate × 0.5
- Sunday/Holiday = Daily Rate × 2 × Day Fraction
- Meal FULL = 120 บาท
- Meal AM/PM = 60 บาท

Meal จ่ายเฉพาะ Approved Work Entry รวมวันหยุดที่มาทำงาน ไม่จ่ายวันลา/ขาดงาน

OT:

- วันปกติ = ROUND_HALF_UP(Daily Rate ÷ 8 × 2) เป็นบาทเต็ม × OT Hours
- วันหยุด = ROUND_HALF_UP(Daily Rate ÷ 8 × 3) เป็นบาทเต็ม × OT Hours

ตัวอย่าง Daily Rate 970 บาท: Normal OT 243 บาท/ชั่วโมง และ Holiday OT 364 บาท/ชั่วโมง Frontend/Backend ห้ามใช้สูตรต่างกัน

Sunday เป็น Holiday Default ADMIN เพิ่มวัน New Year, Songkran หรือ Company Holiday ได้ การเปลี่ยน Calendar ห้ามเปลี่ยน Payroll ที่ Lock แล้ว

## 11. Payroll Summary

Approved Work/OT เป็น Source ของ Project Cost Ledger และ Payroll Ledger แต่ห้ามนำ Payroll Total ไปบวก Project Cost ซ้ำ

รอบค่าจ้างวันที่ 1 ถึงวันสุดท้ายของเดือน:

`OPEN → TIME_REVIEWED → OWNER_REVIEW → APPROVED → LOCKED → PAID`

ADMIN ตรวจ FULL/AM/PM และ OT Hours โดยไม่เห็น Rate/Amount ปิดข้อมูลเวลาไม่เกิน 10:00 น. วันที่ 1 OWNER กำหนด Rate เห็นยอด เพิ่ม/หัก อนุมัติ Lock และ Mark Paid โดยโอนไม่เกินวันที่ 1 ของเดือนถัดไป แม้วันที่ 1 เป็นวันหยุดให้ใช้ Electronic Transfer เป็น Default

ข้อมูลที่มาหลัง TIME_REVIEWED ห้ามแก้ยอดเดิมแบบเงียบ ต้องเป็น LATE_ADJUSTMENT และเลือก Reopen ก่อนจ่ายหรือยกไปรอบถัดไป

OWNER เพิ่ม/หัก Manual Adjustment ได้โดยมี Type, Amount, Reason, Created By และ Evidence optional

Release แรกไม่คำนวณ Tax, Social Security, Loan หรือ Advance อัตโนมัติ จนกว่าจะยืนยันกับผู้ทำบัญชี ให้เรียกผลลัพธ์ว่า “สรุปค่าจ้าง” ไม่อ้างว่าเป็น Payroll ตามกฎหมายครบถ้วน

## 12. Project lifecycle, Progress และ Milestone

Project Operational Status:

`PLANNED → ACTIVE → COMPLETED → CLOSED`

เมื่อ CLOSED ห้ามสร้าง Work/OT/Expense ใหม่ตามปกติ รายการ Pending เดิมยัง Review ได้ OWNER/ADMIN Reopen ได้พร้อม Reason/Audit

Financial Status แยก:

`OPEN → RECONCILING → FINALIZED → LOCKED`

Project ปิด Operational แล้ว OWNER ยังเพิ่ม Hardware Actual, Reconcile, Correct Cost, Add Adjustment และตรวจ Profit ได้จน Financial Lock

เมื่อ LOCKED ห้ามแก้ Financial Data ตามปกติ การ Unlock เป็น OWNER Only พร้อม Reason, Audit และ Revision

Progress รองรับ Status, Progress %, Issue, Blocker, Note และ Milestone โดยไม่สร้าง Planning Engine หรือ Full Gantt

Milestone เก็บ Name, Planned Date, Actual Date, Responsible Person, Status และ Note ค่าเริ่มต้น เช่น Survey, Delivery, Installation, Configuration, Testing, Migration, UAT, Training และ Handover

## 13. LINE-first contract

Technician มี 5 เมนู:

1. งานของฉัน
2. ลงวันทำงาน
3. ลง OT
4. ส่งค่าใช้จ่าย
5. ตรวจสถานะของฉัน

ใช้ Quick Reply/Button ให้มากที่สุด

Work: Project → Job เมื่อจำเป็น → FULL/AM/PM → Description optional → Confirm  
OT: Project → Job optional → Date → Hours → Description → Confirm  
Expense: Typed text → Evidence → Parse → Summary → Confirm → PENDING_REVIEW

Project Group ที่ Binding แล้วไม่ถาม Project ซ้ำ

Bot หนึ่งตัวรองรับหลาย Group ADMIN สร้าง One-Time Binding Code หนึ่ง Group มีหนึ่ง Active Project Project หนึ่งมีหลาย Group ได้เมื่อ ADMIN ตั้งใจ

ผู้ใช้ต้อง Link LINE Account กับ Employee Account ก่อนทำ Business Transaction ห้ามใช้ Display Name หรือ Group Member Name เป็น Identity

### 13.1 Reliability

Webhook:

1. Verify LINE Signature จาก raw body
2. Validate Payload
3. Persist Event ลง Durable Inbox
4. Commit
5. Reply HTTP 200
6. Worker Claim Event
7. Process Business Logic
8. Persist Business Transaction
9. Write Notification Outbox
10. Retry อย่างปลอดภัย

Event Status: RECEIVED, PROCESSING, DONE, RETRY, DEAD

ต้องมี Idempotency สำหรับ LINE Webhook, Work, OT, Expense, Approval, Cost Posting, Hardware Cost, Payroll Posting และ Notification

Production ใช้ Web, API, PostgreSQL, Private Object Storage, Durable Inbox/Outbox และ Background Worker เริ่มจาก PostgreSQL-backed Queue ได้ ห้ามใช้ Memory-only Background Task

## 14. Web UX

OWNER:

1. ภาพรวม
2. โครงการและงาน
3. รายการรอตรวจ
4. ต้นทุนและกำไร
5. ทีมงานและค่าจ้าง
6. หลักฐาน / Reference
7. ตั้งค่า

ADMIN:

1. ภาพรวมงาน
2. โครงการและงาน
3. รายการรอตรวจ
4. ทีมงาน
5. หลักฐาน
6. รายงานการทำงาน
7. ตั้งค่า

ADMIN ไม่มีเมนูต้นทุนและกำไร

Project Detail Operational Tabs:

- Overview
- Jobs
- Team
- Work & OT
- Expenses
- Milestones
- References
- Activity

OWNER เพิ่ม Financial, Cost Ledger และ Profitability

OWNER Dashboard ต้องตอบ Selling Price, Estimated/Actual Cost, Completeness, Labor, OT, Expense, Hardware/Material, Profit, Margin, Forecast และ Risk ได้รวดเร็ว

ADMIN Dashboard ตอบ Active/Due Projects, Pending Work/OT/Expense, วันนี้ใครอยู่ Project ไหน, Blocked Job, Missing Work Entry และ Operational Progress โดยไม่แสดง Financial Summary

## 15. Architecture และข้อมูลหลัก

ใช้ Modular Monolith:

- Identity & Access
- Customer / Site
- Project / Job
- Assignment
- Operational Planning
- Work / OT
- Expense & Evidence
- Project Financial
- Cost Ledger
- External Actual Cost
- Commercial References
- Payroll
- LINE Integration
- AccountingConnector / InventoryConnector (future integration boundary; adapters แยกจาก Business Logic)
- Reporting
- Audit & Operations

โครงสร้าง:

```text
apps/
  web
  api
  worker
packages/
  domain
  database
  contracts
  ui
```

ใช้ TypeScript Strict, PostgreSQL, S3-compatible Object Storage และ Managed-container compatible ต้อง Hosting Agnostic และ ERP/Accounting-provider agnostic; Core ใช้ AccountingConnector/InventoryConnector ตาม ADR-013 ไม่เรียก provider โดยตรง

Core entities อย่างน้อย:

- users, employees, employee_rate_versions, line_accounts
- customers, sites, projects, project_types
- project_financial_profiles, project_members, project_operational_plans, project_milestones
- jobs, job_types, job_assignments
- cost_categories, budgets, budget_lines
- work_entries, overtime_entries
- expense_submissions, expense_evidence, expense_review_history
- external_actual_cost_entries, commercial_references
- cost_ledger
- holiday_calendars
- payroll_periods, payroll_runs, payroll_lines, payroll_adjustments, payroll_ledger, payroll_revision_history
- line_group_bindings, line_event_inbox, line_conversation_flows, notification_outbox
- audit_logs

Project Transaction มี `project_id NOT NULL`; `job_id` nullable และถ้ามีต้องเป็น Job ใน Project เดียวกัน

Audit อย่างน้อย Project, Job, Work, OT, Expense/Correction, Selling Price, Estimated Cost, Budget, Employee Rate, External Actual Cost, Cost Adjustment, Project Close/Reopen, Financial Finalize/Lock/Unlock และ Payroll โดยเก็บ Before/After, User, Timestamp, Reason และ Correlation ID ตามความเหมาะสม

## 16. Testing strategy และ Definition of Done

Risk-based tests:

- Unit: FULL/AM/PM, Conflict, OT, Holiday, Meal, Rate Version, Permission, State, Financial Formula
- Integration: PostgreSQL Transaction, Approval, Ledger, Reversal, Idempotency, Concurrency, Payroll และ Financial Permission
- LINE: Private/Group, Multiple Users, Duplicate Webhook, Text/Image order, Multiple Images, Failure Recovery
- Security: ADMIN/PM/TECH ดึง Selling Price, Estimated Cost, Budget, Actual Total, Profit, Margin, Forecast, Rate และ Payroll Amount ไม่ได้ผ่าน UI/API/Export/LINE/Direct URL
- Backup/Restore และ Provider Restore
- Real-device Owner/Admin/PM/TECH UAT

Expense tests ต้องครอบคลุม “น้ำมัน 500”, “500 ค่าน้ำมัน”, parse ไม่ได้, Text ก่อน/หลัง Image, Multiple Evidence/Users, Admin Correction, Approval Retry, Duplicate Webhook, Storage Failure และ Cost Posting Once

Hardware tests ครอบคลุม NOT_APPLICABLE, PENDING→PARTIAL, RECORDED→COMPLETE หลัง Reconcile

Project Close tests ครอบคลุมไม่มี Site/Job/Hardware, Closed ไม่รับ Source ใหม่, Pending Review ต่อได้, Owner เติม Hardware หลัง Close, Financial Lock แยก และ Reopen มี Audit

Feature status:

- DESIGNED
- CODED
- TESTED_LOCAL
- TESTED_INTEGRATION
- DEPLOYED_STAGING
- REAL_INTEGRATION_TESTED
- UAT_PASSED
- PRODUCTION_READY

ห้ามรายงาน “เสร็จ” จากการมี Menu, Page, Table, API หรือ Mock Test

## 17. Milestones และ Gates

### Milestone 0 — Process Prototype

Owner/Admin/Technician flows, Financial Permission, Work/OT/Expense, Wireflow, Permission Matrix, Data Dictionary และ State Diagram

Gate: ผู้ใช้เข้าใจ Process และไม่มี Requirement Conflict หลัก

### Milestone 1 — Foundation

Repository, Environment, Authentication, Roles, Customer, optional Site, Project, optional Job, configurable Project/Job Types, Assignment, Audit, LINE Account Linking และ Group Binding

Gate: ADMIN สร้าง Project/Job และ Assign Team ได้ TECH เห็นงานจริงใน LINE โดย Project ที่ไม่มี Site/Job ทำงานได้ครบ

### Milestone 2 — Work & OT

FULL/AM/PM, Man-day, Conflict, OT, LINE Submit, Web Review/Approval และ Hidden Labor Cost Posting

Gate: Work/OT คำนวณถูกและ ADMIN ไม่เห็นเงินค่าแรง

### Milestone 3 — Expense & Evidence

Typed Expense, Photo Evidence, LINE Confirmation, Durable Inbox/Worker, Admin Review/Correction, Cost Ledger Posting และ Evidence Center

Gate: Real Phone + Real LINE Group ผ่าน UAT

### Milestone 4 — OWNER Financial

Selling Price, Estimated Cost, optional Budget Breakdown, Profit/Margin, Actual Cost, Financial View และ Permission Isolation

Gate: เฉพาะ OWNER เข้าถึง Financial Dashboard ได้และยอด Ledger ตรง

### Milestone 5 — External Actual Cost

Hardware Status, Manual Actual Cost, Project/Job scope, Reference, Duplicate Prevention, Reconciliation และ Completeness

Gate: Project ที่มีและไม่มี Hardware แสดงสถานะถูกต้องและไม่ Double Cost

### Milestone 6 — Commercial References

Quotation, Customer PO และ Invoice Reference ระดับ Project/Job โดยไม่สร้าง Billing/Accounting

### Milestone 7 — Payroll Summary

Rate Version, Holiday, Work/OT/Meal, Period, Adjustment, Approval, Lock, Revision และ Paid

Gate: ตรวจยอดมือแล้วตรง ไม่มีการบวก Project Cost ซ้ำ และ Privacy Test ผ่าน

### Milestone 8 — Pilot

ทดลอง 2–3 Projects จริงแบบคู่ขนาน วัด LINE Completion, Missing Expense/Evidence, Duplicate, Correction Rate, Admin Workload, Work/OT/Payroll/Project Cost Accuracy และ Backup/Restore

Pilot ผ่านเมื่อ Technician ทำงานประจำผ่าน LINE, Evidence ไม่หาย, Admin Review ง่ายแต่ไม่เห็น Financial Summary, Owner เห็น Cost/Profit, Ledger ไม่ Duplicate, Hardware Optional/Completeness ถูก, Payroll ไม่ Double Cost และ Real LINE/Backup/Restore ผ่าน

Opportunity/Pre-Sales เป็น Future Phase หลัง Core Pilot:

`Opportunity → Survey → POC → Quotation → Won/Lost`

เก็บ Man-day/Expense แยกจาก Delivery Project เมื่อ Won สร้าง Project ใหม่ด้วย `source_opportunity_id` ห้ามย้าย Pre-Sales Cost เข้า Project Actual อัตโนมัติ

## 18. Release แรกที่ไม่อยู่ใน Scope

- Procurement / Purchase Request / Supplier PO
- Inventory, Stock, Serial, Warehouse, Receiving และ Reconciliation
- Full Accounting, Billing, AR, Collection และ Banking
- GPS Attendance / Punch Clock
- Mandatory OCR และ Bank Slip Verification
- Automatic Tax/Social Security/Loan
- MA, Warranty, Renewal
- Customer Portal
- AI Forecast
- Full Gantt
- ClickUp Migration
- Opportunity Full Module

ห้ามสร้าง Placeholder Menu สำหรับสิ่งเหล่านี้

## 19. Repository governance

Repository เป็น Source of Truth ก่อนเริ่มงานต้อง Fetch/Pull และอ่าน:

- AGENTS.md
- docs/MASTER_PROMPT.md
- docs/PROJECT_STATUS.md
- docs/DECISION_LOG.md
- docs/DATABASE_SCHEMA.md
- docs/PERMISSION_MATRIX.md
- Module Specification ที่เกี่ยวข้อง

Codex และ Work ต้องใช้ Branch แยก เปิด PR ระบุ Module Owner ไม่แก้ Module/Schema เดียวกันพร้อมกันโดยไม่มี Owner Update PROJECT_STATUS/CHANGELOG ทุกครั้ง และ Update DECISION_LOG/DATABASE_SCHEMA เมื่อมี Decision/Schema

Critical Change ต่อไปนี้ต้องมี ADR และ Test:

- Financial Permission
- Cost Formula
- Employee Rate
- Payroll Formula
- Cost Ledger
- Idempotency
- Financial Lock
- LINE Reliability

Deployment ต้องมาจาก Commit ที่ตรวจได้ ห้ามเก็บ Secret, Token, Password, รูปบิล ค่าแรงหรือข้อมูลส่วนบุคคลใน Git/Chat/Log ห้ามซื้อ Service, เปลี่ยน Production หรือส่ง LINE จริงนอกขอบเขตที่ Owner อนุมัติ

Required documents:

```text
docs/
  MASTER_PROMPT.md
  PROJECT_STATUS.md
  DECISION_LOG.md
  CHANGELOG.md
  DATABASE_SCHEMA.md
  DATA_DICTIONARY.md
  PERMISSION_MATRIX.md
  PROJECT_FLOW.md
  WORK_OT_FLOW.md
  EXPENSE_FLOW.md
  COST_LEDGER.md
  FINANCIAL_SECURITY.md
  EXTERNAL_COST_REFERENCE.md
  COMMERCIAL_REFERENCES.md
  LINE_INTEGRATION.md
  ACCOUNTING_EVIDENCE.md
  PAYROLL_POLICY.md
  TEST_EVIDENCE.md
  OPERATIONS_RUNBOOK.md
  adr/
AGENTS.md
README.md
.env.example
```

PROJECT_STATUS ต้องเป็นภาษาไทย แสดงสิ่งที่ใช้จริงได้/กำลังทำ/ยังไม่เริ่ม, Known Issues, Test Evidence, Deployment/UAT, Migration, Commit SHA, Next Action และ Owner พร้อมแยกสถานะตาม Definition of Done

## 20. Current implementation boundary — 23 กันยายน 2026

Master v3.0 เป็น Target Specification ไม่ใช่คำสั่งว่าโค้ดทุก Milestone พร้อมแล้ว

- Milestone 0 ผ่านและ Merge แล้ว
- Milestone 1 อยู่ใน Draft PR #2 และพัฒนา Login, Roles, Customer, optional Site, Project, optional Job, Assignment, Audit, LINE Linking/Binding และ Inbox/Outbox ขั้นพื้นฐานแล้ว
- Railway Trial/PostgreSQL ถูกเตรียมสำหรับ Staging แต่ต้องใช้สถานะจริงใน PROJECT_STATUS เป็นหลัก
- M2–M8 ยังห้ามถือว่าพร้อมเพราะมีเพียง Design หรือ Prototype
- การนำ v3.0 มาใช้ต้องทำ Gap Analysis, ADR และ Migration แบบ append-only ห้ามแก้ Migration ที่ Apply แล้ว
- ห้ามรื้อ Foundation ที่ผ่าน Test หากสามารถเพิ่ม Field/Table/Projection ด้วย Migration ใหม่ได้
- ห้าม Merge PR #2 หรือเริ่ม Milestone ถัดไปเพียงเพราะ Master เปลี่ยน ต้องผ่าน Gate ปัจจุบันก่อน

## 21. Primary business questions

OWNER ต้องตอบได้ว่า Project ขายเท่าไร ตั้งต้นทุนเท่าไร Actual/Completeness/Labor/OT/Expense/Hardware เป็นเท่าไร Profit/Margin/Forecast เหลือเท่าไร และ Project ใดเสี่ยง

ADMIN ต้องตอบได้ว่าวันนี้ใครทำงานที่ไหน มี Work/OT/Expense อะไรรอตรวจ Transaction แต่ละรายการเท่าไร Project ใดกำลังทำ Job ใด Blocked และงานใกล้ Due โดยไม่เห็น Cost/Profit Summary

TECH ต้องดูงาน ลง FULL/AM/PM ลง OT ส่ง Expense+Evidence และดูสถานะได้ง่ายผ่าน LINE

## 22. Final release rule

Release แรกต้องพิสูจน์ Flow ต่อไปนี้จริง:

`ADMIN สร้าง Project → Assign Team → OWNER ใส่ Selling Price/Estimated Cost → TECH ลง Work/OT/Expense+Evidence ผ่าน LINE → ADMIN Review → Backend ลง Labor/Meal/OT/Expense Cost → OWNER ใส่ External Actual เมื่อมี → Cost Ledger → OWNER ดู Actual/Profit/Margin → Payroll Summary → Operational Close → Financial Reconcile → Financial Lock`

หาก Flow นี้ยังไม่ผ่านจริง ห้ามขยาย Scope ไป Module อื่น
