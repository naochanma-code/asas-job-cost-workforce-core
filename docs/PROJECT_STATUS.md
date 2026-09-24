# PROJECT STATUS — M1 Alignment v3.0

## 24 กันยายน 2026 — Seed Type hotfix DEPLOYED / รอ Owner ยืนยัน Job

พบและพิสูจน์สาเหตุ400: seed Type IDจาก003ใช้ md5::uuid ซึ่ง strict RFC UUID validator ปฏิเสธ เมื่อส่งจาก dropdownจริง ต่างจาก tests เดิมที่ใช้ custom type หรือ defaultโดยไม่ส่งID. ก่อนแก้ regression REDข้อความตรงภาพ หลังแก้ canonical Type ID validator GREEN โดยไม่แก้ migration/ID/ข้อมูลจริงและไม่ลด role/scope checks

API exact8e47f04343c131ddc7b4af40856183542ce5f1e8 SUCCESS deployment55fecd13-bfb2-4fb0-ae15-cc822ef4f641; Webยัง80c2868 (ไม่มี Web change ในhotfix). ดำเนินการต่อใน processแก้ Staging ที่ Ownerให้ทำต่อและส่งภาพปัญหา ไม่เปิด LINE/Production ไม่ Merge/M2 ไม่เพิ่มบริการหรือเปลี่ยนแผน

TESTED: [CI36013717502](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36013717502) SUCCESS — Local35PASS/2nativeSKIP, Native PostgreSQL37PASS/0SKIP, typecheck/build/containers/smoke/M0 PASS. Regressionใช้ serializersของWebทดสอบครบ Project Type5/Job Type10 ทั้งcreate/edit/type rename-disable-enable/invalid-unknown IDs

TESTED_STAGING: HTTPS29 checks PASS ด้วยบัญชีและข้อมูลสมมติแยก: Owner+PMสร้างและอ่าน Jobทุก10seed โดยใส่ผู้รับผิดชอบสมมติและวันที่null, Projectทุก5seedไม่มีSite/Job, runtime/schema/TLS, LINEfalse/capabilityและdisabledno-write. Health200/database ready; log sampleไม่พบsecret patterns. ปิดบัญชีสมมติหลังทดสอบ ไม่ลบข้อมูลจริง ไม่เขียนในโครงการที่ Ownerแจ้ง

UAT_PENDING: root causeแก้และทดสอบบนStagingแล้ว แต่ Ownerยังไม่ได้ยืนยันกดจากฟอร์มเดิมหลังhotfix. API-only updateไม่ต้องล้างฟอร์มหรือเปลี่ยนประเภท Installation ไม่ต้องใส่วันที่เพื่อเลี่ยงbug. Live browser form submissionของOwnerไม่ทำแทนเพื่อไม่แก้ข้อมูลจริง


## ประวัติก่อน hotfix — พบสาเหตุจริงจากฟอร์ม Job ที่เลือก Installation

ภาพ Owner แสดง validation400ก่อนบันทึก จำลองซ้ำด้วย jobInput ของ Web + seed type ID + ผู้รับผิดชอบสมมติ + วันที่ว่าง + progress0 ได้ข้อความเดียวกัน (RED). Seed003ใช้ md5::uuid ซึ่ง PostgreSQL ยอมรับแต่ z.string().uuid() ปฏิเสธ version/variant bits; การทดสอบเดิมส่ง custom randomUUID type หรือไม่ส่ง type ID จึงไม่ครอบคลุม dropdownจริง

แก้เฉพาะ Type ID validator ให้รับ canonical128bit hex 8-4-4-4-12 สำหรับ project_type_id/job_type_id และ type master PATCH โดยยัง lookup FK/checkedType/สิทธิ์เดิม ไม่เปลี่ยน validator Project/User/Employee ID ไม่แก้ migration003หรือรหัส/ข้อมูลเดิม ไม่มี migrationใหม่

เพิ่ม regression ทุก seed Project5/Job10 ผ่าน payload จากตัวแปลงฟอร์มจริง: create/edit, responsible person, empty date, rename/disable/re-enable, invalid/unknown ID และ disabled rejection. Targeted11/11 PASS (GREEN); full regression35PASS/2nativeSKIP/typecheck/build/M0 PASS; targeted11PASSหลังจำกัดvalidatorเฉพาะType; CI รอผล ยังไม่ deploy hotfix และยังไม่ผ่าน Owner UAT


## 24 กันยายน 2026 — Deploy รุ่นแก้80c2868แล้ว / Job ของ Owner ยังรอตรวจรับ

