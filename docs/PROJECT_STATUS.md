# PROJECT STATUS — Milestone 1

## 25 กันยายน 2026 — ส่งรหัสก่อนหมดอายุ ยังไม่ผ่าน R2-07

Owner แจ้งส่งแล้ว แต่ตรวจ database clock เวลา 2026-09-25T14:32:48.363Z พบรหัส B ล่าสุด expires_at 14:40:07.715Z และ expired=false. จึงไม่ถือเป็น expiry UAT และคง R2-07 WAITING_USER จนส่งคำสั่งเดิมหลัง 21:41 เวลาไทย ไม่ต้องสร้างรหัสใหม่

กลุ่มยังผูก A รายการเดียว LINE_GROUP_BOUND audit คง 1. Query แรกเทียบ timestamp จากค่าที่แสดงระดับ millisecond ไม่พบแถว; follow-up อ่านเฉพาะ expiry ล่าสุดยืนยันแถวยังอยู่และยังไม่หมดอายุ ไม่ตีความว่า code ถูกใช้หรือลบจาก query แรก. ไม่อ่านรหัส/payload หรือเปลี่ยนข้อมูล. ตรวจเอกสาร 45 checks และ diff check ผ่าน ไม่มี Deploy/Merge


## 25 กันยายน 2026 — เตรียมรหัสใหม่เพื่อทดสอบหมดอายุ R2-07

สร้างรหัสผูกกลุ่มของ PILOT LINE B ผ่านหน้า Web ใน session OWNER ที่เชื่อม LINE แล้วสำเร็จ; รหัสแสดงเฉพาะหน้าเว็บ ไม่คัดลอกลง Git/Chat/Log. เวลาหมดอายุจากฐานคือ 2026-09-25T14:40:07.715Z (21:40:07 เวลาไทย) ไม่ปรับเวลา/expiry ในฐาน

Baseline: กลุ่มที่อนุมัติยังผูก A เพียงรายการเดียว และ LINE_GROUP_BOUND audit ของ A/B รวม 1 ครั้ง. ให้ Owner ผู้สร้างส่งคำสั่งบนหน้าเว็บไปกลุ่มเดิมหลัง 21:41 เวลาไทย โดยไม่กดสร้างรหัสใหม่. R2-07 = PREPARED / WAITING_USER ไม่ใช่ PASS; หลังส่งต้องตรวจ expired row และ mapping/audit อีกครั้ง

ข้อจำกัดการพิสูจน์: กลุ่มเดิมผูก A อยู่และระบบป้องกันเขียนทับด้วย จึงใช้ผลไม่มีการเปลี่ยน binding เพียงอย่างเดียวพิสูจน์ expiry ไม่ได้ ต้องแยกหลักฐานเวลา/สถานะออกจากผลตอบทั่วไป และอ้าง automated expiry test แยก ไม่ลบ binding หรือเพิ่มกลุ่มเพื่อทดสอบ

ไม่มี code/schema/deployment เปลี่ยน ไม่ Merge/M2/Production/เพิ่มบริการ. ตรวจเอกสาร 45 checks และ diff check ผ่าน


## 25 กันยายน 2026 — ส่งคำสั่งผูกกลุ่มเดิมซ้ำ ไม่เกิดการผูกเพิ่ม

Owner ส่งภาพคำสั่งเดิมซ้ำสองครั้งในกลุ่มทดสอบ ระบบตอบให้เปิดแชทส่วนตัวทั้งสองครั้ง. ไม่คัดลอกรหัสหรือภาพที่มีรหัสลง Repository. ตรวจแบบอ่านอย่างเดียวก่อนเวลา 14:10:07Z และหลังเวลา 14:23:30Z: approved group 1, binding 1 ชี้ PILOT LINE A เหมือนเดิม, LINE_GROUP_BOUND audit คง 1 ครั้ง

