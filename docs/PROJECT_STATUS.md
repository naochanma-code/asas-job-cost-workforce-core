# PROJECT STATUS — M1 Alignment v3.0

## 24 กันยายน 2026 — รอบแก้หลัง Owner ทดลองมือถือ (ยังไม่ Deploy)

Owner ยืนยันว่ามือถือเข้าใช้งานได้ แต่รายงานสร้าง Job แล้วไม่เห็น จึงเป็น UAT_PARTIAL / OPEN_ISSUE ไม่ใช่ UAT_PASSED ทั้งระบบ งาน Job UI รับผิดชอบ task Reviwer; Codex task Milestone รับผิดชอบ LINE disabled guard และรวมผลตรวจ

พบ LINE=false ยังสร้าง group binding code และแสดง LINE controls ได้ แก้ /api/me ให้คืน line_enabled boolean และปิด controls ตามค่า true เท่านั้น; API ปฏิเสธ link/unlink/group-code เมื่อ disabled ก่อนเปลี่ยนข้อมูล ไม่เปิด LINE ไม่เปลี่ยน schema/permission role

Local 33 PASS / 2 native-only SKIP / 0 FAIL; typecheck และ production build PASS (หลังรับ Job UI patch และ LINE guards) CI/container รอผล; Staging ยังเป็น cda461d ไม่อ้างว่า patch Deploy แล้ว ไม่แก้ข้อมูลจริง ไม่ Merge/M2/Production


อัปเดต 24 กันยายน 2026 · ผู้รับผิดชอบ: Codex · branch codex/milestone-1-foundation · PR #2 ยัง Draft

## ตอนนี้ถึงไหน

**DEPLOYED_STAGING / รอ Owner UAT รุ่น Alignment** — Owner อนุมัติ Backup/Restore และ migration003 พร้อม Deploy API/Web จาก cda461dd3ca540f91b5857e245304aa2c1fe41f7 แล้ว ดำเนินการผ่านภายใน Railway Trial เดิม ไม่เปลี่ยนแผน ไม่เปิด LINE ไม่ Merge และไม่เริ่ม M2/M3/Production

เว็บทดลอง: https://web-staging-cb6f.up.railway.app/ ใช้บัญชีเดิม หากหน้าเก่ายังค้างให้ Refresh หรือ Login ใหม่

| Definition of Done | ผลจริง |
| --- | --- |
| DESIGNED / CODED | PASS — Project Type5/Job Type10, ข้อมูล Project/Job, atomic codes, PM assignment และ audit |
| TESTED_LOCAL | PASS — 32 PASS / 2 native-only SKIP; typecheck/build; M0 45 checks |
| TESTED_INTEGRATION | PASS — Native PostgreSQL17 34/34, container build/smoke; CI release cda461d SUCCESS |
| BACKUP / RECOVERY | PASS — encrypted backup บน volume และนอก provider; restore ฐานใหม่ ตรวจ business digest ตรงกัน runtime เข้า recovery ไม่ได้ |
| DEPLOYED_STAGING | PASS — migration003 บน PostgreSQL18; API/Web exact cda461d Online; HTTPS health200/database ready |
| TESTED_STAGING | PASS — 24 HTTPS checks ด้วยข้อมูลสมมติ; runtime/TLS, restart และ data digest; log sample ไม่พบ secret patterns |
| UAT_PASSED | PARTIAL / OPEN_ISSUE — Owner ทดลองมือถือใช้งานได้ แต่ Job visibility ยังรอตรวจรับ |
| REAL_LINE | NOT_RUN — LINE_ENABLED=false |
| PRODUCTION_READY | NO — ไม่มีการอนุมัติ Production หรือ Merge |

## สิ่งที่ให้ Owner ทดลองเป็นรอบเดียว

1. ใช้ Owner/Admin ดูว่าหน้า Project แสดงชื่อลูกค้า และสร้างโครงการสมมติแบบไม่มี Site/Job ได้
2. สร้างโครงการสมมติอีกอันที่มี Site แล้วเพิ่ม Job หลายงาน ทดลองประเภท ผู้รับผิดชอบ สถานะ และความคืบหน้า
3. ตรวจหน้าตั้งค่า Project Type/Job Type ว่าเพิ่ม แก้ชื่อ เรียง และปิดใช้งานได้ตามต้องการ
4. แจ้งว่าหน้าจอและขั้นตอนใช้งานผ่านหรือจุดใดต้องแก้ โดยเฉพาะบนมือถือ ไม่ต้องส่งรหัสผ่าน

ระบบทดสอบสิทธิ์ Owner/Admin/PM/TECH อัตโนมัติแล้ว ไม่ต้องสลับบัญชีทีละขั้น บัญชีที่ระบบสร้างทดสอบปิดใช้งานหมดแล้ว ข้อมูล PILOT และ audit คงไว้ ไม่แตะรายการธุรกิจจริงเป็น fixture

## Migration และข้อจำกัด

003 เป็น append-only เก็บ UUID/รหัสเดิมและข้อมูลธุรกิจเดิม ตรวจ digest ก่อน/หลังตรงกัน เพิ่ม types/fields/counters/registry และ safe backfill ตามแผน Runtime ไม่มี DDL และแก้ทะเบียนรหัสย้อนหลังไม่ได้

Backup ที่ตรวจครั้งนี้เป็น snapshot ก่อน migration ไม่ใช่ scheduled backup หรือ PITR; กุญแจ recovery ผูก Windows profile เครื่องนี้ ยังไม่มี key escrow ข้ามเครื่อง การกู้ภายหลังต้องรักษารหัสที่ออกหลัง snapshot ตาม Recovery Plan

ยังไม่ได้ตรวจ authenticated browser E2E/mobile ของรุ่นใหม่; live rate-limit load test ไม่ได้รันรอบนี้ (Local/CI มีหลักฐาน) ไม่ใช้ผล API แทน Owner UAT

ไม่มีคำถามอนุมัติค้างจากรอบนี้ การอนุมัติ Backup และ Migration ที่เคยติดได้รับแล้ว รายละเอียดดู [Staging Evidence](M1_ALIGNMENT_STAGING_EVIDENCE.md), [Test Evidence](M1_TEST_EVIDENCE.md), [Recovery Plan](M1_ALIGNMENT_MIGRATION_PLAN.md)

งาน M1 อยู่ใน .local/m1-staging โฟลเดอร์หลักเป็นงาน M2 ที่พักไว้ ไม่รวมการแก้ M2 ใน PR นี้

Job UI patch จาก task Reviwer: เพิ่มรายการข้างฟอร์มและผลสำเร็จ/ข้อผิดพลาดใกล้ปุ่ม หลัง POST สำเร็จล้างฟอร์มทันที; GET refresh fail แสดงคำเตือนว่าบันทึกแล้วไม่ชวนสร้างซ้ำ. ยังไม่พิสูจน์สาเหตุ Job เดิมที่ Owner รายงาน และไม่ถือว่าผ่าน browser/UAT ของ patch. ไม่มี migration ใหม่

