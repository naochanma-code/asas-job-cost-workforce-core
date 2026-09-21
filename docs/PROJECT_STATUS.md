# PROJECT STATUS

2026-09-21 · MASTER v2.5 + คำสั่งเริ่ม M1 §19 · ผู้รับผิดชอบ Codex

**Milestone 0: OWNER_ACCEPTED / MERGED** — PR #1 merge a7e5c9e08a4d2c8185a12ef65f705a190c243a8d; main 0d5da8a รวมบันทึกหลัง merge เอกสาร/prototype ครบ หลักฐาน [M0_ACCEPTANCE](M0_ACCEPTANCE.md), [TEST_EVIDENCE](TEST_EVIDENCE.md)

**Milestone 1: AUTHORIZED / IN_PROGRESS** — Owner สั่ง “เริ่มได้เลยค่ะ” และยืนยันมี OA/กลุ่มทดสอบแยกแล้ว Codex รับผิดชอบ Web/API/schema/tests/docs บน `codex/milestone-1-foundation` ไม่มีผู้แก้ร่วม ขอบเขต [M1 Foundation](M1_FOUNDATION_PROPOSAL.md), [ADR-010](adr/010-foundation-implementation.md)

## ใช้งานและตรวจได้บนเครื่อง

Login บัญชีจริง 4 roles (ไม่ใช่ role selector), Owner หลายบัญชี, Customer/Project/optional Site/Job, ทีมงาน/สิทธิ์ PM, audit, health, SQL migrations, persistence และ backup/restore พร้อม [Runbook](OPERATIONS_RUNBOOK.md) Project ไม่มี Job มอบหมายได้โดยไม่ถาม Job ไม่มีโมดูลเงินหรือข้อมูลค่าจ้างใน M1

| Workstream | DESIGNED | CODED | TESTED_LOCAL | TESTED_INTEGRATION | DEPLOYED_STAGING | UAT_PASSED | PRODUCTION_READY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M0 เอกสาร/ต้นแบบ | YES | MOCK_ONLY | PASS 45 checks + ZIP + browser | NOT_APPLICABLE | NO | OWNER_ACCEPTED ทั้ง7งาน | NO |
| M1 Web/API/identity/project/team | YES | YES | PASS API+browser | Native PostgreSQL CI pending | NO | NOT_RUN | NO |
| M1 persistence/backup | YES | YES | PASS PGlite disk restart/restore | staging NOT_RUN | NO | NOT_RUN | NO |
| M1 LINE link/group/my projects | YES | YES | PASS simulated transport | REAL_LINE_NOT_RUN | NO | NOT_RUN | NO |
| M2+ time/OT/expense/payroll | M0 design | NOT_STARTED | NOT_RUN | NOT_RUN | NO | NOT_RUN | NO |

หลักฐาน [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md) แยก automated tests, browser และรายการ NOT_RUN ชัดเจน migrations 001_foundation / 002_line_outbox ใช้ checksum ไม่มีฐานเดิมหรือ legacy code

## ข้อจำกัดและสิ่งที่รอ

Local ใช้ PGlite PostgreSQL บน disk process เดียว ไม่ใช่ native service; staging/LINE worker บังคับ DATABASE_URL และ HTTPS ไม่มี deploy/ส่ง LINE จริง ยังไม่ปิด Gate M1 จนช่างเห็นงานตนผ่าน LINE จริงและ Owner ทดสอบ

Owner ยืนยันว่ามี OA/กลุ่มทดสอบแล้ว แต่ยังไม่ระบุชื่อ/IDs, ผู้ทดลอง, server/domain หรืองบ deployment ต้องรับข้อมูลนี้และตั้ง secrets นอกแชท/Gitก่อนทดสอบจริง ยังไม่มี password recovery/MFA/role-change/group-rebind UI, automated backup schedule หรือ DEAD payload cleanup ก่อน pilotต้องประเมิน/runbookให้ครบ

ข้อถามเรื่อง OT ไม่มี Work/Job budget/month export และจุดเริ่มนับหลักฐาน 2 ปีใน [OWNER_QUESTIONS](OWNER_QUESTIONS.md) เป็น milestone ถัดไป ไม่ขวาง Foundation และไม่ถามซ้ำเรื่องสิทธิ์ที่ Owner ตอบแล้ว

## ขั้นตอนถัดไป

ส่ง draft PR ของ M1 พร้อมผลตรวจ; ตรวจ CI PostgreSQL และแก้ปัญหาที่พบเฉพาะ Foundation จากนั้นเตรียม staging/LINE pilot เมื่อ Owner ระบุ environment และขอบเขตที่อนุญาต ยังไม่ merge M1 หรือเริ่ม M2
