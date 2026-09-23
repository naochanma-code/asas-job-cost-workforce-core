# DECISION LOG

## D-024 — Owner ให้เริ่ม Staging Alignment ตามแผน (2026-09-23)

หลังส่งผล Local/CI และแผน Backup/maintenance/migration003/Deploy คู่กัน Owner ตอบ “เริ่ม process ต่อไปได้เลยค่ะ” ถือเป็นการอนุมัติให้ดำเนินการตามแผนภายใน Railway Trial เดิม โดยยังต้องมี recoverable private/encrypted backup ก่อน migration ไม่อนุมัติ Pro/ค่าใช้จ่ายเพิ่ม/ข้าม Backup/เปิด LINE/Merge/M2/M3/Production

Provider Backup/PITR ถูกจำกัดไว้ที่ Pro จึงเตรียม manual encrypted backup ภายใน Trial แทน ต้องยืนยัน CLI authentication และการดาวน์โหลดที่ปลอดภัยก่อนใช้ข้อมูลจริง หากไม่สามารถทำได้ภายใต้ Trial ให้หยุดและรายงาน ไม่ลด Backup gate เพื่อ Deploy

## D-023 — M1 Alignment และ seed 5 ประเภท (2026-09-23)

Owner ยืนยัน “เริ่ม 5 ประเภทตามข้อความรอบนี้”: Installation, Service, Survey, POC, Other แทน seed 10 รายการใน Master เดิม Job Type คง 10 ประเภท ปรับ Master ให้ตรงคำตอบ

Implementation ตาม [ADR-011](adr/011-m1-v3-alignment.md): append-only 003, stable type code+snapshot, nullable primary PM และคง legacy memberships, PM role+membership เท่านั้นที่ assign/revoke TECH ได้, Job-level TECH เห็นเฉพาะ Job เกี่ยวข้อง, atomic code counter+reservation รวมใน backup format2 ห้าม reuse รหัสเก่าไม่เปลี่ยน No M2/M3 tables/menus Expense D-022 ยังเป็น specification เท่านั้น ต้องรอ Owner อนุมัติ Staging migration/deploy

## D-022 — PM assignment และ Expense self-approval (Accepted, 2026-09-23)

Owner ยืนยันให้ PM เพิ่ม/ถอน TECH ได้เฉพาะ Project ที่ PM รับผิดชอบ ห้าม PM สร้างผู้ใช้ เปลี่ยน Role มอบสิทธิ์ OWNER/ADMIN หรือแต่งตั้ง PM คนอื่น ทุก action ต้องมี Audit

ADMIN อนุมัติ Expense ได้ทั้งหมดในขอบเขต รวมรายการที่ ADMIN กรอกเอง เพื่อไม่ให้งานกองที่ OWNER; OWNER อนุมัติ Expense ได้ทั้งหมดรวมรายการที่ OWNER กรอกเอง PM/TECH อนุมัติไม่ได้ Expense ทุกช่องทางยังต้องผ่าน PENDING_REVIEW ก่อนเป็น Actual และเก็บ approver/time/audit

ADMIN แก้ Expense หลัง Approved ได้ก่อน Financial Lock ผ่าน correction/revision พร้อมเหตุผลและ before/after หาก post Cost Ledger แล้วต้อง reversal ก่อน corrected posting ห้ามแก้ source/ledger เดิมแบบเงียบ เมื่อ Financial Status=LOCKED ต้องให้ OWNER unlock/สร้าง financial revision ก่อน

## D-021 — Master Prompt v3.0 เป็น Canonical Product Specification (2026-09-23)

Owner ส่งขอบเขต Product ใหม่เพื่อให้ Core เน้น Project/Job/Workforce/Work/OT/Expense/Evidence/Cost/Owner Financial/Payroll Summary และไม่สร้าง ERP ซ้ำ SMEMOVE รับเป็น Master v3.0 แทนชื่อร่าง v2.4 เพราะ Repository มี v2.5 แล้ว เอกสารใหม่มีอำนาจเหนือเอกสารเก่าเฉพาะส่วนที่ขัดกัน

