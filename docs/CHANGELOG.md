# CHANGELOG

## 2026-09-22 — Railway Trial preparation

- บันทึกอนุมัติ Trial Staging และห้ามอัปเกรด/เพิ่มค่าใช้จ่ายเอง สร้าง project/environment เปล่า ยังไม่ deploy
- เพิ่ม Dockerfiles Web/API, CI build/smoke container และ runtime schema verification โดยไม่ใช้ DDL ตอนเริ่ม production-mode API/worker
- เพิ่ม runtime-schema test: reject missing/modified/extra migration; local19 PASS/1 SKIP
- เพิ่ม D-017/คู่มือ Railway; GitHub access รอ Owner อนุมัติหลัง automatic approval review ปฏิเสธ ยังไม่ Merge PR #2/M2/Production

## 2026-09-22 — เตรียม Milestone 1 Staging และ Real LINE Pilot

- ตรวจ Draft PR #2/CI/main: ไม่ตกหลัง main และ mergeable; แยก checkout เพื่อพักงาน M2 ไม่ให้ปน PR
- เพิ่มแผน Hosting 2 ทาง (Railway/Render), งบขออนุมัติ ขั้นตอน non-programmer, secrets, restart/restore/ย้าย/หยุดบริการ และรายการ blocker ก่อนเปิดจริง
- เพิ่ม checklist สำหรับโอ๋/ฟ้า/T1/OA/กลุ่ม, Owner UAT 10 ข้อ, security test matrix และ fixture A ไม่มี Site/Job กับ B มี Site/Job
- เพิ่มทดสอบ HTTPS config/Secure cookie, rate limit/forwarding spoof/account lock, raw signature และ native PostgreSQL restore พร้อมสิทธิ์หลัง restore; รัน tests แบบ serial เพื่อแยกการ migrate บน CI DB
- สถานะยังไม่ deploy/real LINE/UAT/merge; หลักฐานรอบนี้ใน M1_TEST_EVIDENCE แยกผล local/CI/staging

## 2026-09-21 — เริ่ม Milestone 1 Foundation

- Implementation 69c0739 push และเปิด Draft PR #2; CI run 35610393373 PASS กับ PostgreSQL 17 รวม typecheck/tests/build/M0 regression บันทึก provenance แยก ไม่ใช่ real LINE หรือ Owner UAT

- Owner อนุมัติเริ่มและยืนยัน OA/กลุ่มทดสอบแยก; บันทึก MASTER §19, D-014/ADR-010 และปรับ proposal เป็น AUTHORIZED
- เพิ่ม Next.js/Fastify, session login/4 roles/multiple Owners, Customer/Project/optional Site/Job/team assignment, audit/health และ migrations พร้อม constraints
- เพิ่ม PGlite local persistence และ native PostgreSQL adapter, backup/restore ฐานว่าง, CI และ lockfile; เพิ่ม scripts bootstrap/seed เฉพาะฐานว่าง
- เพิ่ม LINE account link/unlink, signed webhook/inbox/outbox/worker, group code, งานของฉัน, encrypted payload และ pilot allowlists; LINE จริงยัง NOT_RUN
- เพิ่ม API contract, runbook และ M1 test evidence; ทดสอบบนเครื่องรวม UI ด้วยข้อมูลสมมติ ไม่มี production deploy/M2/M1 merge

## 2026-09-21 — Merge Milestone 0 เข้า main

- OwnerยืนยันรับM0และสั่งMerge PR#1; merge commit a7e5c9e08a4d2c8185a12ef65f705a190c243a8d (PRhead22b8f32706396cbac31bfb87f77598613b1bc857)
- ตรวจAGENTS/README/docsบนmainตรงกับPRhead รวมprototypeและADRครบ; หลังmerge45checksและindependentZIPผ่าน
- อัปเดตPROJECT_STATUSเป็นOWNER_ACCEPTED / MERGED และสถานะสรุปในREADME/MILESTONE_0; เพิ่มข้อเสนอM1_FOUNDATION_PROPOSALเป็นเอกสาร ยังไม่เริ่มM1 ไม่deploy ไม่เชื่อมLINEจริง

## 2026-09-21 — M0 รอบ4 / ตรวจปิดงาน

