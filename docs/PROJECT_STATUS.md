# PROJECT STATUS — Milestone 1

## 25 กันยายน 2026 — TECH เชื่อมแล้ว / รับ Admin ใหม่

ตรวจ TECH ผู้ทดลอง: user/employee active, LINEเชื่อมและอยู่allowlist แต่ไม่มีassignmentในProjectPilot จึงไม่แสดงโครงการ; งานเดิมนอกPilotไม่ถูกเปิดผ่านLINE. มอบหมายเฉพาะPILOT LINE A PRJ-2609-014 ผ่านdeployedApplication/app.injectด้วยoperatorสมมติแล้ว: domain projectionเห็นAไม่เห็นB, ASSIGNED auditหนึ่งครั้ง, assignmentนอกPilotไม่เปลี่ยน. ปิดoperator/sessionหลังตรวจ ไม่บันทึกชื่อบัญชีหรือLINE IDในเอกสาร. ผลคำขอใหม่บนโทรศัพท์ยังWAITING_USER

Ownerขอรับ LINE Admin ใหม่ตามD-034. Worker flag=false และ deployment a4e694c8-9ba8-412b-a7cc-2cc8b592c1e7 หยุดจริง deploymentStopped=true ก่อนเปิดenrollment. Auto-reviewปฏิเสธการเปิดAPI enrollmentก่อนหยุดworker จึงแก้ลำดับตามrunbookโดยไม่ข้ามการปฏิเสธ. API enrollment deployment50de5f09-83d8-44af-8d12-278ee9d29447 SUCCESS releaseเดิม dc289ee. runtimeตรวจLINE=false/enrollment=true, OWNER1/TECH1คงอยู่, ช่องยังไม่เชื่อม1, inbox/outboxคิวรอ0, schema/TLS/privilegeและHTTPShealth200ผ่าน. OwnerLoginแล้ว ออกรหัสบนหน้าเว็บเวลา14:16อายุ15นาที ใช้เฉพาะช่องส่วนตัว1; ยังรอAdminส่ง ไม่เก็บcode/IDในเอกสาร. ไม่มีapp/schema change; TrialUSD4.7314/28วัน ไม่Merge/Production/RichMenu

อัปเดต 25 กันยายน 2026 · Module owner: Codex (Foundation/API/LINE/เอกสาร) · branch codex/milestone-1-foundation · PR #2 ยัง Draft / ไม่ Merge

## ตอนนี้ถึงไหน

**พักคำสั่ง LINE ชั่วคราวเพื่อรับบัญชี Admin ใหม่ — Owner/TECH เชื่อมแล้ว** ผู้ทดลอง3คน/กลุ่ม1กลุ่มจากenrollmentเดิมถูกบันทึกในRailwayแล้ว ไม่ต้องลงทะเบียนซ้ำ

สถานะขณะรับ Admin: API LINE_ENABLED=false / LINE_ENROLLMENT_ENABLED=true; worker LINE_ENABLED=false และหยุด deployment แล้ว. เมื่อปิด enrollment และตรวจขอบเขตครบจึงเปิดกลับ; จำกัดLINEเฉพาะ2Projectสมมติที่สร้างรอบนี้: **PILOT LINE A - no Site or Job**, **PILOT LINE B - Site and Job**. สิทธิ์ปกติยังบังคับร่วมกับallowlist จึงไม่เปิดโครงการจริงแม้OWNER

Web/API/worker exact **dc289ee3088cd84639cc828b49a6f5c50a665f55** ไม่มีmigration. Web d3bca251-a686-402e-a0d8-0e5dd2cddbb9; API 50de5f09-83d8-44af-8d12-278ee9d29447 SUCCESS; worker a4e694c8-9ba8-412b-a7cc-2cc8b592c1e7 หยุดแล้ว (deploymentStopped=true). API/workerไม่มีpublicdomain; WebHTTPSเป็นทางเข้า

## สถานะตาม Definition of Done