ยืนยัน Admin เห็น Amount/Evidence ระดับ Expense transaction แต่ไม่เห็น Project financial aggregate; PM ส่งและเห็น Expense ของตนแต่ไม่เป็น reviewer; Financial data แยก operational query/service/API/export; typed text เป็น primary expense input; Core private storage เป็น source of truth; SMEMOVE Actual/Commercial data เป็น manual reference; Cost Ledger immutable และ Payroll ห้ามบวก Project Cost ซ้ำ

Foundation ปัจจุบันใช้ต่อได้ ไม่แก้ migration ที่ apply แล้ว เพิ่ม schema ด้วย append-only migration ตาม [Gap Analysis](MASTER_V3_GAP_ANALYSIS.md) Master change ไม่อนุญาตให้ข้าม M1 gate, Merge PR #2, เปิด LINE, เริ่ม M2 หรือ Deploy Production โดยอัตโนมัติ

## D-020 — Project context และรอบทดสอบอัตโนมัติ (2026-09-23)

Owner พบว่าไม่เห็นลูกค้าของโครงการและหา Job ไม่พบ พร้อมขอให้พัฒนา/ทดสอบให้เป็นชุดก่อนส่ง UAT API GET projects และ projects/:id เพิ่ม customer_name กับ site_name (nullable) เฉพาะ Project ที่ actor มีสิทธิ์ตาม scope เดิม ไม่เปิด customer/site directory ให้ TECH/PM และไม่ส่ง contact/เงิน/ข้อมูลโครงการอื่น LINE formatter คงเดิม ไม่เปลี่ยน schema

Web แสดง customer/site ของโครงการ, รายการ Job และแบบฟอร์มเพิ่ม Job ชัดเจน เมื่อมี Job ให้เลือกทั้งโครงการหรือ Job ในการมอบหมาย; ไม่มี Job ต้องไม่มีช่องเลือก Job ใช้ scope Project ได้ทันที Job อยู่ใต้ Project ไม่สร้างเมนูหรือ module M2 ใหม่

ชุดทดสอบสร้างบัญชีและ password สุ่มในฐานสมมติแยกในหน่วยความจำ ใช้ session/API จริงภายใน test process ไม่ขอ Owner login ทีละ role ไม่สร้างบัญชีหรือแก้รหัสบนฐาน Staging จริงโดยปริยาย ผล Local/CI แยกจาก Live/UAT และยังต้องพิสูจน์ provider/LINE ตาม gate เดิม Owner ตรวจเป็นรอบรวมหลังเตรียมรุ่นพร้อม

## D-019 — ข้อมูลจริงปนใน Staging; แยกชุดซ้อม (2026-09-22)

Owner ยืนยันว่ารายการที่สร้างบน Web มีข้อมูลจริงปนอยู่ จึงไม่เข้าเงื่อนไข Phase D/E เดิมที่อนุญาตเฉพาะข้อมูลสมมติ หยุดเฉพาะการ backup/copy/restore ชุดข้อมูลนี้ ไม่ใช้คำสั่งให้ดำเนินการต่อเป็นการอนุมัติใช้ข้อมูลจริง ไม่แก้ ลบ หรือถอนสิทธิ์ของรายการเดิม และไม่บันทึกชื่อ/รายละเอียดจริงลงเอกสาร

งานที่เดินหน้าต่อได้: สถานะและ UAT ภาษาไทย, read-only health/security checks, การซ้อมด้วยฐานข้อมูลสมมติที่แยกชัดภายใน PostgreSQL/Trial เดิม โดยไม่ clone แถวข้อมูลจากฐานปัจจุบัน ไม่เพิ่มบริการเสียเงิน ไม่เปลี่ยน business schema/API/permission การสร้างฐานใหม่ต้องตรวจชื่อและความว่าง; ห้าม drop/overwrite เพื่อรันซ้ำ ผลซ้อมแยกไม่ใช่หลักฐานว่ามี backup ของข้อมูลจริงปัจจุบัน

## D-018 — M1 Staging A–E and isolated database roles (2026-09-22)

Owner authorizes only the existing Railway Trial for database security, API/Web, synthetic functional tests and isolated restore. LINE remains false even after those phases pass. No upgrade, paid service, PR #2 merge, M2 or production. Stop on credit exhaustion, exposure risk or required staging data deletion/overwrite.

