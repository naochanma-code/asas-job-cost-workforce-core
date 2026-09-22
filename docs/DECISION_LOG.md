# DECISION LOG

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