| รายการ | ผลและหลักฐาน |
| --- | --- |
| CODED | PASS — M1เดิม + D-033 fragmentlink,24hqueuepayloadexpiry,workerDBTLS/leastprivilege |
| TESTED_LOCAL | PASS — รอบล่าสุด 50PASS/2nativeSKIP รวม group isolation/queued creator revocation; typecheck และ M0เอกสาร45checks; application build เดิมไม่เปลี่ยน |
| TESTED_CI | PASS — CI36105399785 commit07dab28: NativePostgreSQL52/52, typecheck/build/API+Webcontainers/smoke/M0; ไม่มี app/schema change หรือ Deploy ใหม่ |
| DEPLOYED_STAGING | PASS — API/Web/worker exactdc289ee; ไม่มีmigrationหรือserviceใหม่ |
| HTTPS/PILOT_FIXTURES | PASS — 24checks: injectสร้างAไม่มีSiteJob/BมีSiteJob, publichealth200/HTTPredirect และ11loginrequestsได้401x10/429พร้อมRetry-Afterแม้ปลอมforwardedheader |
| HTTPS_THREE_ROLES | PASS — 21checksกับOwner/Admin/TECHสมมติ: Login/Secure,HttpOnly,SameSitecookie/CSRF/logout; ปิดบัญชีทดสอบแล้ว |
| WORKER_RUNTIME | PASS — 16checks runtimePG: TLS/privilege/schema, childworkerSIGTERMคืนexit0/ปิดDB, mockretry/expiredlease/DEAD/24hretention/idempotency; ไม่ส่งLINEจริงจากtestนี้ |
| WORKER_PROVIDER_STOP_START | PASS — deployment eae38278-99b3-48d0-9edf-80fe6b35517f เปิดสำเร็จ แล้วdeploymentStopped=true; deployใหม่ a4e694c8... SUCCESS |
| LINK_PRIVACY | PASSตามขอบเขต — ใช้fragmentไม่ใส่tokenในHTTPquery; browserอ่านแล้วล้างhash/queryจริง ไม่เก็บในstorage; deploymentlogsampleไม่พบsecretpatterns. EdgeHTTPlogรอบนี้ได้0แถวจึงไม่รับรองedgeทุกชั้น |
| REAL_WEBHOOK_VERIFY | PASS — officialLINEtest success=true/statusCode200หลังAPIเปิดbusinessmode |
| LINE_ENROLLMENT_REAL | PASSจากรอบก่อน — 3users/1groupครบและpersistแล้ว ปิดenrollmentขณะใช้งาน |
| OWNER_LINE_JOBS | UAT_PASSED — Owner แจ้งพร้อมภาพบนโทรศัพท์ว่า “งานของฉัน” แสดง PILOT LINE A/B ถูกต้อง |
| REAL_LINE_LINK/GROUP/REVOKE | PARTIAL / NOT_RUN — เรียกงานได้แล้ว แต่หลักฐานนี้ไม่แทนการตรวจ link ทุกขั้น; Admin/TECH, group binding, revoke และ expiry/replay ยังรอทดสอบจริง |
| OWNER_UAT_ALL_M1 | PARTIAL — Web/Job/mobile/enrollmentรอบก่อนผ่านตามหลักฐาน ยังไม่รับM1ทั้งหมด |
| BACKUP/RESTORE | PASSแบบmanualencrypted/isolatedrecoveryรอบก่อน; scheduledbackup/PITR/restoreWebLoginยังไม่ผ่าน |
| ERP/ACCOUNTING_CONNECTORS | DESIGNED / NOT_CODED ตามD-032/ADR-013; ไม่เกี่ยวกับการเปิดLINEรอบนี้ |
| MERGE / M2 / M3 / PRODUCTION | NOT_AUTHORIZED — ไม่ดำเนินการ |

Owner ยืนยันผลบนโทรศัพท์วันที่25กันยายน: “งานของฉัน” แสดง PILOT LINE A/B แล้ว (Owner-reported). Aggregate runtime ในหลักฐานก่อนหน้าเป็นค่าก่อน Owner ทดลอง ไม่ใช่สถานะปัจจุบัน

## สิ่งที่ Owner ทำต่อ

ขณะนี้ให้ส่งเฉพาะคำสั่งลงทะเบียนช่อง1จาก LINE Admin ใหม่ตามหน้าเว็บ แล้วแจ้งว่าส่งแล้ว. Owner/TECH ไม่ต้องลงทะเบียนซ้ำ เมื่อ Codex เปิดโหมดใช้งานกลับ ให้ TECH เรียกงานใหม่ต้องเห็น A เท่านั้น และ Admin ส่งเชื่อมบัญชีเพื่อLoginบัญชีAdminของตน. Group/revoke/expiry ยังไม่ครบ ไม่ถือว่ารับ M1 ทั้งหมด