Owner อนุมัติให้ทำ process ต่อหลังเสนอรุ่น80c2868 จึง Deploy API/Web exact80c2868b46f766ea0eb6da5e6c50eed617f6be7c ภายใน Railway Trial เดิม ไม่มี migration ใหม่ ไม่เปลี่ยนแผน ไม่เปิด LINE ไม่ Merge/M2/Production

PASS: ทั้งสอง deployment SUCCESS, HTTPS health200/database ready, runtime schema/privileges/verified TLS, LINE_ENABLED=false; targeted HTTPS8 checks ด้วยบัญชี Owner/PM สมมติ สร้าง Job และ GET กลับซ้ำสองครั้งผ่านทั้งสองบทบาท; disabled LINE endpoints503 และไม่ออก binding code บัญชีสมมติทั้งหมดของรอบนี้ปิดใช้งานหลังทดสอบ

PASS UI read-only: Refresh แล้วไม่มีปุ่ม LINE และหน้าโครงการแสดงรายการ Job/empty state ใต้ฟอร์ม รุ่นเดิมที่ Owner ทดลองก่อนหน้านี้ยังเป็น cda461d. ตรวจเฉพาะจำนวน Job/audit ของโครงการที่แจ้งปัญหา ไม่อ่านหรือแก้ค่าธุรกิจ พบ Job0 และ JOB_CREATED audit0 จึงยังไม่มีหลักฐานว่าการกดก่อนหน้าบันทึกสำเร็จ ไม่สรุปสาเหตุว่าเป็นเพียงการเลื่อนหน้าจอ

UAT_PARTIAL / OPEN_ISSUE: Owner ทดลองมือถือได้ แต่กรณี Job ของ Owner ยังรอตรวจรับบนรุ่นใหม่นี้; LIVE_BROWSER_CREATE_NOT_RUN รอบนี้ (ทดสอบสร้างผ่าน HTTPS API ด้วย fixture แยก และตรวจ UI แบบอ่านอย่างเดียว) ขอให้ Owner Refresh หน้าเดิม เปิดโครงการ และกดเพิ่มงานย่อยครั้งเดียว ตรวจผลสำเร็จหรือข้อความผิดพลาดใต้ฟอร์ม ก่อนกดซ้ำ

CI ของ source รุ่นนี้ PASS36/36บนNative PostgreSQL17; Local34PASS/2nativeSKIP; typecheck/build/container/smoke/M0 PASS ตาม CI36010347404. Log sample ล่าสุดสูงสุด100รายการต่อบริการไม่พบรูปแบบข้อมูลลับที่สแกน ไม่อ้างว่าครอบคลุม historical logs ทั้งหมด


## ประวัติก่อน Deploy — รอบแก้หลัง Owner ทดลองมือถือ

Owner ยืนยันว่ามือถือเข้าใช้งานได้ แต่รายงานสร้าง Job แล้วไม่เห็น จึงเป็น UAT_PARTIAL / OPEN_ISSUE ไม่ใช่ UAT_PASSED ทั้งระบบ งาน Job UI รับผิดชอบ task Reviwer; Codex task Milestone รับผิดชอบ LINE disabled guard และรวมผลตรวจ

พบ LINE=false ยังสร้าง group binding code และแสดง LINE controls ได้ แก้ /api/me ให้คืน line_enabled boolean และปิด controls ตามค่า true เท่านั้น; API ปฏิเสธ link/unlink/group-code เมื่อ disabled ก่อนเปลี่ยนข้อมูล ไม่เปิด LINE ไม่เปลี่ยน schema/permission role

Local/CI ล่าสุด: 34 PASS / 2 native-only SKIP / 0 FAIL; Native PostgreSQL17 36 PASS / 0 SKIP / 0 FAIL; typecheck, production build, API/Web container build และ smoke, M0 checks PASS — [CI36010347404](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36010347404) ที่ code+test commit 80c2868b46f766ea0eb6da5e6c50eed617f6be7c. พร้อมเสนอ Deploy API/Web รุ่นแก้ ไม่มี migration ใหม่; รอ Owner อนุมัติ เพราะการอนุมัติครั้งก่อนระบุ release cda461d. Staging ยังเป็น cda461d ไม่แก้ข้อมูลจริง ไม่ Merge/M2/Production


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

หลักฐานเพิ่ม: code patch de99037 CI [36009851061](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36009851061) SUCCESS ครบ Local/Native PostgreSQL17/typecheck/build/API+Web containers/smoke/M0. เพิ่ม Owner-specific POST Job/GET ซ้ำสองครั้งด้วย Project สมมติไม่มี Site แล้ว targeted alignment10/10 PASS โดย task Reviwer; CI ของ test follow-up80c2868 SUCCESS ตามลิงก์ด้านบน ไม่ใช่การยืนยัน Job จริงที่ Owner รายงานหรือ Deploy patch
