# ADR-013 — ERP/Accounting-provider agnostic Core

สถานะ: ACCEPTED ตามคำสั่ง Owner วันที่ 25 กันยายน 2026; Integration Boundary เป็น DESIGNED เท่านั้น ยังไม่ CODED / REAL_INTEGRATION_TESTED / DEPLOYED

## Decision และขอบเขต

ASAS Core ต้องไม่ผูก Business Logic โดยตรงกับ SMEMOVE, FlowAccount หรือผู้ให้บริการ ERP/บัญชีรายใด กติกา Project, Expense approval, Cost Ledger, Correction/Revision, Financial Lock และ Permission เป็นของ Core ไม่ขึ้นกับ API, SDK, document status หรือชื่อ field ของ provider

SMEMOVE เป็นระบบภายนอกที่ใช้อยู่ตามข้อมูล Owner ไม่ใช่ข้อจำกัดถาวรของสถาปัตยกรรม การรับ decision นี้ไม่เปลี่ยน Inventory Master ไม่อนุมัติ sync/ย้ายข้อมูล/ซื้อบริการหรือเริ่ม Milestone ถัดไป ไม่มีการแก้ migration เดิมหรือสร้างตารางล่วงหน้า

FlowAccount OpenAPI เป็น **Candidate Integration** สำหรับ Expense/Accounting และ Inventory ในอนาคต ยังไม่ได้ยืนยันความสามารถ endpoint, subscription, Stock, Warehouse หรือ Serial จาก POC

FlowAccount MCP เป็น **Optional AI Interface** เท่านั้น ห้ามใช้เป็นเส้นทางอ่าน/เขียนหรือ sync ที่ Core อาศัยเป็น System of Record ห้ามใช้เป็น fallback เมื่อ OpenAPI ใช้ไม่ได้ การช่วยค้น/ร่างของ AI ต้องมี permission และ validation เดิม; ห้ามให้ผล AI ยืนยัน approval, stock balance, ledger posting หรือ reconciliation แทนข้อมูลจาก connector ที่ตรวจสอบได้

## Integration Boundary

ทิศทาง dependency: Core domain/application → provider-neutral contract ← provider adapter. Composition/configuration เลือก adapter; domain/application ห้าม import provider SDK, HTTP endpoint หรือ branch business rules ตามชื่อ provider

| Boundary | หน้าที่ในอนาคต | สิ่งที่ห้ามทำ |
| --- | --- | --- |
| `AccountingConnector` | รับ/ส่งเอกสาร Expense/Accounting ที่ได้รับอนุญาต อ่าน external reference/status และข้อมูลสำหรับ reconciliation ผ่าน contract กลาง | อนุมัติ Expense อัตโนมัติจากสถานะ provider, แก้ ledger/financial lock โดยตรง หรือส่งข้อมูลเกิน permission |
| `InventoryConnector` | อ่าน Product/Stock/Warehouse/Serial และ movement ที่จำเป็นจากระบบหลักที่เลือก แปลง identity/unit/status สำหรับตรวจเทียบ | สมมติว่า provider รองรับทุก capability, เปลี่ยน Inventory Master เอง หรือสร้าง stock engine ใน Core |

สอง contract ต้องแยกกัน เลือก provider คนละรายได้ Adapter เดียวอาจ implement ทั้งสองได้เมื่อผ่าน capability tests แต่การเลือก Accounting provider ไม่ได้เลือก Inventory Master โดยปริยาย

Contract design ขั้นต่ำก่อน implementation:

- DTO เป็นศัพท์ Core ใช้ internal ID แยก external ID; external identity ต้องมี provider + connection/company scope + entity type + external ID ไม่ใช้เลขเอกสารเดี่ยวเป็น global key
- Versioned contract และ mapping; capability ระบุ supported/unsupported/unverified อย่างชัดเจน รวม read/write และ Stock/Warehouse/Serial แยกกัน ความสามารถที่ขาดต้องปฏิเสธหรือใช้ manual workflow ที่อนุมัติ ห้ามสร้างข้อมูลแทน
- Amount ใช้ integer satang พร้อม currency; quantity/unit/warehouse/serial ต้องมี mapping ที่ตรวจได้ ไม่ round stock แบบเดา
- ส่งเฉพาะ source revision ที่ผ่าน Core approval; idempotency ผูก source + revision + operation + connection, unique external mapping และ audit correlation กัน retry/duplicate/echo จากระบบภายนอก
- Timeout หลังส่งอาจเป็นผลลัพธ์ไม่ทราบสถานะ ต้อง lookup/reconcile ก่อน retry การเขียน ห้ามถือ timeout ว่ายังไม่สร้างเอกสารหรือ fallback MCP
- Credentials อยู่ Secret Manager ฝั่ง server แยก connection; ไม่ใส่ DTO/URL/log/export ทดสอบ permissions ทั้ง API, worker และ reconciliation report
- Evidence ต้นฉบับอยู่ Core private storage; สำเนาหรือ URL ของ provider ไม่แทน source of truth. Sync status แยกจาก Expense approval และสถานะ Cost Ledger
- Incoming provider data เป็นข้อมูลที่ต้อง validate/reconcile ไม่ใช่คำสั่งแก้ Core ledger; approved correction ใช้ revision/reversal และ lock/unlock เดิม

