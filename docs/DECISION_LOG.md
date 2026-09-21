# DECISION LOG

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