Artifact cf615b00e97f1d2fdaa71b4501c7c0340d6cc2c3 pushแล้ว; PR#1 Ready for review (draft=false) GitHubmergeable=true/clean ไม่merge ไม่เปิดauto-merge; commitปิดหลักฐานถัดมาปรับเฉพาะเอกสาร

- PM/Admin/Owner ลงวันทำงานและ OT แทนพนักงานใน Project ที่มีสิทธิ์ได้ โดยเก็บผู้กรอกแยกจากพนักงาน ทุกบทบาทส่งค่าใช้จ่ายได้ PM เห็นยอดและรูปเฉพาะรายการที่ตนส่ง LINE expense ทุกบทบาทต้องรอ Admin หรือ Owner กดอนุมัติแยกทุกครั้งก่อนเป็น Actual; Web คงขั้นรอตรวจเดิม ไม่มี auto-approve
- เพิ่มADR-009/D-011 ปรับMASTERv2.5, permissions, schema/audit, wireflow/state, prototype; ตรวจOwnerAcceptanceแยกจากCodex
- ปิดM0 OWNER_ACCEPTED / READY_TO_MERGE: Ownerยืนยัน7งาน; 45checks+ZIP+browser7งานและfeedbackregressionPASS; แก้ย้อนสรุปแล้วเปลี่ยนพนักงาน/ช่องทางไม่อัปเดตและตรวจซ้ำผ่าน ไม่merge/M1/deploy/LINEจริง

## 2026-09-21 — M0 รอบ3 (ADR-008)

Artifactที่ตรวจ 2294814994d7a244be1989ffe4cc7f7ee074c13e; บันทึกprovenanceแยกโดยไม่เปลี่ยนต้นแบบ

- Admin ตรวจแก้จำนวน/รายละเอียด/เงิน/รูปexpenseรายรายการพร้อมประวัติ ไม่เห็นProject total/Payroll; PMยังไม่เห็นเงิน
- Adminapproveวัน/OTผ่านครั้งเดียว ปิดเดือนระบบคำนวณ Ownerตรวจเฉพาะเงิน
- OTบวกทีละ0.5 ปฏิเสธเศษนาที; หลักฐานเก็บ2ปีเป็นdesign ไม่มีการลบจริง
- ปรับMASTERv2.4, schema/dictionary, permission, wireflow/state, payrollcases, export/pilot และOWNER_QUESTIONSเป็นภาษาตรงไปตรงมา
- ตรวจlocal 24 baseline +14 contract checks, ZIP reader และbrowser6กรณีผ่าน; ไม่เริ่มProduction/LINE/deploy

## 2026-09-21 — Milestone 0 รอบ2ตามคำตอบ Owner

- ยืนยัน Q-01/02/03วันที่/04/05สิทธิ์/06ขอบเขต: Admin/PMไม่มีเงินทุกประเภท, Ownerหลายบัญชีสำหรับหุ้นส่วน3คน, optional Job, OTdate+hoursย้อนหลังไม่แยกวัน, สองProjectแบ่งครึ่ง และfolderหลักฐานรายเดือน
- เพิ่ม ADR-007/D-009 และปรับ MASTER v2.3, AGENTS, Payroll policy, dictionary/schema, permission matrix, wireflow, state, export และ pilot script ให้ตรงคำตอบ; ไม่เปลี่ยนส่วนที่ Owner ยังไม่ยืนยัน
- เพิ่มเลือกไฟล์จริง/preview/ลบและเพิ่มไฟล์ก่อนส่ง, หมวดexpenseครบ9, Owner-only local ZIP รายเดือนและ3Owner selectors
- แยก UI/time projection ของ Admin/PM ไม่เปิดเงินหรือรูปบิล; ตรวจวันซ้ำและfreezeสรุปเวลาของรอบจำลอง
- 24 baseline checks +13 R2 checksผ่าน; ZIPอ่านด้วย .NET ผ่าน counts/bytes/total; browser smoke8กรณีตาม TEST_EVIDENCE
- Update PROJECT_STATUS; ไม่มี production application, migration, deployment, LINEจริง หรือข้อมูลจริง
- บันทึก artifact commit รอบ2ที่ตรวจ 5f96422eb23151022c789441deb83a4c7eeb3312 พร้อมผล fetch/rebase main up to date


