# PROJECT STATUS — Milestone 1

อัปเดต 24 กันยายน 2026 · ผู้รับผิดชอบ: Codex (Foundation/API/เอกสาร), task Reviwer ตรวจ Job UI · branch codex/milestone-1-foundation · PR #2 ยัง Draft

## ตอนนี้ถึงไหน

**Owner ยืนยันเพิ่ม Job ได้แล้ว — ปิดปัญหา Job validation400** ตามข้อความ “โอเคเพิ่มได้แล้วค่ะ ทำขั้นตอนต่อไปได้เลย” การยืนยันนี้ครอบคลุม flow สร้าง Job และผลแก้ครั้งนี้ ไม่ใช่ตรวจรับทุก flow หรืออนุมัติ Merge/M2; ต่อมา Owner อนุมัติ LINE Pilot เฉพาะขอบเขตตาม D-030

API ที่ใช้งาน: 8e47f04343c131ddc7b4af40856183542ce5f1e8 · Web: 80c2868b46f766ea0eb6da5e6c50eed617f6be7c · [เว็บ Staging](https://web-staging-cb6f.up.railway.app/)

| Definition of Done | สถานะจริง |
| --- | --- |
| DESIGNED / CODED | PASS — Authentication/Roles/Customer/optional Site/Project/optional Job/Types/Assignment/Audit |
| TESTED_LOCAL / CI | PASS — Local35PASS/2nativeSKIP, Native PostgreSQL37/37, Typecheck/Build/Containers/Smoke/M0; CI36013717502 |
| DEPLOYED_STAGING | PASS — API/WebตามSHAด้านบน; health200/database ready ตรวจซ้ำรอบนี้ |
| TESTED_STAGING | PASS ตามขอบเขต — HTTPS29 checks seed types/Owner/PM/responsible/empty date, สิทธิ์และRestartจากรอบก่อน; ดู Test Evidence |
| OWNER_UAT_JOB_CREATE | PASS — Owner ยืนยันหลัง hotfix; ไม่ใช้ผล API แทนคำยืนยัน |
| OWNER_UAT_MOBILE | PASS ตามรายงาน — มือถือใช้งานได้; ไม่ใช่ตรวจทุกอุปกรณ์ |
| OWNER_UAT_ALL_M1 | PARTIAL — Webบางflowยืนยันแล้ว; LINEและรายการ UATอื่นที่ยังไม่ยืนยันยังไม่ผ่าน |
| BACKUP / RESTORE | PASS แบบ manual snapshot/ฐานกู้แยก; ยังไม่มี scheduled backup/PITR/key escrow ข้ามเครื่อง |
| REAL_LINE | NOT_RUN / DISABLED — ยังไม่เปิด webhook/worker หรือส่งข้อความจริง |
| MERGE / M2 / PRODUCTION | NOT_AUTHORIZED — ไม่ Merge PR#2 ไม่เริ่ม M2/M3 ไม่ Deploy Production |

## ขั้นตอนที่กำลังทำต่อ

เตรียม LINE Pilot ใน M1 เฉพาะเชื่อมบัญชี งานของฉัน ผูกกลุ่ม และถอนสิทธิ์ ใช้ OA/กลุ่มทดสอบ ข้อมูลProjectสมมติ Owner/Admin/ช่าง1คน ไม่รวมลงเวลา OT Expense Payroll หรือรูปบิล

ตรวจความพร้อมแบบอ่านอย่างเดียวแล้ว: LINE_ENABLED=false; APIยังไม่มี Channel Secret/Bot ID/Payload Key/User+Group allowlist; RailwayมีเพียงWeb/API/Postgres ยังไม่มีworker จึง **NOT_READY_TO_ENABLE** ไม่ใช่แค่เปลี่ยนสวิตช์แล้วเริ่มได้

แผนและเงื่อนไขก่อนเปิดอยู่ใน [LINE Pilot Readiness](M1_LINE_PILOT_READINESS.md) ต้องเตรียม secretsผ่านRailwayโดยตรง, private allowlist enrollmentที่ไม่logข้อมูล, workerที่หยุดได้และผ่านsimulation, edge/security checksที่ยังค้าง ภายใต้Trialเดิม หากต้องเสียเงินเพิ่มหยุดแจ้งOwner

## สิ่งที่ Owner ต้องทำต่อ

อนุมัติแล้ว: LINE Pilot 3คน/1กลุ่ม และเปลี่ยน Webhook เดิมของ OA ที่แจ้งได้ ขณะนี้ Codexเตรียมโค้ดและทดสอบ signed enrollment/private project scope ก่อนเปิดจริง Ownerเข้าสู่ LINE Console แล้ว รอปลายทางกรอก Secret/Token ผ่าน Railway โดยตรง ไม่ต้องส่งในแชท ไม่ต้องเทสJobซ้ำ

## หลักฐานและขอบเขตงาน

[CI](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36013717502) · [Staging Evidence](M1_ALIGNMENT_STAGING_EVIDENCE.md) · [Test Evidence](M1_TEST_EVIDENCE.md) · [Owner UAT](M1_OWNER_UAT.md) · [ประวัติ](M1_STAGING_HISTORY.md)

M1อยู่ใน .local/m1-staging โฟลเดอร์หลักเป็นงานM2ที่พักไว้ ไม่รวมโค้ดหรือschemaM2 งานรอบนี้เพิ่ม LINE pilot guard/enrollment/worker tests ตาม ADR-012 ไม่มี schema change; ยังไม่ deploy รุ่นนี้หรือเปิด LINE จริง

## ความคืบหน้ารอบอนุมัติ Pilot

CODED: private enrollment15นาที3คน1กลุ่ม/Project allowlist/source revocation guard/worker safe error. TESTED_LOCAL targeted10/10/typecheck/build PASS; Latest full45PASS/2nativeSKIP; CIรอหลังpush DEPLOYED/REAL_LINE NOT_RUN ของรุ่นนี้. TrialคงเหลือประมาณUSD4.79/28วัน ณตรวจ ไม่อัปเกรด

[UI Design Direction](UI_DESIGN_DIRECTION.md): DESIGNED_REFERENCE จากtask Reviwer ยังไม่ใช่UIที่deploy
