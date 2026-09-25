# PROJECT STATUS — Milestone 1

อัปเดต 25 กันยายน 2026 · Module owner: Codex (Foundation/API/LINE/เอกสาร) · branch codex/milestone-1-foundation · PR #2 ยัง Draft / ไม่ Merge

## ตอนนี้ถึงไหน

**เปิด bounded LINE Pilot แล้ว — รอ Owner เชื่อมบัญชีจริงและเรียกงานของฉัน** ผู้ทดลอง3คน/กลุ่ม1กลุ่มจากenrollmentเดิมถูกบันทึกในRailwayแล้ว ไม่ต้องลงทะเบียนซ้ำ

API/worker LINE_ENABLED=true, LINE_ENROLLMENT_ENABLED=false; จำกัดLINEเฉพาะ2Projectสมมติที่สร้างรอบนี้: **PILOT LINE A - no Site or Job**, **PILOT LINE B - Site and Job**. สิทธิ์ปกติยังบังคับร่วมกับallowlist จึงไม่เปิดโครงการจริงแม้OWNER

Web/API/worker exact **dc289ee3088cd84639cc828b49a6f5c50a665f55** ไม่มีmigration. Web d3bca251-a686-402e-a0d8-0e5dd2cddbb9; API c4d8f20b-9524-4b59-bc15-3c86b0558737; worker a4e694c8-9ba8-412b-a7cc-2cc8b592c1e7 SUCCESS. API/workerไม่มีpublicdomain; WebHTTPSเป็นทางเข้า

## สถานะตาม Definition of Done

| รายการ | ผลและหลักฐาน |
| --- | --- |
| CODED | PASS — M1เดิม + D-033 fragmentlink,24hqueuepayloadexpiry,workerDBTLS/leastprivilege |
| TESTED_LOCAL | PASS — 48PASS/2nativeSKIP; targeted10/10; typecheck/build; M0เอกสาร45checks |
| TESTED_CI | PASS — CI36102233232 NativePostgreSQL50/50; typecheck/build/API+Webcontainers/smoke/M0 |
| DEPLOYED_STAGING | PASS — API/Web/worker exactdc289ee; ไม่มีmigrationหรือserviceใหม่ |
| HTTPS/PILOT_FIXTURES | PASS — 24checks: injectสร้างAไม่มีSiteJob/BมีSiteJob, publichealth200/HTTPredirect และ11loginrequestsได้401x10/429พร้อมRetry-Afterแม้ปลอมforwardedheader |
| HTTPS_THREE_ROLES | PASS — 21checksกับOwner/Admin/TECHสมมติ: Login/Secure,HttpOnly,SameSitecookie/CSRF/logout; ปิดบัญชีทดสอบแล้ว |
| WORKER_RUNTIME | PASS — 16checks runtimePG: TLS/privilege/schema, childworkerSIGTERMคืนexit0/ปิดDB, mockretry/expiredlease/DEAD/24hretention/idempotency; ไม่ส่งLINEจริงจากtestนี้ |
| WORKER_PROVIDER_STOP_START | PASS — deployment eae38278-99b3-48d0-9edf-80fe6b35517f เปิดสำเร็จ แล้วdeploymentStopped=true; deployใหม่ a4e694c8... SUCCESS |
| LINK_PRIVACY | PASSตามขอบเขต — ใช้fragmentไม่ใส่tokenในHTTPquery; browserอ่านแล้วล้างhash/queryจริง ไม่เก็บในstorage; deploymentlogsampleไม่พบsecretpatterns. EdgeHTTPlogรอบนี้ได้0แถวจึงไม่รับรองedgeทุกชั้น |
| REAL_WEBHOOK_VERIFY | PASS — officialLINEtest success=true/statusCode200หลังAPIเปิดbusinessmode |
| LINE_ENROLLMENT_REAL | PASSจากรอบก่อน — 3users/1groupครบและpersistแล้ว ปิดenrollmentขณะใช้งาน |
| REAL_LINE_LINK/JOBS/GROUP/REVOKE | WAITING_OWNER / NOT_RUN — ส่งขั้นตอนให้Ownerเริ่มเชื่อมและเรียกงานแล้ว ยังไม่อ้างว่าflowจริงผ่าน |
| OWNER_UAT_ALL_M1 | PARTIAL — Web/Job/mobile/enrollmentรอบก่อนผ่านตามหลักฐาน ยังไม่รับM1ทั้งหมด |
| BACKUP/RESTORE | PASSแบบmanualencrypted/isolatedrecoveryรอบก่อน; scheduledbackup/PITR/restoreWebLoginยังไม่ผ่าน |
| ERP/ACCOUNTING_CONNECTORS | DESIGNED / NOT_CODED ตามD-032/ADR-013; ไม่เกี่ยวกับการเปิดLINEรอบนี้ |
| MERGE / M2 / M3 / PRODUCTION | NOT_AUTHORIZED — ไม่ดำเนินการ |