R2-05 ผลเชิงพฤติกรรม = PASS: ส่งคำสั่งเดิมซ้ำไม่เปลี่ยน binding และไม่เพิ่ม audit การผูกสำเร็จ. ข้อจำกัด: รหัสเดิมออกก่อนหน้านี้เกินอายุ 10 นาทีแล้ว จึงไม่แยกพิสูจน์กลไกใช้ครั้งเดียวออกจากหมดอายุในรอบจริงนี้; การแยกกรณีใช้ครั้งเดียวมีหลักฐาน automated tests เดิม. R2-07 การทดลองรหัสใหม่ที่ไม่เคยใช้แล้วปล่อยหมดอายุยัง NOT_RUN ไม่ถือว่าผ่านจากภาพนี้

ไม่มีข้อมูล/code/schema/deployment เปลี่ยน ไม่ Merge หรือรับ M1 ทั้งหมด. ตรวจเอกสาร 45 checks และ diff check ผ่าน


## 25 กันยายน 2026 — Owner ยืนยัน LINE เห็นเฉพาะ B ถูกต้อง

Owner ยืนยันผลคำขอใหม่ “งานของฉัน” หลังมอบหมาย Job B ว่าถูกต้องตามผลที่คาด: เห็นเฉพาะ PILOT LINE B. R2-06 ถอน A / เพิ่ม Job B = UAT_PASSED สำหรับผลโครงการใน LINE จากรายงาน Owner ร่วมกับ backend/audit ที่ตรวจไว้ ไม่ใช่การตรวจภาพโทรศัพท์โดยระบบ

ผลย่อย: ถอน A แล้วไม่พบโครงการ PASS; มอบหมาย Job B แล้วเห็นเฉพาะ B ไม่เห็น A PASS; scope ของ assignment และ ASSIGNED audit PASS; assignment นอก Pilot ไม่เปลี่ยน. ยังไม่อ้างว่าหน้ารายละเอียด Job บน Web ผ่าน UAT จากคำยืนยันนี้

ไม่ต้องส่ง “งานของฉัน” ซ้ำสำหรับขั้นนี้. งานที่ยังเหลือ: R2-05 replay, R2-07 expiry บน LINE จริง และ Staging browser restore / backup gates. ยังไม่รับ M1 ทั้งหมดหรือ Merge PR #2. ไม่มีการเปลี่ยนข้อมูล/code/schema/deploy ในรอบบันทึกผลนี้; ตรวจเอกสาร 45 checks และ diff check ผ่าน


## 25 กันยายน 2026 — มอบหมาย Job B หลังถอน A

Owner อนุญาตทดสอบต่อ หลังยืนยันคำขอ LINE หลังถอน A ไม่พบโครงการแล้ว. มอบหมายเฉพาะ Job สมมติใน PILOT LINE B (PRJ-2609-015) ให้ TECH ผู้ทดลองผ่าน deployed Application สำเร็จ ไม่เพิ่ม assignment ระดับ Project. ตรวจ project/job scope ตรงกัน, domain projection เห็นเฉพาะ B ไม่เห็น A, ASSIGNED audit 1 ครั้ง และ assignment นอก Pilot ไม่เปลี่ยน. ปิด operator สมมติและหมดอายุ session หลังตรวจ เก็บ audit ไว้

**R2-06 Job B: backend PASS / phone WAITING_USER.** ให้ TECH ส่ง “งานของฉัน” ใหม่ ควรเห็นเฉพาะ PILOT LINE B. ผลนี้ยังไม่แทนการตรวจหน้ารายละเอียด Job บน Web หรือการตอบจริงบนโทรศัพท์. ไม่ต้องลงทะเบียน LINE ใหม่. ขั้นถอน A บนโทรศัพท์ UAT_PASSED แล้ว; replay/expiry และ Staging browser restore ยังไม่ครบ

ไม่มี code/schema/deploy/merge/บริการเพิ่ม. Release เดิม dc289ee; CI เดิม 36109173357 Native PostgreSQL 52/52 PASS. รอบนี้ตรวจเอกสาร 45 checks และ git diff --check ผ่าน ไม่รัน application tests ซ้ำ


