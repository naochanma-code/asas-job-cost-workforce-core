# Accounting Evidence Export Specification

DESIGNED; baseline MASTER §10/13, D-003; รายละเอียด revision/schema Proposed ADR-005; Q-06 รอยืนยันเดือน/retention ผู้ใช้ของ spec คือ OWNER หลายบัญชีเท่านั้น (ADMIN/PM ไม่มีสิทธิ์รูปบิลหรือเงิน) ไม่ใช่การ export สรุปค่าจ้าง

## ขอบเขตรอบ2ที่ Owner ยืนยัน

เป้าหมายคือภาพรวมเงินรายเดือนและดาวน์โหลด folder เก็บบิล/ใบเสร็จ/สลิปค่าใช้จ่าย กันบิลหาย; SMEMOVE ทำบัญชีแยก ไม่มี sync ใน M0 ต้นแบบเลือกภาพ/PDFจากเครื่องและดาวน์โหลด ZIP จริงแบบ local ซึ่งมี expense register CSV หนึ่งrowต่อexpense; ไม่มี XLSX/hash/versioned storage จริงใน M0 ส่วนสเปก packageเต็มด้านล่างเป็นแบบสำหรับระบบถัดไป ไม่ใช่เงื่อนไขให้โอ๋ต้องตรวจตอนนี้ รายละเอียดตาม [ADR-007](adr/007-owner-decisions-m0-r2.md)

## ขอบเขตและการเลือกข้อมูล

- เดือนอ้าง expense_date ตาม Asia/Bangkok (proposal) ช่วง [วันแรกเดือน, วันแรกเดือนถัดไป); เก็บ cutoff_at UTC และแสดงไทยในหน้า review
- default accounting package มี expense revision ที่ APPROVED ณ cutoff ทั้งระดับ Project (job=null) และ Job; rejected/pending/cancelled ไม่รวมยอด default แต่เปิด status filter ตรวจสอบได้ โดยต้องติดป้าย non-approved ห้ามรวมเป็น Actual
- ตัวกรอง month, Project, optional Job, category, sender, status ตรวจสิทธิ์; Project ไม่มี Job ไม่แสดง filter Job; ข้อมูลมาช้าหรือแก้ย้อนหลังทำ revision ใหม่ของเดือนเดิมพร้อม supersedes lineage
- Payroll payment evidence, rate snapshot, labour/OT calculated amounts, payroll manual deductions ไม่อยู่ใน package นี้ แยก Owner-only payroll export ตาม permission matrix

## รูปแบบ package version 1 (proposal)

```text
DEMO-EXPORT-202609-r001.zip
  metadata.json
  manifest.csv
  expenses.csv
  register.xlsx
  checksums.sha256
  2026/09/DEMO-PRJ-A/20260921_DEMO-PRJ-A_DEMO-EXP-001_01.png
  2026/09/DEMO-PRJ-A/20260921_DEMO-PRJ-A_DEMO-EXP-001_02.png
  2026/09/DEMO-PRJ-B/DEMO-JOB-B1/20260922_DEMO-PRJ-B_DEMO-JOB-B1_DEMO-EXP-002_01.pdf
```

ชื่อใช้ code ที่ sanitize แล้ว ไม่ใช้ชื่อบุคคล/รายละเอียด; path ต้อง relative ไม่รับ `..`, drive letter, absolute slash หรือ traversal; extension จาก verified MIME ไม่จากข้อความผู้ส่ง Evidence ID เป็น identity จริงไม่ใช้ filename เป็น key Sequence stable ต่อ expense revision

`register.xlsx` มี sheets Evidence, Expenses, Export Metadata เนื้อหาเดียวกับ CSV; CSV UTF-8 BOM, RFC4180 quoting, line endings CRLF; text ที่ขึ้นต้น =,+,-,@, tab หรือ CR ต้อง escape เพื่อไม่เป็น spreadsheet formula ส่วน numeric amount เขียนตาม typed schema; XLSX ใส่ชนิด text ชัดเจนไม่ formula อัตโนมัติ (final writer library เลือกใน implementation)

## Manifest schema: หนึ่งแถวต่อ evidence

| Column | Type / required | ความหมาย |
| --- | --- | --- |
| export_id, export_revision | UUID, integer / yes | package reference |
| evidence_id, evidence_revision | UUID, integer / yes | หลักฐาน/version ที่ snapshot |
| expense_id, expense_code, expense_revision | UUID, text, integer / yes | source revision ที่ถูกอนุมัติ |
| expense_date | YYYY-MM-DD / yes | วันที่รายจ่ายเวลาไทย |
| approved_at | ISO8601 offset / yes สำหรับ approved | เวลาที่อนุมัติ snapshot |
| project_id, project_code | UUID, text / yes | primary scope |
| job_id, job_code | UUID, text / nullable | null/empty จริงใน Project A ไม่เติม fake Job |
| category_code, category_name_snapshot | text / yes | ประเภท ณ export |
| amount_satang, amount_thb, currency | int, fixed 2 decimal string, THB / yes | ยอด expense ซ้ำในหลาย evidence rows เพื่ออ้างอิง ห้าม sum column นี้เป็น package total |
| submitter_id, submitter_display_name | UUID, text / yes | เฉพาะผู้มีสิทธิ์ ไม่ใช้ LINE identity หรือเลขบัญชี |
| status, description | enum, text / yes | ณ cutoff; description sanitize spreadsheet text |
| sequence, mime_type, byte_size | int, text, int / yes | ไฟล์ที่ตรวจแล้ว |
| sha256, relative_path | lowercase hex64, text / yes | hash binary bytes / path ZIP |
| replaces_evidence_id | UUID / nullable | replacement history |

