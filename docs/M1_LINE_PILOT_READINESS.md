# M1 LINE Pilot — Readiness 24 September 2026

สถานะ PREPARED / NOT_READY_TO_ENABLE / REAL_LINE_NOT_RUN. OwnerยืนยันJob createบนWebผ่านแล้ว ต่อมา Owner อนุมัติ bounded LINE Pilot และเปลี่ยน Webhook เดิมตาม D-030; ไม่อนุมัติ Merge/M2/Production

## ขอบเขตที่ Owner ยืนยันแล้ว

ผู้ร่วมทดลอง: Owner โอ๋, Admin ฟ้า, Technician1คน; OAทดสอบที่มีอยู่และกลุ่มทดสอบ1กลุ่มเท่านั้น ใช้บัญชีแยก/Projectสมมติ Aไม่มีSiteJob และ BมีSiteJob. LINEข้อความจำกัดเชื่อมบัญชี/งานของฉัน/ผูกกลุ่ม/แจ้งถอนสิทธิ์ ไม่มีข้อความถึงลูกค้า กลุ่มจริง เวลา/OT/Expense/Payroll

ไม่สมัครบริการเสียเงิน ไม่อัปเกรด ไม่ลบข้อมูลจริง ไม่เปิดAPI/DB portสาธารณะ ใช้Web HTTPSเดิมเป็นwebhook เมื่อผ่านgate. ถ้าทดลองต้องใช้ทรัพยากรเกินTrialหรือเครดิตไม่พอ หยุดแจ้งOwner

## ผลตรวจรอบนี้ (read-only ไม่มีค่า secret ในรายงาน)

- PASS: branchตรงorigin ไม่ตกหลังmain; health200/database ready
- PASS Owner reported: สร้างJobได้หลังseed Type validatorhotfix; มือถือใช้งานได้จากรอบก่อน
- PASS automated: CI37/37NativePG และ Staging29checks ตาม M1_TEST_EVIDENCE
- DISABLED: LINE_ENABLED=false
- NOT_CONFIGURED: API Channel Secret, Bot ID, sharedPayloadKey32bytes, allowedUserIDs/GroupIDs
- NOT_DEPLOYED: worker; providerมีเพียงWeb/API/Postgres. Access Tokenต้องอยู่workerตามแผน ไม่ถือว่าการไม่มีAccessTokenในAPIเป็นbug
- NOT_RUN: Real OA Verify, link/group binding, real token expiry/replay และ reply delivery
- PARTIAL: Web security/provider backupผ่านบางส่วน; live rate-limit/edge checks, scheduled backup/PITR, restoreWebLoginและworkerstopยังไม่ครบ ดู matrix ไม่เปลี่ยนทั้งหมดเป็นPASS

## ลำดับดำเนินการหลังยืนยันขอบเขต

1. ตรวจquota/creditของTrialและแผนรันworker private ก่อนเปลี่ยนservice ต้องมีsource SHA/CI และวิธีหยุด/กู้ process; ห้ามเพิ่มpaidserviceหรือวางAccessTokenในWeb. ไม่มีการสร้างworkerในรอบนี้
2. เตรียมprivate enrollmentสำหรับuser/group IDs และทดสอบด้วยsigned synthetic events. ปัจจุบันallowlistทิ้งeventนอกscopeและไม่มีenrollment UI จึงห้ามแก้ด้วยwildcardหรือพิมพ์rawwebhookในlog
3. OwnerกรอกChannel SecretในAPI และChannel Access Tokenในworkerผ่านRailway Variables/Secret Managerโดยตรง. Bot ID/allowlistเก็บในenvironmentโดยไม่ใส่Git. Codexเตรียมrandom32bytePayloadKeyแบบไม่แสดงค่าและตรวจเฉพาะboolean/length ไม่มีการขอSecret/Tokenในchat/screenshots
4. ตั้งAPI/worker LINE_ENABLED=falseตลอดขั้นเตรียม ทดสอบworkerstart/stop/retry/dedupe/fail-closedแบบไม่ส่งLINEจริง, ตรวจsecretในlogและขอบเขตข้อมูลก่อนนัดผู้ใช้
5. เมื่อtechnicalgatesผ่านและมีขอบเขตOA/กลุ่ม/ผู้ทดลองยืนยันแล้ว จึงตั้ง webhook https://web-staging-cb6f.up.railway.app/api/line/webhook และเปิดส่งข้อความเฉพาะpilotที่อนุมัติ ห้ามเปิดก่อนข้อ1–4ครบ
6. ทดสอบตาม M1_LINE_PILOT_CHECKLIST/UAT: linkครั้งเดียว/หมดอายุ, งานAไม่มีJob, denyProjectB, groupbindingผู้สร้างถูกต้อง, ถอนassignmentสิทธิ์หาย, job-levelvisibility, replayไม่สร้างผลซ้ำ บันทึกผลแยกOwnerกับautomated
7. ปิดLINEและหยุดworkerเมื่อจบรอบ ก่อนเริ่มรอบอื่นตรวจapproval/allowlistอีกครั้ง

## วิธีหยุดเมื่อผิดปกติ

ปิดLINE_ENABLEDทั้งAPIและworker, หยุดworkerและwebhook. ห้ามใช้เปลี่ยนflagบนAPIอย่างเดียวแทนหยุดworkerที่กำลังรัน ไม่replayreplytokenเก่า ไม่fallbackpush ไม่ลบaudit. เก็บเฉพาะcounts/statusที่ไม่ลับแล้วแจ้งOwnerหากผิดscope/secret/cost

## Owner action

Owner ยืนยันแล้วและเข้าสู่ LINE Console ของ OA ทดสอบ รอกรอก Channel Secret/API และ Access Token/worker ผ่าน Railway โดยตรงเมื่อ operator เตรียมปลายทางพร้อม ห้ามส่งค่าลับในแชท

## Delta D-030 — ก่อนเปิดจริง

เพิ่ม LINE_TEST_PROJECT_IDS ทั้งAPI/workerให้มีเฉพาะProjectสมมติ และโหมด LINE_ENROLLMENT_ENABLED=true ร่วมกับLINE_ENABLED=falseเพื่อรับรหัสสมัครชั่วคราว ผ่าน /line-pilot (Ownerผู้เริ่มรอบ) ตาม ADR-012. รับครบแล้วตรวจ3คน1กลุ่ม ตั้งallowlistโดยตรง ปิดenrollmentแล้วค่อยเปิดbusinessLINEเมื่อworker/gatesพร้อม ไม่มี auto-grant

CODED/targetedTESTED ไม่ใช่DEPLOYED ยังต้องตรวจrealVerify/workerstop/enrollmentบนStagingก่อนUAT. ConsoleมีWebhookเดิมเปิดอยู่ Ownerอนุมัติเปลี่ยนแล้ว แต่ยังไม่ได้เปลี่ยนจนendpointพร้อม