Provision runtime/migrator roles using a reviewed one-time transaction. Migrator owns schema/tables and is NOLOGIN, operated through the existing administrator's SET ROLE. Runtime starts NOLOGIN until Owner enters a credential privately; no schema ownership/DDL/TEMP or migration-history mutation; audit append/read only. Explicit table grants avoid granting future modules automatically. No business schema or HTTP contract change. See [database security procedure](M1_DATABASE_SECURITY.md).

Browser credential entry requires Owner handoff. Verified TLS inside the Postgres console does not substitute for testing TLS from the deployed API. Preserve phase-level NOT_RUN until each live check is performed.

Production-mode PostgreSQL now always verifies TLS. `DATABASE_SSL_CA` supplies a private provider's **public CA certificate**, otherwise the system trust store applies. Reject URL SSL parameters and disabled verification rather than letting pg replace the explicit SSL policy. Local non-production tests can use plaintext disposable databases. Startup/background logs emit fixed error categories; container CI uses a synthetic CA, not Railway credentials.

API startup also rejects elevated role flags, membership, object ownership, database/schema CREATE/TEMP and writes to migration history or existing audit rows. The one-shot runtime verification uses the same checks plus schema checksum and pg_stat_ssl without opening HTTP. This prevents accidentally restoring the administrator URL to the API.

## D-017 — Railway Trial และ runtime schema verification (2026-09-22)

Accepted: Owner เลือก Railway ตัวเริ่มต้นและอนุญาตเริ่มกระบวนการ ใช้ Trial credits เท่านั้น ห้ามเปลี่ยนแพ็กเกจ/เพิ่มขนาด/ค่าใช้จ่ายเอง ต้องแจ้งและรออนุมัติใหม่ ไม่อนุญาต Production/Merge PR #2/M2

Staging ใช้ Docker Web/API และ PostgreSQL ใหม่แยกจาก local M2. Production-mode API/worker ตรวจชื่อ/checksum/จำนวน migration ให้ตรง release ก่อนเริ่ม ไม่ apply DDL; operator รัน migrate/bootstrap ก่อนด้วย credential แยก Runtime ต้องใช้ role ที่ไม่มี CREATE/ALTER; ยังต้องทดสอบ role จริง Local ยัง auto-migrate ไม่มีการเปลี่ยน business schema/API/สิทธิ์ผู้ใช้

ป้องกัน runtime ถือ credential ผู้ดูแลและชี้ไปฐาน M2/รุ่นอื่นโดยไม่รู้ตัว Docker CI ไม่ใช่ deployment/UAT; LINE ปิดจนผ่าน checklist

## D-016 — เตรียม M1 Staging; พัก M2 (2026-09-22)

Owner สั่งตรวจ Draft PR #2 และเตรียม Staging/Real LINE Pilot โดยไม่ Merge ไม่เริ่ม M2 ไม่ deploy หรือสมัครเสียเงินจนอนุมัติ แยกงาน M2 ที่ค้างใน local working tree ไม่รวม PR นี้ แผน [M1_STAGING_PLAN](M1_STAGING_PLAN.md) เสนอ Render paid และ Railway Trial/Hobby ยังไม่เลือกแทน Owner ไม่มีการเปลี่ยน schema/API/permission ของ M1 รอบนี้ เพิ่มเฉพาะ tests และเอกสาร เกณฑ์ UAT/HTTPS/provider restore/real LINE ต้องพิสูจน์จริง ไม่ใช้ผลจำลองแทน

## D-014 — เริ่ม Milestone 1 Foundation (2026-09-21)

Owner สั่ง “เริ่มได้เลยค่ะ” หลังข้อเสนอ M1 และยืนยันว่ามี OA/กลุ่มทดสอบแยกแล้ว Codex รับผิดชอบ codex/milestone-1-foundation ตาม [ADR-010](adr/010-foundation-implementation.md) อนุญาต implementation และ local tests ไม่ใช่การอนุมัติ production/ส่ง LINE จริงหรือเริ่ม M2 สถานะ D-013 ที่ยังไม่เริ่ม M1 เป็นประวัติก่อนคำสั่งนี้ Gate LINE จริงยังคงเดิม

## D-001 — สร้างระบบใหม่แยกจากแอปเก่า

- สถานะ: Accepted
- เหตุผล: ลด technical debt และไม่ให้ปัญหาเดิมกำหนดโครงสร้างใหม่
- ผล: แอปเก่าเป็น reference เท่านั้น ห้าม reuse DB/migration โดยอัตโนมัติ