ตรวจruntimeหลังเปิด: linkedRolesยังว่าง (ยังไม่เชื่อมสำเร็จ); inboxDONE2/outboxSENT1/DEAD1. DEAD1เป็นmockfixtureจากstop/retrydrillที่ล้างpayloadแล้ว ไม่ใช่livefailure; SENT1ยืนยันproviderรับreplyหนึ่งรายการ แต่ยังไม่ทราบคำสั่งหรือผลบนโทรศัพท์ จึงไม่อ้างLINK/JOBS UATผ่าน

## สิ่งที่ Owner ทำต่อ

1. ในแชทส่วนตัวกับ **@ASAS-WORK** ส่ง **เชื่อมบัญชี** แล้วเปิดลิงก์ตอบกลับ
2. Loginด้วยบัญชีOwnerของโอ๋ในหน้าWeb กด **ยืนยันเชื่อมบัญชี** และยืนยันในหน้าของLINEหากแสดง
3. กลับLINEส่ง **งานของฉัน** ต้องเห็นเฉพาะ2โครงการPILOT LINEข้างต้น แล้วแจ้งผลโดยไม่ส่งpassword/token/ลิงก์ที่มีรหัส

ทำOwnerก่อนหนึ่งบัญชี จากนั้นAdmin/TECHใช้บัญชีแอปของตนห้ามใช้Ownerร่วมกัน. TECHจะเห็นเฉพาะProjectสมมติที่มอบหมายให้ ไม่ใช่ทุกProjectในallowlist. ขั้นต่อไปCodexตรวจgroupbinding/revoke/expiryกับข้อมูลสมมติ ไม่ให้Ownerสลับบัญชีเพื่อทดสอบเทคนิคซ้ำ

ลิงก์ใช้ครั้งเดียว/อายุ10นาที ถ้าrefreshระหว่างเชื่อมจนรหัสในmemoryหายให้ส่ง **เชื่อมบัญชี** ใหม่ ไม่ใช้รหัสenrollmentเดิม. [Web Staging](https://web-staging-cb6f.up.railway.app/) · [Owner Setup](M1_LINE_OWNER_SETUP.md)

## ข้อจำกัดและการหยุดทดลอง

- sharedproxy ratebucketยังรวมผู้ใช้ เหมาะเฉพาะpilot3คน; perclient/scaleยังไม่รับรอง Global120/minพิสูจน์local/CIเท่านั้น ไม่ยิงloadเพิ่มบนStaging
- OwnerอนุมัติqueuepayloadTTL24hตามD-033; สำเร็จล้างทันที หมดอายุไม่ถูกclaimและworkerล้างทุกloop เก็บstatus/audit. หากprovider/workerdown การล้างphysicalรอstartup ต้องตรวจoverduecountก่อนresume ไม่อ้างphysicaldeletionตรงเวลาในช่วงoutage
- EdgeHTTPquerylogรอบนี้ไม่แสดงแถว จึงคงข้อจำกัดobservability; tokenใหม่ไม่อยู่ในCoreAppquery และไม่มีrequestbodyloggingในแอป ห้ามแนบHAR/rawlog/secret
- workerrestartPolicy=NEVERเพื่อไม่วนrestartไม่จำกัด; ต้องตรวจสถานะเมื่อไม่มีreplyและหยุดpilotหากworkerหรือcleanupผิดปกติ หลังจบรอบให้ปิดAPI/workerและยืนยันdeploymentStopped ไม่ใช้การปิดAPIแทนหยุดworker
- Trialล่าสุดยังtrue เหลือประมาณUSD4.7354/28วันก่อนเปิดbusinessmode ไม่มีupgrade/บริการใหม่ หากไม่พอหยุดแจ้งOwner
- ไม่เปลี่ยนข้อมูลจริง มีเฉพาะfixtureบัญชีสมมติที่ปิดแล้ว, ProjectA/Bใหม่และqueueสมมติที่ล้างpayloadแล้ว การเชื่อมบัญชีผู้ทดลองจริงเป็นขั้นที่Ownerอนุมัติแยกจากfixtures

## หลักฐาน

[CI36102233232](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36102233232) · [Test Evidence](M1_TEST_EVIDENCE.md) · [Readiness](M1_LINE_PILOT_READINESS.md) · [Test Matrix](M1_STAGING_TEST_MATRIX.md) · [D-033](DECISION_LOG.md)

M1อยู่ใน.local/m1-staging; rootM2ยังพักไว้ อัปเดตเฉพาะpointerไม่รวมM2source/schema