## System of Record และชื่อกลาง

Core เป็นระบบหลักของ Project/Job, Workforce, Expense workflow/evidence และ Project Cost Ledger ตาม Master; ระบบบัญชีภายนอกเป็นระบบหลักของ Accounting Operations; Inventory Master ยังคงระบบเดิมจนผ่าน gate และ Owner อนุมัติ cutover ห้ามมีสองระบบเขียน stock อย่างอิสระในช่วงเดียวกัน

ใช้ชื่อ design `external_actual_cost_entries`, `EXTERNAL_ACTUAL_COST` และ External Document Reference แทนชื่อที่ผูก SMEMOVE ค่าเหล่านี้เป็น target ที่ยังไม่ implement ใน M1 ไม่ใช่คำสั่ง rename ตารางหรือ rewrite ledger ที่ใช้งานแล้ว หากพบชื่อเก่าในระบบที่ deploy ต้องทำ explicit mapping และ append-only migration plan ก่อนเปลี่ยน

## Gate ก่อนเปลี่ยน Inventory Master เป็น FlowAccount หรือ provider อื่น

ทุกข้อด้านล่างยัง **NOT_RUN** ต้องทำ POC กับ sandbox/ข้อมูลสมมติที่ได้รับอนุมัติ ไม่ clone ข้อมูลจริงจาก Staging และไม่ถือการมีหน้า UI หรือ endpoint ว่าผ่าน

| Gate | หลักฐานที่ต้องมีเพื่อ PASS |
| --- | --- |
| Capability | ตรวจ official API/version/plan และทดสอบช่องทางที่ต้องใช้จริง หาก Stock, Warehouse หรือ Serial ที่ต้องใช้ unsupported/unverified ให้ BLOCKED ไม่ใช้ MCP กลบช่องว่าง |
| Stock | ทดสอบ opening, receiving, issue, return, adjustment, reversal และ retry; quantity/unit กับ movement history ตรงกัน ไม่สร้างรายการซ้ำ |
| Warehouse | อย่างน้อยสองคลัง แยกยอดถูกต้อง transfer ออก/เข้าจับคู่กัน รับมือ failure ระหว่างทางและไม่ทำยอดหาย/ซ้ำ |
| Serial | ตัวตน serial ไม่ซ้ำตามกติกาที่ตกลง ติดตามรับเข้า/โอน/เบิก/คืนได้ ป้องกันเบิกซ้ำและ serial อยู่สองคลังพร้อมกัน มี historical trace |
| Reconciliation | เปรียบเทียบ ณ cutoff เดียวกัน: SKU+unit+warehouse balances, serial set/location/status, movement counts และมูลค่าเมื่ออยู่ในขอบเขต ต้องไม่มีส่วนต่างที่อธิบายไม่ได้; เกณฑ์ rounding/exception ต้องอนุมัติก่อนทดลอง ห้ามปัดส่วนต่างทิ้ง |
| Cost reconciliation | Hardware/Material เดียวกันไม่ถูกนับทั้ง Expense และ External Actual Cost; source/revision/reference map ครบ และ ledger correction/lock ทำงานเดิม |
| Recovery / cutover | ซ้อม backup/restore, mapping export, restart/retry, freeze writer เดิม, final delta reconciliation และแผนย้อนกลับที่ไม่เขียนทับ audit/ข้อมูลเก่า กำหนดผู้รับผิดชอบและเวลาชัดเจน |
| Owner acceptance | ส่งรายงาน PASS/FAIL/NOT_RUN, ข้อจำกัด, ค่าใช้จ่าย และผล reconciliation ให้ Owner อนุมัติการย้ายแยกต่างหาก ก่อนเปลี่ยนระบบหลักจริง |

## Test plan ของ boundary ก่อนใช้งานจริง

1. รัน Core use cases ชุดเดียวกับ adapter สองแบบจำลองให้ผล business/permission/ledger เท่ากัน; ตรวจ dependency ไม่อ้าง provider ใน domain/application
2. ทดสอบ unsupported capability, provider unavailable, mapping ไม่ครบ, ID ซ้ำข้ามบริษัท และ pagination/version changes โดยไม่เปลี่ยนข้อมูล Core เงียบ ๆ
3. ทดสอบ repeated delivery, timeout-after-commit, retry/replay และ correction ให้ external document/ledger ไม่ซ้ำ; เปลี่ยน provider แล้วยังย้อนดู reference เก่าได้
4. ทดสอบ Admin/PM/TECH ไม่ได้ financial aggregate หรือข้อมูลข้าม Project ผ่าน connector, worker, AI interface หรือ export; Project ไม่มี Site/Job ใช้ได้
5. พิสูจน์ระบบบันทึก/sync/reconcile ผ่าน connector ทำงานได้เมื่อปิดหรือไม่มี MCP/AI และ MCP ไม่ได้เป็น dependency ของเส้นทาง System of Record
6. เพิ่ม integration tests กับ provider sandbox เมื่อเลือก candidate และอนุมัติแล้ว ผล mock ไม่แทน Stock/Warehouse/Serial POC หรือ real reconciliation

รอบ decision นี้ตรวจเฉพาะเอกสาร ไม่มี adapter, API credential, migration, deployment, inventory transfer หรือ Expense/Payroll implementation
