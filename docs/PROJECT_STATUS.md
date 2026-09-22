# PROJECT STATUS

## ล่าสุด 2026-09-22 — เตรียม M1 Staging / Real LINE Pilot เท่านั้น

Owner สั่งกลับมาทำ M1 ตาม PR #2: **ห้าม Merge, ห้ามเริ่ม/พัฒนา M2 ต่อ, ห้าม Deploy ทุก environment จนอนุมัติ และห้าม Production** Codex รับผิดชอบ tests/docs ของ M1 คนเดียวบน `codex/milestone-1-foundation` ใน isolated checkout `.local/m1-staging` งาน Web Time/OT ที่ค้างจากคำสั่งก่อนหน้าอยู่เฉพาะ working tree ของ `codex/milestone-2-web-time-ot` ถูกพัก ไม่รวม PR #2 และไม่ใช้ local DB ที่มี migration M2 เป็น staging

ผลตรวจเริ่มรอบ: PR #2 Draft/open/not merged, mergeable=true; head 5328b42, main 0d5da8a; behind 0 / ahead 2; CI 35610665915 SUCCESS ทั้ง PostgreSQL17/PGlite/typecheck/build/M0 ก่อนเพิ่ม tests รอบนี้ ไม่มี conflict ที่ต้อง merge/rebase

จัดทำ [แผนและราคา Hosting](M1_STAGING_PLAN.md), [LINE checklist](M1_LINE_PILOT_CHECKLIST.md), [Owner UAT 10 ข้อ](M1_OWNER_UAT.md), [Staging test matrix](M1_STAGING_TEST_MATRIX.md), [ข้อมูลสมมติ A/B](fixtures/m1-pilot.json) และเพิ่ม security/native restore tests ผลรอบใหม่บันทึกใน [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md)

CODED: M1 เดิม + tests ใหม่; TESTED_LOCAL: PASS typecheck/build/18 tests (native restore 1 SKIP รอ CI)/M0 45 checks; TESTED_CI รอบใหม่: PENDING; DEPLOYED_STAGING: NO; REAL_LINE: NOT_RUN; UAT_PASSED: NO; READY_TO_MERGE: NO

รอ Owner ตัดสินใจ provider/งบ และวัน/ช่างที่ร่วม pilot ไม่ขอ secret ผ่านแชทหรือ GitHub รายละเอียด deployment blockers (runtime DB role/migrations, proxy rate limit, TLS, logs, enrollment IDs และ cleanup/backup) อยู่ในแผน ต้องตรวจ/แก้ก่อน live pilot ไม่ใช่ข้ออ้างให้เปิดจริงโดยอัตโนมัติ

ความขัดแย้งกับคำสั่งเก่าที่พัก LINE/เริ่ม M2: ใช้คำสั่งล่าสุดพัก M2 และเตรียม M1 ไม่ต้องถามซ้ำ ส่วน policy OT ที่ Owner ยืนยันยังเก็บในงานที่พักไว้ ไม่ได้ implement ใน M1

ข้อความด้านล่างเป็นประวัติรอบ Foundation เดิม ขั้นตอนปัจจุบันใช้แผนด้านบน

2026-09-21 · MASTER v2.5 + คำสั่งเริ่ม M1 §19 · ผู้รับผิดชอบ Codex

**Milestone 0: OWNER_ACCEPTED / MERGED** — PR #1 merge a7e5c9e08a4d2c8185a12ef65f705a190c243a8d; main 0d5da8a รวมบันทึกหลัง merge เอกสาร/prototype ครบ หลักฐาน [M0_ACCEPTANCE](M0_ACCEPTANCE.md), [TEST_EVIDENCE](TEST_EVIDENCE.md)

