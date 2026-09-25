# PROJECT STATUS — Milestone 1

อัปเดต 25 กันยายน 2026 · Module owner: Codex · branch codex/milestone-1-foundation · PR #2 ยัง Draft / ไม่ Merge

## ตอนนี้ถึงไหน

**เปิด LINE Pilot กลับแล้วหลังรับ LINE Admin ใหม่** จำกัดผู้ทดลอง3คน / กลุ่ม1กลุ่ม / Projectสมมติ2รายการตาม D-030 และ D-034. Rich Menu พักตาม Owner จนส่วน LINE ของ Milestone ครบ

API/worker LINE_ENABLED=true และ LINE_ENROLLMENT_ENABLED=false; exact allowlists ตรงกัน. คง OWNER/TECH ที่เชื่อมอยู่สองบัญชี เปลี่ยนเฉพาะช่องเดิมที่ยังไม่มี line_accounts เป็น LINE Admin ที่ Owner ขอและส่งรหัสแล้ว. การลงทะเบียน Admin ผ่าน แต่ Owner ให้พักขั้นเชื่อมกับบัญชีแอป ADMIN ไว้ก่อน (DEFERRED_BY_OWNER) ไม่มีการเพิ่มสิทธิ์หรือเปลี่ยน role อัตโนมัติ

Release Web/API/worker ยัง **dc289ee3088cd84639cc828b49a6f5c50a665f55** ไม่มี code/schema change. API deployment **81db9569-03bd-4d63-b64f-b36b3b3e5bf2** และ worker **45e3de67-ee8f-44d6-9e2c-3a97d6a3ae2e** SUCCESS / deploymentStopped=false; Webเดิม d3bca251-a686-402e-a0d8-0e5dd2cddbb9. API/workerยัง private ไม่มีpublicdomain

## สถานะตาม Definition of Done

| รายการ | ผลและหลักฐาน |
| --- | --- |
| CODED | PASS — Foundation/M1 Alignment และ D-033 fragment link / queue retention24ชั่วโมง |
| TESTED_LOCAL | PASS — ล่าสุด50PASS/2NativeSKIP, typecheck, M0เอกสาร45checks |
| TESTED_CI | PASS — CI36105399785 commit07dab28: NativePostgreSQL52/52, typecheck/build/API+Webcontainers/smoke/M0; ไม่ใช่ real LINE UAT |
| DEPLOYED_STAGING | PASS — exactdc289ee; รอบนี้เปลี่ยนเฉพาะ enrollment/allowlist/flagsและrestart API/worker |
| HTTPS/ROLE/WORKER | PASSจากรอบก่อน — 24fixture/HTTPS checks,21rolechecks,16runtime/mockqueuechecks และ providerstop/start; ไม่ใช้แทนUATจริง |
| RESUME_SECURITY | PASS — runtime schema/TLS/leastprivilege, คงOWNER/TECHทั้งคู่, allowlists/API-workerflags/commitตรงกัน, sweepก่อนresumeสำเร็จ (overdue0), HTTPShealth200 |
| OWNER_LINE_JOBS | UAT_PASSED — Ownerเห็นPILOT LINE A/Bตามภาพบนโทรศัพท์ |
| TECH_LINE_LINK | PASS — Ownerรายงานและruntimeยืนยันuser/employeeactive บัญชีเชื่อมอยู่ในallowlist |
| TECH_PILOT_ASSIGNMENT | PASSด้านApplication/domain — เดิมไม่มีPilot assignmentจึงไม่เห็นงาน; เพิ่มเฉพาะAผ่านApplication มีASSIGNEDauditหนึ่งครั้ง เห็นAไม่เห็นB งานเดิมนอกPilotไม่เปลี่ยน; รอคำขอใหม่บนโทรศัพท์ |
| ADMIN_ENROLLMENT | PASS — รับรหัสส่วนตัวช่อง1 บันทึกexactIDลงRailway ปิดenrollmentแล้ว ไม่ต้องสมัครOwner/TECH/กลุ่มซ้ำ |
| ADMIN_ACCOUNT_LINK / ADMIN_LINE_UAT | DEFERRED_BY_OWNER — พักตามคำสั่งล่าสุด ไม่ถือPASS ไม่ถอดallowlist/แก้role |
| GROUP / REVOKE / EXPIRY | WAITING_USER / NOT_RUN — ใช้Ownerผูกกลุ่มตามสิทธิ์เดิม สร้างคำสั่งบนหน้าAแล้ว; ยังรอส่งจริง ส่วนrevoke/expiry/replayยังไม่ครบ |
| OWNER_UAT_ALL_M1 | PARTIAL — Web/Job/mobile/OwnerLINEผ่านตามหลักฐาน ยังไม่รับM1ทั้งหมด |
| BACKUP/RESTORE | PASSแบบmanualencrypted/isolatedrecoveryรอบก่อน; เพิ่มNativeCI restore-login/scope regression รอตรวจ; scheduledbackup/PITR/StagingBrowserRestoreLoginยังไม่ครบ |
| ERP/ACCOUNTING_CONNECTORS | DESIGNED / NOT_CODED ตามD-032/ADR-013 |
| MERGE / M2 / M3 / PRODUCTION | NOT_AUTHORIZED — ไม่ดำเนินการ |