## 25 กันยายน 2026 — ยืนยันผลถอนสิทธิ์บน LINE

Owner รายงานคำตอบใหม่ว่า “ไม่มีโครงการที่รับมอบหมาย” หลังถอน assignment สมมติ A. R2-06 REVOKE = UAT_PASSED จากรายงานบนโทรศัพท์ร่วมกับหลักฐาน backend รอบก่อน: visible Pilot projects 0, assignment นอก Pilot ไม่เปลี่ยน และมี ASSIGNMENT_REVOKED audit. ไม่ได้ตรวจภาพโทรศัพท์โดยตรง

ขั้นต่อไปคือมอบหมาย Job ใน Project B ให้ TECH แล้วตรวจคำขอใหม่เห็นเฉพาะ B; ยังไม่ได้มอบหมายในรอบบันทึกนี้. Replay/expiry และ Staging browser restore ยังไม่ครบ ไม่ถือ M1 accepted. ไม่มีการเปลี่ยน code/schema/deployment/ข้อมูลในรอบนี้


## 25 กันยายน 2026 — Admin/TECH เห็นงานแล้ว และเริ่มตรวจถอนสิทธิ์

Owner ยืนยัน TECH เห็นงานและ ADMIN เห็น A/B; runtime ตรวจบัญชี active/เชื่อม LINE/อยู่ใน allowlist ตรงกัน โดย TECH เห็นเฉพาะ PRJ-2609-014 และ ADMIN เห็น PRJ-2609-014/015 ก่อนถอนสิทธิ์. ADMIN_ACCOUNT_LINK / ADMIN_LINE_JOBS และ TECH_LINE_JOBS ก่อนถอน = UAT_PASSED จากรายงาน Owner ร่วมกับ runtime ไม่ใช่ภาพโทรศัพท์ที่ระบบตรวจเอง. A/B เป็น Project ทดสอบ ไม่ใช่ Job สองรายการ. สถานะนี้แทนการพัก Admin ก่อนหน้า

R2-06 ถอนเฉพาะ assignment ระดับ Project ของ TECH ใน PILOT LINE A ผ่าน deployed Application แล้ว: backend PASS, เหลือ Pilot project ที่มองเห็น 0, assignment นอก Pilot ไม่เปลี่ยน, audit ASSIGNED 1 / ASSIGNMENT_REVOKED 1. ปิด operator สมมติและ session หลังตรวจ เก็บ audit ไว้ ไม่แก้ข้อมูลจริง ไม่เก็บชื่อบัญชีหรือรหัสลับในเอกสาร

**ขั้นต่อไป:** ให้ TECH ส่ง “งานของฉัน” ใหม่ ต้องไม่แสดงโครงการที่ได้รับมอบหมายใน Pilot; ข้อความเก่าในแชทไม่ถูกลบ. ผลหลังถอนบนโทรศัพท์ = WAITING_USER. ยังไม่มอบหมาย Job B จนตรวจขั้นนี้ผ่าน. ADMIN ยังคงเห็น A/B. Replay/expiry และ Staging browser restore ยังไม่ผ่านครบ จึงยังไม่รับ M1 ทั้งหมด

ไม่มี code/schema/deploy/merge หรือค่าใช้จ่ายเพิ่ม. CI เดิม 36109173357: Native PostgreSQL 52/52 PASS; รอบนี้ตรวจเอกสารและ diff เท่านั้น

## ประวัติก่อนผลล่าสุด (ไม่ใช่คำสั่งปัจจุบัน)

## 25 กันยายน 2026 — ผูกกลุ่มกับ PILOT LINE A สำเร็จ