## D-002 — Project เป็นหน่วยหลัก, Site/Job เป็น optional

- สถานะ: Accepted
- เหตุผล: งานส่วนใหญ่ใช้ Project เดียวและไม่มีงานย่อย
- ผล: Project สร้างได้โดยไม่มี Site/Job; transaction มี `project_id` และ `job_id` nullable

## D-003 — Core เก็บหลักฐานเป็น source of truth

- สถานะ: Accepted
- เหตุผล: ควบคุมสิทธิ์ audit hash และการเชื่อม Expense ได้ดีกว่า Drive
- ผล: มี monthly accounting export; Google Drive เป็น optional mirror เท่านั้น

## D-004 — แยก Cost Ledger และ Payroll Ledger

- สถานะ: Accepted
- เหตุผล: ใช้ข้อมูลเวลา source เดียวกันแต่ป้องกันต้นทุน Project ถูกนับซ้ำ
- ผล: Admin เห็นวัน/ชั่วโมงแต่ไม่เห็นยอดเงิน; Owner จัดการ rate/amount/approval

## D-005 — Opportunity หลัง Core pilot

- สถานะ: Accepted
- เหตุผล: รักษาขอบเขต Release แรก แต่ schema ต้องรองรับ history และ pre-sales cost

## D-006 — รอบค่าจ้างและกำหนดวันโอน

- สถานะ: Accepted
- รอบข้อมูล: วันที่ 1 ถึงวันสุดท้ายของเดือน
- กำหนดจ่าย: โอนเงินไม่เกินวันที่ 1 ของเดือนถัดไป
- Admin ปิดตรวจข้อมูลเวลาไม่เกิน 10:00 น. วันที่ 1 โดยไม่เห็นจำนวนเงิน
- Owner ตรวจยอด อนุมัติ lock และบันทึกการโอนภายในวันที่ 1
- ข้อมูลมาช้าต้องใช้ late adjustment/revision ห้ามแก้ยอดที่อนุมัติแล้วแบบเงียบ

## D-007 — ใช้ Private GitHub Repository เป็นแหล่งข้อมูลกลาง

- สถานะ: Accepted
- Repository: `naochanma-code/asas-job-cost-workforce-core`
- Default branch: `main`
- Codex และ Work ต้องอ่าน `AGENTS.md` และเอกสารใน repo ก่อนเริ่มงาน
- แชทและไฟล์สำเนานอก Repository ไม่ใช่ source of truth เมื่อข้อมูลขัดกัน

## D-008 — Milestone 0 process design (2026-09-21)

- สถานะ: Proposed / Owner review pending; ไม่แทนที่ D-001–D-007 ที่ Accepted
- จัดทำ [wireflows](WIREFLOWS.md), [state diagrams](STATE_DIAGRAMS.md), [dictionary](DATA_DICTIONARY.md), [permissions](PERMISSION_MATRIX.md), [payroll cases](PAYROLL_CALCULATION_TEST_CASES.md), [accounting export](ACCOUNTING_EVIDENCE.md) และ [pilot script](PILOT_ACCEPTANCE_SCRIPT.md)
- ADR-001–006 ใน [ADR index](adr/README.md) แยก baseline กับรายละเอียดที่ยังเสนอ: Project scope, permission boundaries, ledgers/payroll, LINE durability, evidence และ modular monolith
- บันทึกข้อขัดแย้ง/ช่องว่าง Q-01–Q-07 ใน [OWNER_QUESTIONS](OWNER_QUESTIONS.md); ไม่เดากติกาเงิน/สิทธิ์เพิ่มเติม ไม่เปลี่ยน Master Prompt หรือ Accepted Payroll Policy
- Admin/PM prototype ใช้ non-pay category view พร้อม label รอ Q-01; Project ไม่มี Job ไม่ถาม Job ตามข้อกำหนดที่ยืนยันแล้ว; ไม่มี-Job exception รอปรับถ้อยคำ Q-02
- ต้นแบบเป็น local HTML simulation ไม่มี application/backend/migration/deployment/LINE จริง; Milestone 0 gate รอ Owner ทดลอง 7 tasks ตาม MASTER §19