**Rich Menu: DEFERRED ตามคำสั่ง Owner** — รอส่วน LINE ของ Milestone ครบก่อนทำเมนู ใช้คำสั่งข้อความทดสอบต่อ ไม่มีการสร้างหรือเปลี่ยน Rich Menu

25 กันยายน 2026 — ตรวจฐาน Staging แบบอ่านอย่างเดียว: runtime schema/TLS/least privilege ผ่าน; release dc289ee คงเดิม, LINE เปิดแบบจำกัดขอบเขตและ enrollment ปิด. พบ OWNER เชื่อมหนึ่งบัญชี; Admin/TECH ยังไม่เชื่อม, กลุ่มยังไม่ผูก. Inbox DONE5 / outbox SENT3 และ DEAD1 เดิมจาก mock drill; ไม่มีคิว pending/retry และ overdue payload=0. Trial ยังใช้งานได้ เหลือประมาณ USD4.7334/28วัน ไม่เพิ่มบริการหรือเปลี่ยนแผน

ดู [แผนรอบ Admin/TECH/กลุ่ม](M1_LINE_PILOT_ROUND_2.md). ส่งคำขอให้ Admin/TECH เชื่อมจาก LINE ของตนแล้ว; ระหว่างรอเพิ่ม regression กลุ่มไม่ให้สิทธิ์และบัญชีที่ถูกปิดระหว่างรอคิว ผล Local/CI แยกในหลักฐาน ไม่แทน real UAT

[Web Staging](https://web-staging-cb6f.up.railway.app/) · [Owner Setup](M1_LINE_OWNER_SETUP.md)

## ข้อจำกัดและการหยุดทดลอง

- sharedproxy ratebucketยังรวมผู้ใช้ เหมาะเฉพาะpilot3คน; perclient/scaleยังไม่รับรอง Global120/minพิสูจน์local/CIเท่านั้น ไม่ยิงloadเพิ่มบนStaging
- OwnerอนุมัติqueuepayloadTTL24hตามD-033; สำเร็จล้างทันที หมดอายุไม่ถูกclaimและworkerล้างทุกloop เก็บstatus/audit. หากprovider/workerdown การล้างphysicalรอstartup ต้องตรวจoverduecountก่อนresume ไม่อ้างphysicaldeletionตรงเวลาในช่วงoutage
- EdgeHTTPquerylogรอบนี้ไม่แสดงแถว จึงคงข้อจำกัดobservability; tokenใหม่ไม่อยู่ในCoreAppquery และไม่มีrequestbodyloggingในแอป ห้ามแนบHAR/rawlog/secret
- workerrestartPolicy=NEVERเพื่อไม่วนrestartไม่จำกัด; ต้องตรวจสถานะเมื่อไม่มีreplyและหยุดpilotหากworkerหรือcleanupผิดปกติ หลังจบรอบให้ปิดAPI/workerและยืนยันdeploymentStopped ไม่ใช้การปิดAPIแทนหยุดworker
- Trialล่าสุดยังtrue เหลือประมาณUSD4.7334/28วัน ณ รอบตรวจนี้ ไม่มีupgrade/บริการใหม่ หากไม่พอหยุดแจ้งOwner
- ไม่เปลี่ยนข้อมูลจริง มีเฉพาะfixtureบัญชีสมมติที่ปิดแล้ว, ProjectA/Bใหม่และqueueสมมติที่ล้างpayloadแล้ว การเชื่อมบัญชีผู้ทดลองจริงเป็นขั้นที่Ownerอนุมัติแยกจากfixtures

## หลักฐาน

[CI รอบล่าสุด36105399785](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36105399785) · [Test Evidence](M1_TEST_EVIDENCE.md) · [Readiness](M1_LINE_PILOT_READINESS.md) · [Test Matrix](M1_STAGING_TEST_MATRIX.md) · [D-033](DECISION_LOG.md)

M1อยู่ใน.local/m1-staging; rootM2ยังพักไว้ อัปเดตเฉพาะpointerไม่รวมM2source/schema