`expenses.csv`: หนึ่งแถวต่อ expense_id+revision มี source/date/project/job/category/amount/currency/submitter/status, evidence_count, approval ref และ correction/reversal reference หากมี; ใช้ตารางนี้รวมยอดตาม status หนึ่งครั้ง

`metadata.json`: schema_version, export_id/revision, supersedes_export_id, requested_by, requested_at, built_at, timezone, month, filter_snapshot, cutoff_at, expense_count, evidence_count, total_satang, currency, manifest_sha256, expenses_sha256, register_sha256, source_snapshot_digest และ warnings ไม่มี credentials, URLs ที่เป็น bearer token หรือ Payroll fields

`checksums.sha256`: hash ของไฟล์หลักฐานทุกไฟล์ + manifest.csv + expenses.csv + register.xlsx + metadata.json; ไม่รวมตัว checksums เองและไม่ใส่ ZIP hash ภายใน ZIP (หลีก circular hash) ZIP SHA-256 เก็บใน accounting_export_runs และหน้าดาวน์โหลดแยก

## การสร้างและสิทธิ์

1. ตรวจ capability และ scope ตอน request, สร้าง run + immutable selection snapshot ที่มี revision/cutoff; retry HTTP key เดิมคืน run เดิม
2. worker recheck rights, stream binary จาก Core private storage, verify magic bytes/MIME/size/hash; expired upstream LINE ไม่เกี่ยวกับต้นฉบับที่เก็บแล้ว
3. สร้าง registry/files จาก snapshot เดียว ตรวจทุก relationship; source เปลี่ยนระหว่าง build ไม่ทำ ZIP ครึ่งเก่าครึ่งใหม่ แต่แจ้งมี revision ใหม่หลัง cutoff
4. Reconcile counts, unique expense total, hashes, เปิดไฟล์ได้; missing/corrupt object ทำ FAILED พร้อม evidence IDs ที่ต้องแก้ ไม่มี READY ของ partial package
5. READY หลัง upload+checksum ครบเท่านั้น Download ตรวจ auth/สิทธิ์ซ้ำและออก signed URL อายุสั้น (ค่าจริงกำหนดก่อน implementation); link หน้าเดือนต้อง login ไม่ใช่ public share
6. ผู้ใช้กดสร้าง export ใหม่อีกครั้งสร้าง r002 ไม่ทับ r001; mark r001 superseded โดย metadata DB พร้อม lineage ไม่แก้ bytes ZIP เดิม; failed retry attempt เก็บ history
7. Drive ถ้ามีในอนาคตเป็น optional mirror; failure/revoke/delete mirror ไม่แตะ Core binary/metadata และไม่ทำ export Core ล้ม

## Acceptance fixtures (ทั้งหมดสมมติ)

| ID | Input / action | Expected |
| --- | --- | --- |
| E-01 | expense 001=500 บาท A job=null มี 2 ภาพ; expense 002=1300 บาท B/B1 มี 1 PDF | 2 expenses, 3 evidence, total 180000 สตางค์; manifest 3 rows, expenses 2 rows; ห้ามได้ 230000 |
| E-02 | เพิ่ม pending expense 200 บาท | default approved package ยัง 180000; pending แยก ไม่เป็น Actual |
| E-03 | binary เสีย/หายหนึ่งไฟล์ | FAILED; ไม่มี READY/download complete; retry หลังแก้มี audit |
| E-04 | replace evidence 001-02 | evidence ID/revision/hash ใหม่; r002 supersedes r001; r001 bytes คงเดิม |
| E-05 | แก้ยอด approved 001 เป็น 550 ผ่าน reversal+revision | r002 total185000; source revision link ครบ; cost old -500/new550 ตรวจได้ |
| E-06 | ผู้ไม่มีสิทธิ์เดา export/evidence ID; Admin พยายาม payroll evidence | deny ทุกช่องทาง; signed URL ไม่ออก; audit ไม่มีเนื้อหาลับ |
| E-07 | text formula/traversal/UTF-8 Thai/ชื่อยาว | เปิด CSV/XLSX ไม่ execute formula; path ยังอยู่ ZIP root; ภาษาไทยไม่เสีย |
| E-08 | source ถูกอนุมัติหลัง cutoff, expense_date เดือนก่อน | r001 ไม่เปลี่ยน; r002 จึงรวมและแสดงเวลาที่มาช้า |
| E-09 | metadata+binary restore เข้า environment ใหม่ | counts, total, hashes, FK และ openability ตรง; ไม่ใช้ Drive เพื่อผ่าน |

M0 มี local ZIP จากไฟล์ทดสอบที่เลือกจริง แต่ไม่มี XLSX/ZIP production หรือข้อมูลจริง; tests E-01–09 ต้องรันกับระบบใน M3–M6 ก่อนอ้างพร้อมบัญชี ระยะเก็บ default 7 ปีรอยืนยัน Owner/บัญชี