**Milestone 1: AUTHORIZED / IN_PROGRESS** — Owner สั่ง “เริ่มได้เลยค่ะ” และยืนยันมี OA/กลุ่มทดสอบแยกแล้ว Codex รับผิดชอบ Web/API/schema/tests/docs บน `codex/milestone-1-foundation` ไม่มีผู้แก้ร่วม ขอบเขต [M1 Foundation](M1_FOUNDATION_PROPOSAL.md), [ADR-010](adr/010-foundation-implementation.md)

## ใช้งานและตรวจได้บนเครื่อง

Login บัญชีจริง 4 roles (ไม่ใช่ role selector), Owner หลายบัญชี, Customer/Project/optional Site/Job, ทีมงาน/สิทธิ์ PM, audit, health, SQL migrations, persistence และ backup/restore พร้อม [Runbook](OPERATIONS_RUNBOOK.md) Project ไม่มี Job มอบหมายได้โดยไม่ถาม Job ไม่มีโมดูลเงินหรือข้อมูลค่าจ้างใน M1

| Workstream | DESIGNED | CODED | TESTED_LOCAL | TESTED_INTEGRATION | DEPLOYED_STAGING | UAT_PASSED | PRODUCTION_READY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M0 เอกสาร/ต้นแบบ | YES | MOCK_ONLY | PASS 45 checks + ZIP + browser | NOT_APPLICABLE | NO | OWNER_ACCEPTED ทั้ง7งาน | NO |
| M1 Web/API/identity/project/team | YES | YES | PASS API+browser | PASS PostgreSQL 17 CI (API/SQL) | NO | NOT_RUN | NO |
| M1 persistence/backup | YES | YES | PASS PGlite disk restart/restore | staging NOT_RUN | NO | NOT_RUN | NO |
| M1 LINE link/group/my projects | YES | YES | PASS simulated transport | REAL_LINE_NOT_RUN | NO | NOT_RUN | NO |
| M2+ time/OT/expense/payroll | M0 design | NOT_STARTED | NOT_RUN | NOT_RUN | NO | NOT_RUN | NO |

หลักฐาน [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md) แยก automated tests, browser และรายการ NOT_RUN ชัดเจน migrations 001_foundation / 002_line_outbox ใช้ checksum ไม่มีฐานเดิมหรือ legacy code

## ข้อจำกัดและสิ่งที่รอ

Local ใช้ PGlite PostgreSQL บน disk process เดียว ไม่ใช่ native service; staging/LINE worker บังคับ DATABASE_URL และ HTTPS ไม่มี deploy/ส่ง LINE จริง ยังไม่ปิด Gate M1 จนช่างเห็นงานตนผ่าน LINE จริงและ Owner ทดสอบ

Owner ยืนยันว่ามี OA/กลุ่มทดสอบแล้ว แต่ยังไม่ระบุชื่อ/IDs, ผู้ทดลอง, server/domain หรืองบ deployment ต้องรับข้อมูลนี้และตั้ง secrets นอกแชท/Gitก่อนทดสอบจริง ยังไม่มี password recovery/MFA/role-change/group-rebind UI, automated backup schedule หรือ DEAD payload cleanup ก่อน pilotต้องประเมิน/runbookให้ครบ

ข้อถามเรื่อง OT ไม่มี Work/Job budget/month export และจุดเริ่มนับหลักฐาน 2 ปีใน [OWNER_QUESTIONS](OWNER_QUESTIONS.md) เป็น milestone ถัดไป ไม่ขวาง Foundation และไม่ถามซ้ำเรื่องสิทธิ์ที่ Owner ตอบแล้ว

## ขั้นตอนถัดไป

[Draft PR #2](https://github.com/naochanma-code/asas-job-cost-workforce-core/pull/2) เปิดแล้ว implementation commit 69c073944d8c2149e9d5f903af6da9b6d08a4ae3 push ครบ; [CI PostgreSQL 17](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35610393373) PASS ทั้ง typecheck/tests/build/M0 regression ขั้นต่อไปเตรียม staging/LINE pilot เมื่อ Owner ระบุ environment และขอบเขตที่อนุญาต ยังไม่ merge M1 หรือเริ่ม M2