## สิ่งที่ Owner / ผู้ทดลองทำต่อ

1. **Owner:** ส่งคำสั่ง “ผูกโครงการ …” ที่สร้างไว้บนหน้าPILOT LINE A จากLINEOwnerไปกลุ่มทดสอบเดิมภายใน10นาที ไม่ส่งรหัสในแชทนี้. ใช้OwnerแทนAdminได้ตามสิทธิ์เดิม ไม่ต้องให้Adminเชื่อมตอนนี้
2. **TECH:** ส่ง **งานของฉัน** อีกครั้ง คาดเห็นเฉพาะ **PRJ-2609-014 — PILOT LINE A - no Site or Job**; ไม่เห็นBและโครงการจริงอื่นผ่านLINEในรอบจำกัดนี้
3. แจ้งผลโดยไม่ส่งรหัสผ่าน/ลิงก์/รหัส จากนั้นตรวจผูกกลุ่มและถอนassignmentสมมติตาม [แผนรอบ2](M1_LINE_PILOT_ROUND_2.md). สร้างรหัสของAไว้แล้วในรอบนี้ ถ้าหมดอายุให้สร้างใหม่ผ่านหน้าOwner ไม่ใช้รหัสเดิม

Ownerไม่ต้องเชื่อมบัญชีใหม่. ลิงก์เชื่อมบัญชีหมดอายุหรือrefreshจนtokenหายให้ส่งเชื่อมบัญชีใหม่ ไม่ใช้รหัสลงทะเบียนเก่า

[Web Staging](https://web-staging-cb6f.up.railway.app/) · [Owner Setup](M1_LINE_OWNER_SETUP.md)

## ข้อจำกัดและการหยุดทดลอง

- รหัสลงทะเบียนรอบเสริมถูกใช้และปิดโหมดแล้ว หน้าลงทะเบียนไม่ใช้เป็นหน้าขอlinkToken; ระบบส่งลิงก์เชื่อมให้เมื่อผู้ทดลองพิมพ์คำสั่งส่วนตัว
- sharedproxy ratebucketรวมผู้ใช้ เหมาะเฉพาะpilot3คน; perclient/scaleยังไม่รับรอง Global120/minพิสูจน์local/CI ไม่ยิงloadเพิ่มบนStaging
- EdgeHTTPlogรอบก่อน0แถว จึงยังไม่รับรองobservabilityทุกชั้น; tokenใหม่ใช้fragment/clientล้าง/no-referrer ไม่เก็บquery/bodyในapplicationlog
- queuepayloadTTL24ชั่วโมงตามD-033; สำเร็จล้างทันที หมดอายุไม่ถูกclaimและworkerกวาดทุกloop/startup เก็บstatus/audit. หากprovider/workerdown การล้างphysicalรอstartup ต้องตรวจoverdueก่อนresume ไม่อ้างการล้างตรงเวลาขณะoutage
- workerrestartPolicy=NEVER ต้องตรวจเมื่อไม่มีreply และหยุดpilotหากworker/cleanupผิดปกติ หลังจบรอบปิดAPI/workerพร้อมตรวจdeploymentStopped; ปิดAPIอย่างเดียวไม่ถือว่าหยุดworker
- Trialล่าสุดประมาณUSD4.7314/28วัน ไม่อัปเกรดหรือเพิ่มบริการ หากไม่พอหยุดรายงานOwner
- ไม่ลบ/แก้งานจริงเดิม; มีเฉพาะassignmentในProjectสมมติที่อนุมัติและoperatorสมมติซึ่งปิดแล้ว. ไม่เก็บชื่อบัญชี/LINEIDs/SecretในRepository

## หลักฐาน

[CI36105399785](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36105399785) · [Test Evidence](M1_TEST_EVIDENCE.md) · [Readiness](M1_LINE_PILOT_READINESS.md) · [D-034](DECISION_LOG.md)

M1อยู่ใน.local/m1-staging; rootM2พักไว้ อัปเดตเฉพาะpointerไม่รวมM2source/schema