Ownerแจ้งส่งคำสั่งใหม่แล้ว; ตรวจฐานแบบอ่านอย่างเดียวพบกลุ่มที่อนุมัติผูกกับ PRJ-2609-014 (PILOT LINE A) และ LINE_GROUP_BOUND audit1ครั้ง: REAL_GROUP_BINDING = PASS ด้านmapping/audit. inboxDONE17/outboxSENT13/DEAD1เดิมจากmockdrill ไม่มีpending/retry. จำนวนSENTเป็นaggregate ไม่แทนการยืนยันอ่านข้อความเฉพาะรายการบนโทรศัพท์. ไม่เก็บgroup/userIDหรือรหัสในGit/Chat

ยังไม่ถือว่าreplay/expiry/revokeหรือM1รวมผ่าน. LINE AdminพักตามOwner. ขั้นต่อไปยืนยันTECHเรียกงานใหม่เห็นเฉพาะAก่อนทดสอบถอนassignmentสมมติ ไม่เปลี่ยนassignmentในรอบตรวจนี้ ไม่มีcode/schema/Deploy/Merge

## 25 กันยายน 2026 — ออกรหัสผูกกลุ่มใหม่ตาม Owner

Ownerขอรหัสใหม่ เปิดPILOT LINE AในsessionOwnerและกดสร้างรหัสผ่านWebสำเร็จ หน้าแสดงคำสั่งใหม่อายุ10นาที. รหัสอยู่เฉพาะหน้าเว็บ ไม่คัดลอกลงGit/Chat. ยังรอOwnerส่งจากLINEที่เชื่อมไปกลุ่มทดสอบเดิม ไม่ถือgroupbindingผ่านจากการออกรหัส ไม่มีการเปลี่ยนallowlist/role/schema/deployment

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
| TESTED_CI | PASS — CI36109173357 commit8ea5ed9: NativePostgreSQL52/52 รวมrestore-login/scope/sessionเดิมใช้ไม่ได้, typecheck/build/API+Webcontainers/smoke/M0; ไม่ใช่ real LINE UAT |
| DEPLOYED_STAGING | PASS — exactdc289ee; รอบนี้เปลี่ยนเฉพาะ enrollment/allowlist/flagsและrestart API/worker |
| HTTPS/ROLE/WORKER | PASSจากรอบก่อน — 24fixture/HTTPS checks,21rolechecks,16runtime/mockqueuechecks และ providerstop/start; ไม่ใช้แทนUATจริง |
| RESUME_SECURITY | PASS — runtime schema/TLS/leastprivilege, คงOWNER/TECHทั้งคู่, allowlists/API-workerflags/commitตรงกัน, sweepก่อนresumeสำเร็จ (overdue0), HTTPShealth200 |
| OWNER_LINE_JOBS | UAT_PASSED — Ownerเห็นPILOT LINE A/Bตามภาพบนโทรศัพท์ |
| TECH_LINE_LINK | PASS — Ownerรายงานและruntimeยืนยันuser/employeeactive บัญชีเชื่อมอยู่ในallowlist |
| TECH_PILOT_ASSIGNMENT | PASSด้านApplication/domain — เดิมไม่มีPilot assignmentจึงไม่เห็นงาน; เพิ่มเฉพาะAผ่านApplication มีASSIGNEDauditหนึ่งครั้ง เห็นAไม่เห็นB งานเดิมนอกPilotไม่เปลี่ยน; รอคำขอใหม่บนโทรศัพท์ |
| ADMIN_ENROLLMENT | PASS — รับรหัสส่วนตัวช่อง1 บันทึกexactIDลงRailway ปิดenrollmentแล้ว ไม่ต้องสมัครOwner/TECH/กลุ่มซ้ำ |
| ADMIN_ACCOUNT_LINK / ADMIN_LINE_UAT | UAT_PASSED — Owner ยืนยันและ runtime ตรวจการเชื่อม/ขอบเขต A/B ตรงกัน |
| REAL_GROUP_BINDING | PASS — Ownerส่งคำสั่งแล้ว runtimeยืนยันกลุ่มที่อนุมัติชี้A และLINE_GROUP_BOUND audit1ครั้ง |
| REVOKE / EXPIRY / REPLAY | REVOKE backend PASS / phone WAITING_USER; EXPIRY / REPLAY NOT_RUN จริง |
| OWNER_UAT_ALL_M1 | PARTIAL — Web/Job/mobile/OwnerLINEผ่านตามหลักฐาน ยังไม่รับM1ทั้งหมด |
| BACKUP/RESTORE | PASSแบบmanualencrypted/isolatedrecoveryรอบก่อน; NativeCI restore-login/scope regression PASS; scheduledbackup/PITR/StagingBrowserRestoreLoginยังไม่ครบ |
| ERP/ACCOUNTING_CONNECTORS | DESIGNED / NOT_CODED ตามD-032/ADR-013 |
| MERGE / M2 / M3 / PRODUCTION | NOT_AUTHORIZED — ไม่ดำเนินการ |