## D-009 — คำตอบ Owner รอบ2 (Accepted, 2026-09-21)

ดู [ADR-007](adr/007-owner-decisions-m0-r2.md): Admin/PM ไม่เห็นเงินทุกประเภทและรูปบิล; Ownerหลายบัญชีสำหรับหุ้นส่วน3คน; Expense/BudgetตรวจโดยOwner; Projectไม่มีJobเป็นปกติ; OTdate+hoursย้อนหลังได้ไม่แยกเที่ยงคืน; สองProjectต่อวันแบ่งครึ่ง; Ownerดูค่าใช้จ่ายรายเดือนและfolderหลักฐาน; SMEMOVEแยก; Ownerเตรียมpilotภายหลัง

ใช้แทนข้อเสนอnon-pay visibilityของ D-008 และปรับ MASTER เป็นv2.3/PAYROLL_POLICY/schema/permissionตามคำตอบโดยตรง ไม่มีการอนุมัติUAT/deploy หรือกติกาOTเศษย่อย/Job allocation/retentionแทนOwner

## D-010 — คำตอบ Owner รอบ3 (2026-09-21)

Accepted ตาม [ADR-008](adr/008-admin-review-ot-retention.md): Admin ตรวจ แก้ไข และอนุมัติค่าใช้จ่ายรายรายการได้ รวมจำนวน รายละเอียด เงิน และรูป แต่ไม่เห็นยอดรวมต้นทุน/ยอดใช้ไปของโครงการ อัตราค่าแรงหรือ Payroll; PM ยังไม่เห็นเงินหรือรูปบิล; Adminอนุมัติวัน/OTแล้วไม่ส่งOwnerตรวจซ้ำ ปิดข้อมูลเวลาแล้วคำนวณอัตโนมัติ Ownerอนุมัติเงินตามเดิม; OTทีละ0.5ชั่วโมงไม่รับเศษนาที; หลักฐานเก็บ2ปี เป็นM0design/local prototype ไม่มีproductionหรือการลบไฟล์จริง แทนD-009เฉพาะส่วนที่เปลี่ยน

## D-011 — ลงเวลาแทนและค่าใช้จ่ายทุกบทบาท (Accepted)

PM/Admin/Owner ลงวันทำงานและ OT แทนพนักงานใน Project ที่มีสิทธิ์ได้ โดยเก็บผู้กรอกแยกจากพนักงาน ทุกบทบาทส่งค่าใช้จ่ายได้ PM เห็นยอดและรูปเฉพาะรายการที่ตนส่ง LINE expense ทุกบทบาทต้องรอ Admin หรือ Owner กดอนุมัติแยกทุกครั้งก่อนเป็น Actual; Web คงขั้นรอตรวจเดิม ไม่มี auto-approve รายละเอียด [ADR-009](adr/009-delegated-entry-and-expense-review.md) ไม่เปลี่ยนข้อห้ามaggregate/Payroll ไม่อนุญาตmerge/M1จากการปิดM0

## D-012 — ปิด Milestone 0 (2026-09-21)

Owner ยืนยัน “ยืนยันผ่านทั้ง 7 งาน รวมการแก้ล่าสุดเมื่อทดสอบผ่าน” ในtaskนี้; Codexตรวจ7งานและfeedbackล่าสุดผ่าน ทดสอบ45checksและZIPผ่าน สถานะOWNER_ACCEPTED / READY_TO_MERGE ตาม [M0_ACCEPTANCE](M0_ACCEPTANCE.md) ไม่มีการแต่งassistance/time ของOwner PRพร้อมreviewหลังpush ไม่merge/M1จนOwnerยืนยันใหม่

## D-013 — Owner อนุญาต Merge M0

วันที่2026-09-21 OwnerยืนยันรับMilestone0และสั่งMerge PR#1เข้าmain; merged a7e5c9e08a4d2c8185a12ef65f705a190c243a8d สำเร็จ ตรวจเอกสาร/prototypeครบและ45checks+ZIPผ่าน ยังไม่เริ่มMilestone1 ขอบเขตใน M1_FOUNDATION_PROPOSAL เป็นข้อเสนอเท่านั้น ไม่ได้เปลี่ยนGate MASTER หรืออนุญาตimplementation/deploy/LINEจริง