## 2026-09-21 — อธิบายคำถามสำหรับโอ๋ให้อ่านง่าย

- เพิ่มคำอธิบายภาษาง่ายใน OWNER_QUESTIONS พร้อมระบุว่าตอนนี้ขอคำตอบเฉพาะ Q-01 และยกตัวอย่างการหาค่าแรงจากยอดต้นทุนรวม
- แยกเรื่องที่คุยภายหลังและอธิบายการลองต้นแบบ 7 งานก่อนจบ Milestone 0
- อัปเดต PROJECT_STATUS ให้ตรงกัน ไม่เปลี่ยนสูตร สิทธิ์ หรือบันทึกว่า Owner อนุมัติแล้ว

## 2026-09-21 — Milestone 0 process design (รอ Owner review)

- เพิ่ม wireflow Web/LINE ทั้ง 5 actions, state diagrams, data dictionary และ permission matrix
- เพิ่ม Payroll golden cases, monthly reconciliation, calendar/late/revision/privacy test specifications
- เพิ่ม Accounting Evidence Export Specification และ Pilot Acceptance Script แยก M0 walkthrough จาก real pilot
- เพิ่ม ADR-001–006, requirement question register และดัชนีเอกสาร Milestone 0
- เพิ่ม clickable prototype เฉพาะข้อมูลสมมติ Project A ไม่มี Site/Job และ Project B มี Site/สอง Jobs; ไม่มี production application หรือ backend
- เพิ่มการตรวจ fixture/ลิงก์และบันทึกหลักฐาน local แยกจาก integration, deployment, real LINE และ Owner UAT ที่ยังไม่รัน
- อัปเดต PROJECT_STATUS, DECISION_LOG และ DATABASE_SCHEMA; เก็บ Master Prompt/PAYROLL_POLICY accepted baseline เดิม
- ใช้ branch codex/milestone-0-process-design; ไม่มี migration/deploy/LINE OA จริง/บริการเสียเงิน
- ตรวจ local fixtures/documents 24 ข้อผ่าน และ browser smoke 8 กรณี; แก้ Job B1 option markup และรักษา click handlers ของ export/payroll ระหว่างตรวจต้นแบบ ผลนี้ไม่ใช่ Owner UAT
- บันทึก artifact commit ที่ตรวจ `be4bfc6137394f34e0b1f5399f98e8a864298f9c` และผล fetch/rebase main (up to date) เพื่อให้ตรวจซ้ำได้

## 2026-09-21 — Master Prompt v2.2

- เผยแพร่เอกสารกลางขึ้น Private GitHub Repository `naochanma-code/asas-job-cost-workforce-core`
- ยืนยันรอบค่าจ้างวันที่ 1 ถึงวันสุดท้ายของเดือน
- กำหนดโอนเงินไม่เกินวันที่ 1 ของเดือนถัดไป
- เพิ่ม workflow ปิดข้อมูลเวลา, Owner approval และ payment recording
- เพิ่ม late adjustment และ audit สำหรับข้อมูลที่มาหลังปิดรอบ
- เพิ่ม `PAYROLL_POLICY.md`

## 2026-09-21 — Master Prompt v2.1

- สร้าง Repository ใหม่แยกจากงานเดิม
- กำหนด Site เป็น optional
- กำหนด Project เป็นหน่วยหลักและ Job เป็น optional
- เพิ่ม Project-level Assignment/Budget/Time/OT/Expense/Cost
- ยืนยันค่ากิน 120/60 เฉพาะวันที่ทำงาน รวมวันหยุดที่มาทำงาน
- ยืนยันไม่ทำภาษีและประกันสังคมใน Release แรก
- กำหนด Admin กรอก/ตรวจข้อมูลเวลาโดยไม่เห็นยอด Payroll
- กำหนด Owner กรอก rate เห็นยอด อนุมัติและ lock
- เพิ่มคำถาม payroll cutoff/payment date

- หลักฐานรอบเตรียม Staging: local typecheck/build PASS; 18 tests PASS และ native restore 1 SKIP รอ CI; M0 45 checks PASS

- CI code45be1ac run35685633979 SUCCESS รวม native PostgreSQL17 restore case, security tests, build และ M0; commitถัดมาบันทึกผลใน PROJECT_STATUS/M1_TEST_EVIDENCE เท่านั้น