## สิ่งที่ Owner / ผู้ทดลองทำต่อ

กลุ่มผูกAสำเร็จแล้ว ไม่ต้องส่งรหัสใหม่. ให้TECHส่ง **งานของฉัน** และยืนยันว่าเห็นเฉพาะ **PILOT LINE A** จากนั้นจึงทดสอบถอนA/มอบหมายJob Bตามแผนรอบ2โดยแตะเฉพาะassignmentสมมติ. LINEAdminพักตามOwner ไม่ต้องเชื่อมตอนนี้

[Web Staging](https://web-staging-cb6f.up.railway.app/) · [แผนรอบ2](M1_LINE_PILOT_ROUND_2.md)

## ข้อจำกัดและการหยุดทดลอง

- รหัสลงทะเบียนรอบเสริมถูกใช้และปิดโหมดแล้ว หน้าลงทะเบียนไม่ใช้เป็นหน้าขอlinkToken; ระบบส่งลิงก์เชื่อมให้เมื่อผู้ทดลองพิมพ์คำสั่งส่วนตัว
- sharedproxy ratebucketรวมผู้ใช้ เหมาะเฉพาะpilot3คน; perclient/scaleยังไม่รับรอง Global120/minพิสูจน์local/CI ไม่ยิงloadเพิ่มบนStaging
- EdgeHTTPlogรอบก่อน0แถว จึงยังไม่รับรองobservabilityทุกชั้น; tokenใหม่ใช้fragment/clientล้าง/no-referrer ไม่เก็บquery/bodyในapplicationlog
- queuepayloadTTL24ชั่วโมงตามD-033; สำเร็จล้างทันที หมดอายุไม่ถูกclaimและworkerกวาดทุกloop/startup เก็บstatus/audit. หากprovider/workerdown การล้างphysicalรอstartup ต้องตรวจoverdueก่อนresume ไม่อ้างการล้างตรงเวลาขณะoutage
- workerrestartPolicy=NEVER ต้องตรวจเมื่อไม่มีreply และหยุดpilotหากworker/cleanupผิดปกติ หลังจบรอบปิดAPI/workerพร้อมตรวจdeploymentStopped; ปิดAPIอย่างเดียวไม่ถือว่าหยุดworker
- Trialล่าสุดประมาณUSD4.7314/28วัน ไม่อัปเกรดหรือเพิ่มบริการ หากไม่พอหยุดรายงานOwner
- ไม่ลบ/แก้งานจริงเดิม; มีเฉพาะassignmentในProjectสมมติที่อนุมัติและoperatorสมมติซึ่งปิดแล้ว. ไม่เก็บชื่อบัญชี/LINEIDs/SecretในRepository

## หลักฐาน

[CI36109173357](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36109173357) · [Test Evidence](M1_TEST_EVIDENCE.md) · [Readiness](M1_LINE_PILOT_READINESS.md) · [D-034](DECISION_LOG.md)

M1อยู่ใน.local/m1-staging; rootM2พักไว้ อัปเดตเฉพาะpointerไม่รวมM2source/schema
