# CHANGELOG

## 26 กันยายน 2026 — บันทึก Local browser recovery และแผน UAT รอบรวม

เพิ่ม `scripts/local-browser-recovery-drill.mjs` สำหรับฐานสมมติ/loopback และ `docs/M1_CONSOLIDATED_OWNER_UAT.md` เพื่อรวมขั้นที่ Owner ต้องทดลองเป็นรอบเดียว. Local browser ตรวจ Session เดิมหลัง Restore, Login ใหม่, TECH Job scope และ Logout ผ่าน; ดู [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md). Staging recovery ยัง NOT_RUN. ไม่มี app/schema/deployment change หรือการเปิด Daily Backup.

## 26 กันยายน 2026 — Owner เลื่อนการเปิด Daily Backup

Ownerสั่งยังไม่ตั้งDailyBackupตอนนี้ ให้ตั้งเมื่องานใกล้เสร็จ. สถานะ DAILY_BACKUP = DEFERRED_BY_OWNER / NOT_ENABLED ไม่ใช่PASSหรือการยกเลิกrequirement. ไม่เปิดschedule ไม่เพิ่มstorage/service/ค่าใช้จ่าย และไม่ขออนุมัติเปิดซ้ำระหว่างพัฒนา. เมื่อเตรียมปิดงานให้เสนอค่าใช้จ่าย/retention/สิทธิ์แล้วรอOwnerยืนยันเปิดจริง. ข้อกำหนดRestoreเฉพาะOWNERตามD-035ยังคงเดิม; ไม่อ้างว่าบังคับCLI/providerroleแล้ว

การเลื่อนนี้ไม่เลื่อนการทดสอบRestoreด้วยข้อมูลสมมติหรืออนุญาตให้Restoreทับข้อมูลจริง. งานM1อื่นทำต่อได้ตามscopeเดิม


## นโยบาย Backup ล่าสุด

26กันยายน — D-035 รับrequirementBackupทุกวัน/RestoreเฉพาะOWNERแล้ว. Dailybackupยังไม่เปิด: เสนอRailway24ชั่วโมงเก็บ6วัน มีstorageusageรอOwnerยืนยันใช้Trialcredit ไม่อัปเกรด/เสียเงินเพิ่ม. CoreApproleยังไม่บังคับoperatorCLIหรือproviderpermission; บันทึกแยกDESIGNED/NOT_DEPLOYED. ตรวจเอกสาร45checksและdiffcheck ไม่มีapp/schema/deploy


## 26 กันยายน 2026 — เพิ่มหลักฐาน Restore + Job isolation ผ่าน HTTP

เพิ่ม tests/job-restore-http.test.ts: ข้อมูลสมมติสองโครงการ/สองงานย่อย มอบหมาย TECH เพียงงานเดียว สำรอง/Restore/ปิดและเปิดฐานใหม่ แล้วทดสอบผ่าน HTTP loopback จริง: Sessionเดิม401, Loginใหม่200, เห็นโครงการเดียวและJobที่มอบหมายเท่านั้น, อีกโครงการ404, revokeมีผลโดยไม่Loginใหม่, logoutแล้ว401. Local targeted PASS และ typecheck PASS; Local regression 51PASS/2NativeSKIP/0FAIL ส่วน [CI36242156339](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36242156339) commit e9700b6: NativePostgreSQL53PASS/0SKIP/0FAIL, embedded51PASS/2NativeSKIP, typecheck/productionbuild/API+Webcontainer/smoke/เอกสาร PASS

ใช้ TEMP directory นอกGit/OneDrive และ TEST_DATABASE_URL เฉพาะฐาน CI ที่ทิ้งได้ ไม่อ่าน DATABASE_URL ของStaging. ไม่ใช่browser/HTTPS/provider recovery evidence. ไม่มีapp/schema/deployหรือข้อมูลStagingเปลี่ยน. Subagentเตรียม M1_BROWSER_RECOVERY_CHECKLIST.md แบบ PREPARED/NOT_RUN แยกlocal/Stagingชัดเจน

คำถามที่ฝากOwner: ผู้รับผิดชอบตรวจbackupประจำวัน ยังไม่เลือก/เปิดบริการเสียเงิน. ยังไม่Merge/M2/Production


## 26 กันยายน 2026 — ตรวจต่อหลัง usage limit / จัดสถานะ M1 ใหม่

Ownerแจ้งส่งคำสั่งซ้ำแล้วแต่รอบก่อน remote check ไม่ได้รันเพราะ approval usage limit. ครั้งนี้12:22:13Zตรวจได้: code B expiry25ก.ย.14:40:07.715Z expired=true, bindingยังAหนึ่งรายการ, auditรวมA/Bคง1. R2-07 PARTIAL ไม่อ้าง isolated expiry PASS เพราะไม่มีเวลาของeventนั้นและกลุ่มมีoverwrite guard. ไม่ขอให้Ownerทำคำสั่งเดิมซ้ำ

ตรวจqueueaggregate: inboxDONE33/outboxSENT28/DEAD1เดิม, overduepayload24h inbox0/outbox0 ไม่มีpending; ไม่อ่านpayload. Subagentหนึ่งตัวตรวจเอกสารแบบread-only พบsummary/actionเก่าขัดกับผลใหม่ จึงเขียนPROJECT_STATUSใหม่ให้เป็นสถานะปัจจุบัน ไม่เพิ่มcode/schema/deploy/บริการ ไม่Merge. เหลือWebJobscope/browserrestore/livechecksตามrunbook; PITRแยกเป็นproduction-readiness ไม่แอบเพิ่มบริการ

ตรวจเอกสาร45checksและdiffcheckผ่าน; ไม่รันapplicationtestsซ้ำเพราะรอบนี้เปลี่ยนเอกสารเท่านั้น. CIหลักเดิม36109173357 Native52/52


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

## 25 กันยายน 2026 — พัก LINE Admin / เดินหน้ากลุ่มด้วย Owner และ Restore test

Ownerสั่งข้ามLINEAdminไปก่อน: ADMIN_ACCOUNT_LINKและAdminเฉพาะrole UAT = DEFERRED_BY_OWNER ไม่ใช่PASS และไม่ถือM1accepted/readymerge. ไม่ถอดallowlistหรือแก้roleของAdmin. สิทธิ์ผูกกลุ่มเดิมรองรับOWNER/ADMIN จึงใช้Ownerที่เชื่อมแล้วสร้างรหัสของPILOT LINE AบนWebและขอให้ส่งจากLINEOwnerไปกลุ่มเดิม รหัสอยู่หน้าWebเท่านั้น อายุ10นาที; ยังWAITING_USER ไม่ผูกฐานโดยตรงหรือปลอมevent

ตรวจliveแบบอ่านอย่างเดียว: OWNER1/TECH1เชื่อม, groupbinding0, pendingreply0, overduepayload0. เพิ่ม native-restore regression ให้ใช้passwordhashสมมติจริง หลังbackup/restore/reopenเรียกAPI Loginได้, sessionก่อนbackup401, cookieflags, TECHเห็นAไม่มีSiteJob/ไม่เห็นB, ถอนassignmentสมมติแล้ว404, Logoutแล้ว401. ไม่เพิ่มบริการหรือrestoreข้อมูลจริง. TypecheckPASS; [CI36109173357](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36109173357) commit8ea5ed90a7e0d82a09a0095ad641c3748e5c398b ผ่านครบ: Native52PASS/0SKIP, embedded50PASS/2SKIP, productionbuild/API+Webcontainers/smoke/M0; เอกสารlocal45checksและdiffcheckผ่าน. Restore-loginเป็นinjectedAPIบนฐานสมมติ ไม่ใช่StagingBrowserRestore UAT. ตรวจกลุ่มล่าสุดยังbinding0/pendingreply0 จึงคงWAITING_USER

## 25 กันยายน 2026 — รับ Admin ใหม่สำเร็จและเปิด LINE กลับ

Ownerแจ้งส่งแล้ว; หน้าOwnerตรวจช่องส่วนตัว1ได้รับจริง. runtimeก่อนเปลี่ยนยืนยันallowlistเดิม3บัญชีและlinked OWNER1/TECH1 มีช่องไม่ผูกเพียง1. เก็บ2บัญชีที่เชื่อมไว้ แทนเฉพาะช่องว่างด้วยAdminใหม่ตามD-034 ไม่เพิ่มจำนวน ไม่แตะline_accountsเดิม. ย้ายIDจากหน้าOwnerเข้าRailwayโดยตรงในmemory ไม่พิมพ์/บันทึกcodeหรือIDsในGit/Chat/Log. ตรวจstagedpatchมีเฉพาะapi.LINE_TEST_USER_IDSแล้วcommit skipDeploys; API/worker user/group/projectallowlistsตรงกัน3/1/2

ปิดenrollmentและเปิดbusinessAPI exactdc289ee: deployment81db9569-03bd-4d63-b64f-b36b3b3e5bf2 SUCCESS. ตรวจschema/TLS/leastprivilege, OWNER/TECHคงอยู่, expiry sweepก่อนresumeสำเร็จและoverdueก่อนsweep0 แล้วเปิดworker45e3de67-ee8f-44d6-9e2c-3a97d6a3ae2e exactdc289ee SUCCESS/deploymentStopped=false. flagsทั้งคู่LINE=true/enrollment=false ขอบเขตและreleaseตรงกัน HTTPShealth200

ADMIN_ENROLLMENT=PASS; ADMIN_ACCOUNT_LINK=WAITING_USER ไม่ถือว่าลงทะเบียนเท่ากับเชื่อมบัญชี. TECHเชื่อมแล้วและมีassignmentสมมติAจากรอบก่อน พร้อมdomainprojectionเห็นAไม่เห็นB/auditหนึ่งครั้ง แต่ผลคำขอใหม่บนโทรศัพท์ยังWAITING_USER. Group/revoke/expiryจริงยังNOT_RUN. ให้Adminส่งเชื่อมบัญชี/LoginบัญชีADMINของตน ส่วนTECHส่งงานของฉันใหม่; Ownerไม่ต้องสมัครซ้ำ

ไม่มีapp/schema changeหรือRichMenu/Merge/M2/Production ไม่มีบริการหรือแผนเพิ่ม. CIเดิม36105399785 Native52/52ยังตรงapplicationcode; รอบนี้ตรวจconfig/runtimeข้างต้นและเอกสาร45checks/diffcheck ไม่รันapplicationtestsซ้ำ

## 25 กันยายน 2026 — TECH เชื่อมแล้ว / รับ Admin ใหม่

ตรวจ TECH ผู้ทดลอง: user/employee active, LINEเชื่อมและอยู่allowlist แต่ไม่มีassignmentในProjectPilot จึงไม่แสดงโครงการ; งานเดิมนอกPilotไม่ถูกเปิดผ่านLINE. มอบหมายเฉพาะPILOT LINE A PRJ-2609-014 ผ่านdeployedApplication/app.injectด้วยoperatorสมมติแล้ว: domain projectionเห็นAไม่เห็นB, ASSIGNED auditหนึ่งครั้ง, assignmentนอกPilotไม่เปลี่ยน. ปิดoperator/sessionหลังตรวจ ไม่บันทึกชื่อบัญชีหรือLINE IDในเอกสาร. ผลคำขอใหม่บนโทรศัพท์ยังWAITING_USER

Ownerขอรับ LINE Admin ใหม่ตามD-034. Worker flag=false และ deployment a4e694c8-9ba8-412b-a7cc-2cc8b592c1e7 หยุดจริง deploymentStopped=true ก่อนเปิดenrollment. Auto-reviewปฏิเสธการเปิดAPI enrollmentก่อนหยุดworker จึงแก้ลำดับตามrunbookโดยไม่ข้ามการปฏิเสธ. API enrollment deployment50de5f09-83d8-44af-8d12-278ee9d29447 SUCCESS releaseเดิม dc289ee. runtimeตรวจLINE=false/enrollment=true, OWNER1/TECH1คงอยู่, ช่องยังไม่เชื่อม1, inbox/outboxคิวรอ0, schema/TLS/privilegeและHTTPShealth200ผ่าน. OwnerLoginแล้ว ออกรหัสบนหน้าเว็บเวลา14:16อายุ15นาที ใช้เฉพาะช่องส่วนตัว1; ยังรอAdminส่ง ไม่เก็บcode/IDในเอกสาร. ไม่มีapp/schema change; เอกสาร45checksและgit diff --checkผ่าน ไม่รันapplicationtestsซ้ำ (CIเดิม52/52ยังใช้กับreleasecode). TrialUSD4.7314/28วัน ไม่Merge/Production/RichMenu

## 25 กันยายน 2026 — เตรียมรอบ Admin/TECH และพัก Rich Menu

25 กันยายน 2026 — ตรวจฐาน Staging แบบอ่านอย่างเดียว: runtime schema/TLS/least privilege ผ่าน; release dc289ee คงเดิม, LINE เปิดแบบจำกัดขอบเขตและ enrollment ปิด. พบ OWNER เชื่อมหนึ่งบัญชี; Admin/TECH ยังไม่เชื่อม, กลุ่มยังไม่ผูก. Inbox DONE5 / outbox SENT3 และ DEAD1 เดิมจาก mock drill; ไม่มีคิว pending/retry และ overdue payload=0. Trial ยังใช้งานได้ เหลือประมาณ USD4.7334/28วัน ไม่เพิ่มบริการหรือเปลี่ยนแผน

Owner ให้รอทำ Rich Menu จนส่วน LINE ของ Milestone ครบ: DEFERRED ตามคำสั่ง ไม่ใช่ blocker ของการทดสอบคำสั่งข้อความ. เตรียม [รอบทดสอบ Admin/TECH/กลุ่ม](M1_LINE_PILOT_ROUND_2.md) แล้ว ขั้นเชื่อมตัวตนต้องทำจาก LINE ของแต่ละคน; ส่งขั้นตอนให้ทำครั้งเดียว ไม่ขอ password/token หรือให้ Owner สลับบัญชีเพื่อ technical tests

เพิ่ม automated regression สองกรณีใน foundation.test.ts: กลุ่มไม่เพิ่มสิทธิ์ TECH/ไม่เปลี่ยน Project เดิมเงียบ ๆ และผู้สร้าง group code ถูกปิดบัญชีหลังเข้าคิวต้องผูกไม่ได้. ใช้ฐานสมมติ/recording transport เท่านั้น ไม่เปลี่ยน app/schema หรือ Deploy. Local regression PASS50 / SKIP2 (Native เฉพาะ CI), typecheck PASS และ M0เอกสาร45checks/diff check PASS. รอบ targeted ครั้งแรกพบ fixture Admin session ถูกเพิกถอนตามที่ระบบออกแบบหลังปิดบัญชี; แก้ test ให้ยืนยัน old session401 และ Login ใหม่ก่อนกรณีถัดไปแล้วรวมผ่าน ไม่แก้ application. Native PostgreSQL CI36105399785 PASS52/52 ไม่มี skip บน commit07dab2876b665cf0f45f5d00fe7f1ebc78a52098; typecheck/production build/API+Web container build/smoke/M0 checks PASS. [CI evidence](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36105399785). R2 real UAT ยัง NOT_RUN จน Admin/TECH เชื่อมและทดลองบนโทรศัพท์

## 25 กันยายน 2026 — Owner เห็นงานผ่าน LINE แล้ว / เมนูเดิมยังค้าง

Owner แจ้งและแสดงผลบนโทรศัพท์ว่า “งานของฉัน” ตอบกลับโครงการสมมติ PILOT LINE A/B ถูกต้อง: OWNER_LINE_JOBS = UAT_PASSED (Owner-reported visual evidence). ไม่เก็บภาพหรือลิงก์เชื่อมบัญชีลง Repository. หลักฐานนี้ยืนยันผลเรียกงาน ไม่ใช้แทนการตรวจขั้นเชื่อมบัญชีทุกขั้นหรือ expiry/replay; Admin/TECH, group binding และ revoke ยัง NOT_RUN ในรอบจริง

Rich Menu ยังเป็นรุ่นเก่า; “งานวันนี้” ได้ข้อความแนะนำให้ใช้ “งานของฉัน”. บันทึกเป็นข้อสังเกต UX ไม่ใช่ข้อมูลโครงการหาย. เปลี่ยน Rich Menu บน OA เดิมได้แยกจาก Web/API deployment; เสนอ M1 เฉพาะ งานของฉัน / เชื่อมบัญชี / เปิดเว็บ และทดลองเฉพาะผู้ร่วม Pilot ก่อน. ยังไม่ได้สร้างหรือเปลี่ยนเมนูจริง ไม่เพิ่มเมนูลงวัน/OT/Expense/Leave ใน M1. อ้างอิง https://developers.line.biz/en/docs/messaging-api/using-rich-menus/

รอบนี้แก้เอกสารเท่านั้น ไม่เปลี่ยน code/schema/deployment/allowlist และไม่ถือว่ารับ M1 ทั้งหมด. ตรวจ check-m0 24/24, check-r2 14/14, check-r4 7/7 รวม45checks และ git diff --check ผ่าน; ไม่รัน application tests ซ้ำเพราะไม่มี code change

## 25 กันยายน 2026 — bounded LINE เปิดรอ Owner UAT

Release dc289ee3088cd84639cc828b49a6f5c50a665f55 CODED/TESTED/DEPLOYED. CI36102233232 NativePG50PASS/0SKIP, typecheck/build/API+Webcontainers/smoke/M0 PASS; local48PASS/2nativeSKIP, targeted10/10และM0เอกสาร45checks

API c4d8f20b-9524-4b59-bc15-3c86b0558737 / Web d3bca251-a686-402e-a0d8-0e5dd2cddbb9 / privateworker a4e694c8-9ba8-412b-a7cc-2cc8b592c1e7 SUCCESS exactSHAเดียวกัน. LINE_ENABLED=trueทั้งAPI/worker; enrollmentfalse; ขอบเขตเดิม3users/1groupและ2Projectสมมติใหม่ Aไม่มีSiteJob/BมีSiteJob. ไม่มีmigration/serviceใหม่/upgrade/Merge/M2/Production

Staging PASS24checks: injectสร้างfixturesผ่านdeployedapplication, publicHTTPShealth/HTTPredirect, boundedlogin10x401/11th429+Retry-Afterแม้เปลี่ยนforwardedheader. PASS21HTTPSchecksแยกOwner/Admin/TECHสมมติรวมsecurecookie/CSRF/logout; บัญชีปิดหลังตรวจ ไม่มีรหัสในหลักฐาน

Worker PASS16checks: runtimePGTLS/schema/leastprivilege, spawnedchildworkerloop+SIGTERMexit0และDBconnectionปิด, mocktransportretry→expiredlease→DEAD,24hcontentexpiryซ้ำได้โดยเก็บevent/status. Providerdrill: deployeae38278...SUCCESS→deploymentStop→deploymentStopped=true (recordstatusยังSUCCESSตามRailway)→deployใหม่a4e694c8...SUCCESS. ไม่ส่งแชทจากmocktests

Privacy: browserDOMตรวจlocation.hash/searchว่างหลังอ่านsyntheticfragmentและreloadล้างmemory; tabmetadataURLเคยค้างจึงใช้actualbrowserlocationเป็นหลักฐาน. ApplicationlogsampleAPI/Web/workerอ่านได้ไม่พบsecretpatterns. HTTPedgeCLIทั้งAPI/Webได้0แถว; projectwideไม่มีserviceอ่านไม่ได้ จึงNOT_OBSERVEDไม่ถือlogครบทุกชั้นผ่าน. Coretokenใหม่อยู่fragmentที่ไม่ส่งในHTTPrequest target; no-referrerและloggerfalseเดิม. คงข้อจำกัดsharedproxyและphysicalretentionเมื่อproviderdownในPROJECT_STATUS

ตรวจruntimeหลังเปิด: linkedRolesยังว่าง (ยังไม่เชื่อมสำเร็จ); inboxDONE2/outboxSENT1/DEAD1. DEAD1เป็นmockfixtureจากstop/retrydrillที่ล้างpayloadแล้ว ไม่ใช่livefailure; SENT1ยืนยันproviderรับreplyหนึ่งรายการ แต่ยังไม่ทราบคำสั่งหรือผลบนโทรศัพท์ จึงไม่อ้างLINK/JOBS UATผ่าน

OfficialLINEwebhook/testหลังเปิดbusinessAPI success=true/200. TrialยังtrueประมาณUSD4.7354/28วัน. ส่งขั้นตอนให้Ownerพิมพ์เชื่อมบัญชี→Login/ยืนยัน→งานของฉัน แต่ยังไม่มีหลักฐานrealaccountlink/JOBS/group/revoke/nonceexpiryหรือOwnerM1acceptanceในรายการนี้

## 25 กันยายน 2026 — เตรียมเปิด LINE หลัง enrollment ครบ

Ownerให้ทำLINEต่อและอนุมัติqueuepayloadTTL24ชั่วโมงตามD-033. CODED: fragment linkเพื่อไม่ส่งtokenในCoreAppURLquery; Webอ่านในmemoryแล้วล้างaddressbar ไม่รับlegacyquerytoken; workerตรวจruntimeTLS/privilegesและsweepexpiredqueueโดยคงaudit/identities. ยังไม่มีmigration ไม่แตะข้อมูลจริง ไม่เพิ่มบริการ/แผน

Targetedtests10/10, typecheck, fullregression48PASS/2nativeSKIP และproductionbuildPASS; NativePG/containerCIและStaginggatesรอตรวจ ยังไม่เปิดbusinessLINE. Trialอ่านล่าสุดisTrialing=true เหลือUSD4.736855/28วัน. ขั้นต่อไปใช้Projectสมมติ A/B, privateworker, HTTPS/proxy/stopdrillก่อนเปิด3ผู้ทดลองเดิม ไม่มีการลงทะเบียนซ้ำ

## 25 กันยายน 2026 — กำหนดขอบเขตเชื่อมระบบบัญชี/คลัง (D-032)

Owner ยืนยัน Core ต้องไม่ผูกกับผู้ให้บริการ: AccountingConnector และ InventoryConnector เป็น contract กลาง; FlowAccount OpenAPI เป็น candidate ในอนาคต ส่วน FlowAccount MCP เป็น optional AI interface ห้ามใช้เป็นช่องทาง System of Record. เปลี่ยน Inventory Master ต้องผ่าน Stock/Warehouse/Serial POC + Reconciliation Gate และอนุมัติ cutover แยก ตาม [ADR-013](adr/013-provider-agnostic-integrations.md)

สถานะ DESIGNED / NOT_CODED / NOT_DEPLOYED; POC และ provider integration tests NOT_RUN. ปรับ Master v3.0/กติกาagent/schema target/dictionary/permission/export/gap ให้ตรงกัน ไม่เปลี่ยน application, migration, provider หรือข้อมูลจริง ไม่เริ่ม Expense/Inventory/M2/M3. Codexรับผิดชอบเอกสารนี้; ขอบเขตและสถานะ M1 LINE ด้านล่างคงเดิม ยังไม่มีคำถามที่ขวางงานสำหรับ Owner

หลักฐานรอบเอกสาร: ตรวจ apps/packages/scripts ไม่พบการอ้าง SMEMOVE/FlowAccount; check-m0 24/24, check-r2 14/14, check-r4 7/7 รวม45checks PASS และ git diff --check PASS. ไม่มีการแก้โค้ดจึงไม่รัน application/NativePG/container ซ้ำ ไม่ใช้ผลนี้อ้างว่า connector/POC ผ่าน

## 24 กันยายน 2026 — ลงทะเบียนจริงครบ / hotfix DEPLOYED

LINE_ENROLLMENT_REAL PASS: Ownerแจ้งได้รับข้อความแล้ว; operatorกดตรวจผลจากOwnerpageก่อนhotfixและพบได้รับแล้ว3คน/1กลุ่มครบ. เป็นรอบใหม่ที่ส่งคำสั่งเต็มสำเร็จบนAPI84df39c ไม่ใช่หลักฐานว่าbarecodeผ่านliveก่อนแก้. เก็บexactIDsในRailway APIVariablesผ่านUIแบบส่วนตัว ตรวจstagedpatchมีเฉพาะLINE_TEST_USER_IDS/LINE_TEST_GROUP_IDS แล้วcommit skipDeploys; workerอ้างอิงAPIสองค่านี้ ตรวจตรงกันและworkerยังfalse. ไม่บันทึกIDs/codes/messagesในGit/Chat/Log ไม่ต้องให้Ownerลงทะเบียนซ้ำหลังrestart

Hotfix D-031 CODED/TESTED/DEPLOYED: d5aa5675b426408609166ebf0744dc3a557d3d1e, APIdeployment8e0b8403-c007-4f50-a0e3-7ad4e4a17f9b SUCCESS; Webยัง84df39c ไม่มีmigrationหรือWebchange. [CI36025270535](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36025270535) SUCCESS:46PASS/2nativeSKIP แล้วNativePG48PASS/0SKIP; typecheck/productionbuild/API+Webcontainers/smoke/M0 PASS

Post-deploy PASS27checks: app.injectในprocessแยกบนdeployedcodeกับruntimePostgreSQL ใช้Owner/LINE IDs/รหัสสมมติ ไม่แตะรอบOwnerจริง. ตรวจTLS/schema/runtimeprivileges, barecode+คำสั่งเต็ม, unrelatedtext/duplicateuser/replay/ผู้ส่งgroupยังไม่สมัครถูกปฏิเสธ, complete3+1, businessLINE=false, queue/account/bindingcountsไม่เปลี่ยน,logout; ปิดfixtureOwnerหลังตรวจ. ไม่ใช่27HTTPchecksหรือliveaccountlink

Public /api/health200; official LINE webhook test success=true/statusCode200; endpointตรงWebStagingและactiveหลังhotfix. API LINE_ENABLED=false / LINE_ENROLLMENT_ENABLED=true; workerfalseและยังไม่deploy ไม่ส่งแชทจากระบบในรอบนี้. Enrollmentstateในmemoryอาจหมดอายุแต่scopeเก็บในRailwayแล้ว

NOT_RUN: projectallowlist, privateworker lifecycle, liveproxy/edgeครบ, realaccountlink/JOBS/group/revoke/expiry และOwnerUATรวม. ไม่Merge/M2/M3/Production/เพิ่มบริการหรืออัปเกรดแผน. Ownerไม่ต้องทำซ้ำตอนนี้ รอCodexปิดtechnicalgatesก่อนเปิดคำสั่งLINE

## ประวัติก่อน hotfix — วิเคราะห์ enrollment รับรหัสอย่างเดียว

Ownerแจ้งส่งครบ แต่ GETผลรอบปัจจุบันยัง0/3และ0/1 ตรวจHTTPmetadataพบWebhook200หลายครั้ง endpointactiveถูกต้อง deploymentไม่เปลี่ยน. เปรียบเทียบเฉพาะข้อความที่แสดงในOAทดสอบกับรหัสในหน้าเว็บในหน่วยความจำ: มีตัวรหัสตรง แต่ไม่มีprefixคำสั่ง ไม่เก็บข้อความ/รหัส/IDsในหลักฐาน

Root cause: captureรับเฉพาะ “ลงทะเบียนทดลอง <รหัส>” จึงไม่รับ barecode. แก้ให้ยอมรับทั้ง barecode32ตัวอักษรและคำสั่งเดิม โดยยังตรวจexacthash/one-use/15นาที/3LINEusersไม่ซ้ำ/groupโดยผู้สมัครแล้ว/signature/destination ไม่มีauto-grantหรือwildcard ไม่มีschema/Web change

Regression synthetic REDก่อนแก้2tests; GREENหลังแก้3/3 + typecheck PASS. CI/fullNativePGรอpush. OwnerUAT/enrollmentจริงยังไม่ผ่านและbusinessLINEยังfalse. รอบเดิมหมดอายุแล้ว ต้องเริ่มรอบใหม่หลังDeployที่ตรวจผ่าน ไม่ให้ส่งซ้ำระหว่างกำลังแก้

## 24 กันยายน 2026 — LINE enrollment DEPLOYED / Webhook จริง PASS

Ownerอนุมัติ boundedPilotและเปลี่ยนWebhookเดิมของOAทดสอบได้ ได้กรอกChannelSecret/APIและAccessToken/workerผ่านRailwayแล้ว Applyเฉพาะ2ตัวแปรแบบskipDeploys ไม่แสดงค่า BotinfoตรงOA; APIไม่มีAccessToken PayloadKey32bytesสุ่มส่งตรงstdin BotIDตั้งส่วนตัว

CODED/DEPLOYED: API+Web exact84df39ce386d4892c943baae36822084a3421a4a SUCCESS. API deployment a8990b9a-2e7c-4b2d-8ca5-2fcb35c366e2; Web88979aa4-f253-42f1-a154-9b3cb432e401. LINE_ENABLED=false, LINE_ENROLLMENT_ENABLED=true; /line-pilot200. Worker serviceเป็นที่เก็บTokenเท่านั้นไม่มีsource/deployment/domain ไม่รัน ไม่ส่งข้อความ ไม่มีmigration/ข้อมูลจริงเปลี่ยน

TESTED_LOCAL:45PASS/2nativeSKIP, typecheck/build/M0 45checks PASS. [CI36018991502](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36018991502) SUCCESS:NativePostgreSQL47PASS/0SKIP, typecheck/build/API+Webcontainers/smoke/M0 PASS. ทดสอบenrollmentรหัสใช้ครั้งเดียว/expiry/restart/creator/role/signature/ไม่มีbusinesssideeffects และprojectscopeรวมOWNER/queuedrevocation/workerfailclosed

TESTED_STAGING:HTTPS38checks PASS (syntheticOwner/Admin/TECH; health/database; Secure/HttpOnly/SameSite cookie; CSRF; Ownerenrollment404ก่อนเริ่ม; Admin/TECH403; businessLINE503; signaturevalid200/tampered401; logout401; queues/accounts/bindingsไม่เพิ่ม) ปิดบัญชีfixtureแล้วโดยไม่แตะข้อมูลจริง ไม่สร้างรอบสมัครทับOwner

REAL_WEBHOOK_VERIFY PASS:ตั้งendpointWebStagingตามอนุมัติ LINE official GETยืนยันตรงและactive; POST webhook/testตอบsuccess=true/statusCode200/reasonOK. ConsoleVerifyไม่แสดงผลชัดเจนจึงใช้officialAPIเป็นหลักฐาน ไม่ถือว่าลองส่งmessage/เชื่อมบัญชีผ่านแล้ว

LOG_SAMPLE PASS:100linesต่อAPI/Webอ่านสำเร็จไม่พบsecretpatterns ตรวจในmemoryรายงานเฉพาะboolean ไม่ใช่รับรองedge/querylogsทุกชั้น. Trialยังtrue เหลือUSD4.79199/28วันหลังDeploy ไม่มีupgradeหรือpaidserviceใหม่

PENDING_OWNER:เปิด /line-pilotด้วยOwner เมื่อ3คนพร้อม ส่งรหัสคนละชุดในแชทOAและรหัสกลุ่มตาม [Owner Setup](M1_LINE_OWNER_SETUP.md) ภายใน15นาที กดตรวจผลครบแล้วแจ้งโดยไม่ส่งcodes/IDs. Codexจะตั้งallowlists/privateworkerและตรวจgatesต่อ ไม่ต้องกรอกSecretซ้ำ

NOT_RUN:ผู้ทดลองจริงenrollmentครบ, workerlifecycle, realaccountlink/JOBS/group/revoke/expiry และM1OwnerUATรวม ไม่Merge/M2/M3/Production

## 24 กันยายน 2026 — อนุมัติ LINE Pilot / เตรียมขอบเขตและ enrollment

Owner อนุมัติ OA/กลุ่มทดสอบ Owner/Admin/TECH1คน และเปลี่ยน Webhook เดิมได้ ภายใน Trialเดิม ตรวจ provider read-only: isTrialing=true เหลือเครดิตประมาณ USD4.7948 และ28วัน (plan enumHOBBYไม่ได้แปลว่ามีการอัปเกรด); ไม่มีการเปลี่ยนแผน

CODED: exact synthetic Project allowlist รวม OWNER, recheck source ก่อน consume nonce/binding, worker fail-closed/safe fatal log, private signed enrollment /line-pilot (OWNERผู้เริ่มรอบเท่านั้น,3คน1กลุ่ม,15นาที,one-use,process memory,ไม่grantสิทธิ์/ไม่queue/ไม่reply). ไม่มี migration เปลี่ยนข้อมูลจริง หรือเปิด LINE รอบนี้ API contract/ADR-012/D-030 อัปเดตแล้ว

TESTED_LOCAL: targeted scope6/6 + enrollment/worker4/4 PASS; typecheckและproduction build PASSหลังแก้ test config type. Full latest regression45PASS/2nativeSKIP และM0 45checks PASS. NativePG/container CIรอหลังpush จะแยกผลออกจาก Staging

DEPLOYED/REAL_LINE: รุ่นเตรียมนี้ยังไม่deploy; workerสร้างเป็นserviceเปล่าแล้ว ยังไม่deploy; signed real Verify/link/group/UAT NOT_RUN ต้องตั้งcredentialsโดยตรงและผ่านgatesก่อนเปิด ไม่มีMerge/M2/M3/Production

Design reference จาก task Reviwer: [UI_DESIGN_DIRECTION](UI_DESIGN_DIRECTION.md) สถานะ DESIGNED_REFERENCE — เมนูซ้ายถ่านเข้ม/แดงแบบภาพ1 เนื้อหาการ์ดขาว/น้ำเงินแบบภาพ2–5 ยังไม่ใช่ UI ที่ deploy


## 24 กันยายน 2026 — Owner ยืนยัน Job create ผ่าน / เตรียม LINE Pilot

Ownerแจ้งเพิ่มJobได้แล้ว ปิดปัญหาseedType validation400เป็น OWNER_UAT_JOB_CREATE=PASS; ไม่ถือเป็นรับM1ทั้งหมด. ตรวจread-only: health200, branchตรงorigin/ไม่ตกmain, LINE=false, APIยังไม่มีLINEconfigและยังไม่มีworker (มีWeb/API/Postgres3services). เตรียม [LINE Readiness](M1_LINE_PILOT_READINESS.md) แต่ยังไม่เปิดจริง ไม่Merge/M2/Production. ไม่มีapplication/schema/deployment changeรอบนี้


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


## 24 กันยายน 2026 — DEPLOYED_STAGING / รอ Owner UAT

Owner อนุมัติ Backup/Recovery และ migration003/grants/Deploy SHA cda461d แล้ว ทั้ง API/Web Online; encrypted backup และ isolated restore PASS; legacy business digest ไม่เปลี่ยน; HTTPS24 checks และ restart persistence PASS; log sample ไม่พบ secret patterns LINE=false ไม่เปลี่ยนแผน ไม่ Merge/M2/M3/Production ดู [หลักฐาน Staging](M1_ALIGNMENT_STAGING_EVIDENCE.md) สถานะรออนุมัติด้านล่างเป็นประวัติที่แก้ไขแล้ว

## 23 กันยายน 2026 — Staging preflight หลัง Owner ให้เริ่ม

- ตรวจ head 9bcbe3e/CI SUCCESS และ Railway Trial $4.89/29 วัน บริการเดิม Online
- พบ provider Backup/PITR ต้อง Pro ไม่อัปเกรด เตรียมทางเลือก encrypted pg_dump/CLI download แต่ติดการ Login CLI; ยังไม่ backup ข้อมูลจริง/migrate/deploy
- อัปเดตสถานะและหลักฐานตรงกับ gate จริง ไม่มี application/schema change

## 23 กันยายน 2026 — M1 Alignment v3.0 (ยังไม่ Deploy)

- เพิ่ม append-only003: configurable Project Type5/Job Type10, operational Project/Job fields, safe backfill, atomic codes/counter/reservation; ไม่แก้001/002
- Backend/UI รองรับประเภท/วัน/PM/ผู้รับผิดชอบ/status/progress พร้อม scoped PM TECH assignment/revoke และ audit; ไม่มีExpense/Payroll placeholders
- Backup format2 รวมmaster/counters/registry, migration roleแยก, grant scriptเฉพาะตารางใหม่; dry-run/recoveryและExpenseD-022testplan
- Code c8a522d: Local 32 PASS/2 native-only SKIP; Native PostgreSQL CI 34/34 PASS; Type Check, Production Build, API/Web container build+smoke และ M0 45 checks PASS — [CI 35872122374](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35872122374)
- บันทึก PROJECT_STATUS ภาษาไทยแยก CODED/TESTED/DEPLOYED/UAT พร้อม release manifest และแผน Dry Run/Recovery; พร้อมเสนออนุมัติ Staging แต่ยังไม่มี migration/deploy/LINE/merge/production

## 2026-09-23 — PM assignment และ Expense approval policy

- PM เพิ่ม/ถอน TECH ได้เฉพาะ Project ที่รับผิดชอบ ห้ามสร้างผู้ใช้ เปลี่ยน Role หรือแต่งตั้ง PM; ทุกครั้งมี Audit
- ADMIN อนุมัติ Expense ได้รวมรายการที่ตนกรอก และ OWNER อนุมัติได้ทั้งหมดรวมรายการตนเอง; PM/TECH อนุมัติไม่ได้
- การแก้ Approved Expense ใช้ correction/revision และ ledger reversal/repost; Financial Lock ต้องให้ OWNER เปิด revision
- อัปเดต Master v3.0, Permission Matrix, Gap Analysis, Decision Log และ Project Status; ยังไม่มี application/schema/deployment change

## 2026-09-23 — Master Prompt v3.0

- รับ Product Specification ใหม่เป็น Canonical Master v3.0 แทนชื่อร่าง v2.4 เพื่อไม่ย้อนเลขจาก v2.5
- จำกัด Core ที่ Project/Job/Workforce/Work/OT/Expense/Evidence/Project Cost/Owner Financial/Payroll Summary; SMEMOVE ยังคงเป็น Product/Purchase/Inventory/Accounting master
- ระบุ Admin เห็น Expense transaction amount/evidence แต่ไม่มี financial aggregate, PM เห็นเฉพาะ Expense ของตน และ default ห้ามผู้ส่งอนุมัติรายการตนเอง
- เพิ่ม Owner-only financial boundary, SMEMOVE actual/reference, immutable Cost Ledger, completeness, commercial reference และ milestone M0–M8
- รักษาข้อยืนยันเดิมเรื่อง Owner หลายบัญชี, delegated entry, รอบค่าจ้าง 1–สิ้นเดือน, จ่ายไม่เกินวันที่ 1, late adjustment, OT 0.5 ชั่วโมง และหลักฐาน 2 ปี
- เพิ่ม MASTER_V3_GAP_ANALYSIS.md; ผลตรวจพัฒนาต่อจาก M1 Foundation ได้โดย append-only migration ไม่รื้อระบบ
- เอกสารรอบนี้ไม่เปลี่ยน application/migration/deployment; PR #2 ยัง Draft, LINE ปิด, M1 ยังไม่ผ่าน UAT

## 23 กันยายน 2026 — ปรับ UX และทดสอบอัตโนมัติก่อนส่ง Owner

Owner ขอให้พัฒนาและทดสอบเป็นชุดก่อนส่งตรวจ ไม่ต้องสลับบัญชีทีละขั้น จึงพักคำขอ Login TECH ก่อนหน้า ไม่รอ Owner เพื่อทดสอบอัตโนมัติ ใช้บัญชี OWNER/ADMIN/PM/TECH ที่ชุดทดสอบสร้างเองในฐานสมมติแยก รหัสผ่านสุ่มในหน่วยความจำ ไม่พิมพ์/บันทึกและไม่ใช้กับ Staging ที่มีข้อมูลจริง

CODED: เพิ่มชื่อลูกค้า/สถานที่บนการ์ดและรายละเอียดโครงการ เปิดรายการ Job และแบบฟอร์มเพิ่ม Job ให้มองเห็นชัด ตัวเลือกมอบหมายทั้งโครงการ/Job แสดงทันทีเมื่อมี Job เท่านั้น โครงการไม่มี Job ยังไม่ถาม Job ล้างข้อมูลหน้าจอเมื่อ Logout ป้องกันข้อมูลค้างข้ามบัญชี

TESTED: Local regression 24 tests: 22 PASS / 2 native-PostgreSQL-only SKIP / 0 FAIL; typecheck และ Next production build PASS; M0 document checks 24/24 PASS; git diff --check PASS. ชุดใหม่ตรวจ customer/site ตาม scope, ห้ามอ่าน directory, A ไม่มี Job และ B มี Job โดยสร้างบัญชี/รหัสผ่านอัตโนมัติในฐานแยก CI รุ่นใหม่ยังรอผล DEPLOYED: Staging ยังเป็น release 4fcb29e จึงยังไม่เห็น UX ใหม่ UAT: ยังไม่ส่ง Owner ตรวจรอบใหม่ ไม่ถือผล automated เป็น Owner acceptance

ยังไม่เปิด LINE ไม่ Merge PR #2 ไม่เริ่ม M2/Production ไม่แก้ข้อมูลจริงหรือเพิ่มค่าใช้จ่าย ส่ง Owner ตรวจเป็น flow เดียวหลังรุ่นพร้อม และขอ Owner เฉพาะเรื่องที่ต้องตัดสินใจ/กรอก secret ของบริการจริง

## 23 กันยายน 2026 — Admin และชุด PILOT A/B

PASS บน Web Staging release 4fcb29e: reload แล้วยืนยันบทบาท ADMIN; Admin สร้างลูกค้า PILOT-20260923-Customer และ Project A โดยไม่กรอก Site/Job ได้ มอบหมายช่างสมมติที่เคย Login ให้ A โดยแบบฟอร์มมีเฉพาะพนักงาน ไม่มีช่อง Job หลังบันทึกพบช่างสมมติและปุ่มถอนมอบหมาย

PASS: สร้าง Site B เลือก Site นี้ตอนสร้าง Project B และเพิ่ม Job B ได้ ตรวจพบ Job B ในรายละเอียด และ B ไม่มี assignment ช่าง ทั้งหมดใช้ชื่อขึ้นต้น PILOT-20260923 ไม่แก้รายการจริงเดิม Owner ยืนยันเพิ่มเติมว่า Admin เลือกช่างได้ถูกต้อง

ประวัติก่อนเปลี่ยนวิธีทดสอบ: เคยรอ Login ช่างสมมติเพื่อตรวจ A/B; คำขอนี้พักแล้วตามคำสั่ง Owner ล่าสุด ยังไม่ลง PASS ให้ cross-project, ถอนสิทธิ์, PM หรือ security live ที่เหลือ LINE ยังคงปิด ไม่มี deploy/merge/M2/ค่าใช้จ่ายเพิ่ม

## 23 กันยายน 2026 — Restart, Logout และ Rate Limit

PASS: ยืนยัน Restart API/Web จากการยืนยันใน provider และ startup/ready log รอบที่สอง; / และ /api/health กลับมา HTTP 200, database ready. Read-only checksum ของชุด IDs ใน users/employees/customers/sites/projects/jobs/assignments/audit ตรง baseline ก่อน restart โดยไม่พิมพ์ ID หรือ row data. ชุด restore สมมติ counts ยังครบ

PASS: Owner Logout แล้ว reload กลับหน้า Login; Owner Login บัญชี TECH สมมติสำเร็จ บน browser เห็น 1 project card, ไม่มีเมนูบัญชีผู้ใช้/ลูกค้าและทีม/สร้างโครงการ; เมื่อเปิดรายละเอียดไม่มีปุ่มแก้ไขหรือมอบหมาย บันทึกเฉพาะผล ไม่บันทึกชื่อหรือข้อมูลจริง ยังไม่ใช่ PASS ของ cross-project/revoke

PASS: ทดสอบบน API container จริงผ่าน loopback เพื่อไม่กินโควตาผู้ใช้ Web: login malformed body 12 ครั้งให้ 400 จำนวน10 และ 429 จำนวน2; health 130 ครั้งให้ 200 จำนวน120 และ 429 จำนวน10 แม้เปลี่ยน X-Forwarded-For ทุกครั้ง ไม่มี password/บัญชีที่ใช้ทดสอบ ไม่มีการล็อกบัญชีจริง ผลนี้ไม่ใช่ public-edge/multi-user rate-limit test

NOT_RUN: การเปิด privileged API โดยตรงผ่าน browser ถูก client navigation block จึงไม่อนุมานว่าได้ HTTP403. Secure Cookie attributes / expired-token replay ผ่าน CI แต่ยังไม่มีหลักฐาน live browser header/replay. Admin/TECH/PM cross-project/revocation UAT ยังไม่ครบ รอ Admin สมมติ Login. เครดิต Trial ล่าสุด $4.94 /30 days; ไม่มีการอัปเกรด

## 23 กันยายน 2026 — ผล Restore และขั้นก่อน LINE

Owner ให้ดำเนินการ process ถัดไปและถามว่าเริ่ม LINE ได้หรือยัง: ยังคง LINE=false จน gate A–E และผู้ทดลองพร้อม ไม่ Merge/M2/Production

Native pg_dump/pg_restore ซ้อมบน PostgreSQL 18 ใน Trial เดิม PASS โดยสร้าง source/restore ใหม่แยกจากฐานที่มีข้อมูลจริง ใช้เฉพาะ schema/migration metadata และสร้างแถว PILOT สมมติใหม่ ข้อมูล 9 business tables และ migration history เทียบทุก column/row ตรงกัน; counts และ Project A ไม่มี Site/Job, B มี Site/Job ผ่าน; transient sessions/codes/queues ไม่ถูกคืนมา Runtime Web ไม่มีสิทธิ์ CONNECT เข้าฐาน restore ดู M1_STAGING_RESTORE_DRILL.md สำหรับ checksum/ขอบเขต ไม่ใช่ backup ของข้อมูลจริงหรือ off-provider DR

Restart UI ครั้งก่อน timeout ก่อนยืนยัน จึงยังไม่ลง PASS จากการกดปุ่ม ขณะนี้ตรวจต่อ ส่วน Owner UAT 5 flow เดิม PASS ตามรายงาน แต่สิทธิ์แยกบทบาท/ถอนสิทธิ์/Logout ยัง NOT_RUN

## 22 กันยายน 2026 — Owner ทดลอง Web และแก้สถานะที่อ่านไม่ตรงกัน

Owner รายงาน PASS: Login, สร้างพนักงาน, สร้างลูกค้า, สร้างโครงการ และมอบหมายคนเข้าโครงการ ไม่ได้ระบุว่าทดสอบทุกบทบาท/Project ไม่มี Site/Job/การถอนสิทธิ์ จึงไม่เติม PASS ให้ UAT ข้อเหล่านั้น ตรวจใน browser พบ session ที่เข้าสู่ระบบอยู่โดยไม่อ่านรหัสผ่านหรือบันทึกรายการจริง

Owner ยืนยันว่ามีข้อมูลจริงปนใน Staging จึงหยุด backup/restore จากฐานชุดนี้; ไม่คัดลอกข้อมูลจริง ไม่แก้/ลบรายการเดิม ทดสอบต่อเฉพาะชุดสมมติแยก ดู D-019

ปรับ PROJECT_STATUS เป็นสรุปภาษาไทยปัจจุบัน พร้อมตาราง CODED/TESTED/DEPLOYED/UAT และ 3 งานที่ Owner ทดลองต่อได้ ย้ายรายละเอียดเก่าไป M1_STAGING_HISTORY เพื่อไม่ให้สถานะเก่าปะปน เพิ่มป้ายอ้างอิงในเอกสารโฟลเดอร์หลักที่ยังพัก M2 โดยเก็บงานเดิมไว้ ไม่รวมโค้ด M2 เข้า PR #2

ไม่มี application/schema/permission change ในการปรับเอกสารนี้ ผล Local/CI ของ release 4fcb29e อ้างอิงผลเดิม ไม่อ้างว่ารันทดสอบใหม่จากการแก้เอกสาร LINE=false, Trial only, no merge/production/M2

## Owner Web login handoff — 2026-09-22

Release 4fcb29e deployed: API 66ce64bf-c1f8-4a1a-abc2-5292b33c734c and Web 4202ccc1-70f1-480b-af33-8b1a7c8da635 ACTIVE; Details on both independently match full commit and M1 branch. Post-deploy / and /api/health returned 200, database ready. API startup message verified; limited credential-pattern scan negative. Owner browser handoff pending. This evidence-only documentation update does not change deployed application code.


Staging URL: https://web-staging-cb6f.up.railway.app/ . Login page rendered at 390x844 with scrollWidth=390 and no horizontal overflow; authenticated mobile screens remain NOT_RUN. PostgreSQL Settings showed Add Public Access (not enabled); API remains unexposed. Latest Trial indicator $4.99 /30 days; no upgrade or paid add-on.

Release 4fcb29e5625caad99b2d6c3056ebd08a344b7728: CI 35738098892 verify job SUCCESS including both test suites, native PostgreSQL, typecheck, Web build, both Docker builds, Web/API smoke, verified TLS, runtime-role backup CLI and M0 checks. Local: 22 PASS, 2 native SKIP, 0 FAIL; M0 45/45 PASS. PR #2 remains Draft, not merged, mergeable; main base 0d5da8a and behind count 0. Both services now have a non-secret M1_RELEASE_COMMIT annotation; deployment metadata must independently match it (annotation does not pin source).

Current gates: A PASS; B HTTPS/health/CSRF/anonymous scope/forwarded spoof checks PASS, live cookie/rate checks pending; C Login page/mobile PASS, Owner login/logout/expiry NOT_RUN; D synthetic role/Project A+B/restart tests NOT_RUN; E isolated Staging restore NOT_RUN. Owner must enter existing Web credentials directly; no credential requested in chat. LINE=false. No claim of overall A-E/UAT acceptance.

## Web/API Staging live checkpoint — 2026-09-22

API deployment abc2992b-7b07-4f56-84f2-3fbda1e12ac4 ACTIVE, release 9c70a0805ee6d891bfdf0249d171c009b36e0627 / codex/milestone-1-foundation. Runtime-only DB credential, verified TLS startup gates, private API (no public domain), HTTPS WEB_ORIGIN set to https://web-staging-cb6f.up.railway.app. Web deployment e193de78-4523-4f55-a63d-1ef8b686af55 serves HTTPS through private API. Auto deploy disabled on both services; LINE=false.

PASS live: HTTPS /api/health 200 with database ready; HTTP redirects 301 to HTTPS; anonymous /api/me and /api/projects 401; missing/foreign Origin POST 403; spoofed forwarded headers do not authenticate (401); LINE webhook disabled (503); no-store/nosniff headers. Visible API startup log has fixed success message and no connection-URI/private-key/bearer/password-assignment pattern. This scan covers only the inspected deployment log.

Owner login handoff opened on Web. Authenticated role tests, Secure Cookie attributes, logout/session expiry, runtime restart persistence and isolated Staging restore remain NOT_RUN; do not infer UAT success from health checks. API rate limit live probe deferred during Owner login to avoid shared-proxy throttling.

Preparing Phase E uncovered backup CLI calling migrations even for a read-only snapshot. Changed CLI to verify existing schema only; restore destination must be prepared separately by migration operator. Errors now emit a fixed category instead of potentially sensitive connection details. Added CLI round-trip/refusal-to-overwrite and credential-safe failure regression tests; local M1 suite: 24 tests, 22 PASS / 2 native PostgreSQL SKIP / 0 FAIL; typecheck PASS. CI and deployment of this CLI change pending. No Staging restore or production/LINE/paid/merge action.

## Phase A live verification PASS — 2026-09-22

Railway API one-shot deployment 90dc89a1-a4c0-4d23-baaa-0cd77733e6e0 completed from PR #2 commit 9c70a0805ee6d891bfdf0249d171c009b36e0627 (CI 35734400358 SUCCESS). Deployed command scripts/verify-runtime-db.ts reported PASS for runtime privileges, schema and verified TLS using the Owner-entered PGPASSWORD. No HTTP opened; runtime role only, no administrator credential. Visible deployment log scan found no connection URI/private-key/bearer/password-assignment patterns; this is limited to the inspected log, not a proof about every historical provider log. Trial balance observed $4.99/30 days.

Web service 0664e9f2-1450-4ba0-80ad-45a2b01bc2a1 created from M1, with deploy/Dockerfile.web, internal API reference and PORT3000; no database credentials. Initial build 74f5003d-c8f1-42ef-9878-02c63366ddd0 uses a temporary exit-only command to reserve the service/domain before opening API. Web auto deploy disabled. Phase B/C configuration in progress; B–E live functional/UAT/restore NOT_RUN, LINE=false.

## Runtime password saved; API secret handoff — 2026-09-22

Owner completed both hidden password entries. Latest read-only boolean check confirms runtime password present=true; no password/hash retrieved. Enabled LOGIN for asas_m1_runtime after credential/role preflight and verified LOGIN=true. Migrator remains NOLOGIN and runtime grants stay restricted. The first guarded command hit shell-quoting syntax error before mutation; the literal SQL heredoc completed successfully. Actual password authentication from API is still NOT_RUN.

API configuration staged (not deployed): public CA, password-free runtime connection using Railway private references, and start command node --import tsx scripts/verify-runtime-db.ts. Restart Never, M1 branch and Auto deploy disabled verified. No administrator credential returned to API. PGPASSWORD field is prepared for Owner to enter the same existing runtime password directly and click Add; do not request the value in chat.

PASS: installed pg compatibility check confirms PGPASSWORD is used verbatim with a password-free connection URL, including URL-special characters (synthetic fixture only; no connection opened). Latest checked PR head a1a8c13 remains Draft/not merged/mergeable; CI [35732225713](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35732225713) SUCCESS. No application source change this checkpoint.

Phase A runtime connection/TLS/log scan pending API secret; B–E NOT_RUN. LINE=false, no Web URL, no merge/M2/production/paid upgrade or data deletion. Continue with one-shot verification once Owner confirms Add.

## Credential handoff verification — 2026-09-22

Owner reported typing a password but seeing no confirmation. Read-only check returned runtime password present=false and LOGIN enabled=false. The active Console was at a fresh shell prompt, with no password-confirmation prompt visible; the reason the prior entry did not persist is unconfirmed. No password/hash was selected or printed, and no credential was reset. Runtime login/API TLS and Staging B–E remain NOT_RUN.

Reopen the private psql password prompt for Owner to complete both entries. Do not infer success from typing or missing echo; confirm password presence with a boolean and later test the runtime connection. If a future reset is needed, an authorized administrator can set a new runtime password and update the API secret consistently; business data and the Owner web account are unaffected. Owner must enter credentials directly, never in chat. No deploy/merge/LINE/paid changes.

## Current handoff — 2026-09-22

CI [35728917876](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35728917876) for code 997e231 SUCCESS: typecheck; PGlite suite; native PostgreSQL suite including runtime denial/restore; Next build; Docker Web/API build and smoke; verified TLS with restricted runtime; untrusted CA rejection; M0 checks. No Railway HTTP deployment was performed by this CI.

PASS: staging runtime/migrator roles created and restricted (both still NOLOGIN), M1 schema checksums, console verify-full TLS. NOT_RUN: runtime credential login/API TLS and log scan, all Staging B–E/UAT. FAIL: none outstanding from the executed final checks; initial CI failure remains historical evidence.

Owner action required: complete the hidden password prompt in the existing Railway Postgres Console and report only completion. Browser credential-entry policy requires Owner handoff; no secret is requested in chat. Afterward configure API runtime credentials and run the one-shot verification before HTTP. Public CA is the only pending staged API variable change. LINE remains false. No Web trial URL yet; no paid upgrade, merge PR #2, M2, production, data deletion or restore overwrite.

Updated .env.example, M1_API_CONTRACT and M1_RAILWAY_SETUP to match the new TLS/runtime requirements and current authorization. Branch remains codex/milestone-1-foundation.

## Phase A — Runtime roles provisioned, Owner credential handoff pending

2026-09-22: CI [35728088352](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35728088352) on c4cb5df SUCCESS: native PostgreSQL privilege/restore tests, TLS API container smoke, Web container, build/typecheck and M0. Local tests 22 /20 PASS /0 FAIL /2 native-only SKIP; M0 45 checks PASS. Earlier CI failure 35727645655 was fixed before touching staging roles.

Railway staging: provision-m1-roles.sql transaction COMMIT. Runtime role has no elevated flags, memberships, schema CREATE, database CREATE/TEMP or owned tables (all false/0); migration history SELECT-only; audit SELECT/INSERT-only; migrator owns all18 M1 tables. Runtime and migrator remain NOLOGIN. Schema checksums match the committed Linux migration bytes. No rows/tables deleted, restored or overwritten. Console verify-full TLSv1.3/256 PASS; runtime credential/API connection NOT_RUN.

Public root CA added as DATABASE_SSL_CA in API Variables (one staged change; not deployed). No private key/secret retrieved. Existing API still exits without HTTP/DB; LINE=false, no Web/worker/public endpoint. Owner handoff opened the hidden psql password prompt for asas_m1_runtime; awaiting Owner entry, never request password text. B–E remain NOT_RUN and no Owner Web URL exists yet.

Added API startup checks rejecting elevated database privileges and missing modern TLS; one-shot scripts/verify-runtime-db.ts emits only fixed PASS/FAIL. New CI will exercise restricted-role startup and reject an untrusted CA. This latest guard is CODED/typecheck PASS, CI pending; not deployed.

### Phase A implementation update

Added verified TLS by default for production-mode PostgreSQL; DATABASE_SSL_CA accepts the public CA only. URL SSL overrides and disabled certificate verification are rejected. API startup/background errors use fixed messages. CI container smoke now configures a disposable PostgreSQL certificate and trusted CA. Runtime-role CI initially failed (run 35727645655) because pool.query discarded a connection after a deliberately denied statement; the test now pins one client and sets session authorization to the restricted role, preventing admin-session escalation. No staging mutation occurred. Typecheck PASS; local suite 22 total /20 PASS /0 FAIL /2 native-only SKIP; revised native/TLS CI pending.

## M1 Staging Phase A–E — 2026-09-22 (current checkpoint)

Owner authorized existing Railway Trial only; no upgrade/paid service, merge PR #2, M2 or production. LINE remains disabled even after A–E. Codex owns this work in the isolated M1 checkout; paused root M2 files are untouched.

- PASS: PR #2 head 3f92930, Draft/not merged/mergeable; CI [35718682955](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35718682955) success. Dashboard Trial shows $5.00/30 days at inspection.
- PASS (Phase A partial): Postgres 18.6 read-only console checks: TLS enabled, private hostname SAN, verify-full connection reports TLSv1.3/256 bits. SQL statement logging=none; error statement logging=error, parameter logging=-1/0. No secret values were read. These settings are not a claim that all provider logs are secret-free.
- CODED: one-time NOLOGIN runtime/migration role script and native privilege test; no staging role mutation yet. Typecheck PASS; local tests 21 total / 19 PASS / 0 FAIL / 2 native-only SKIP; native test awaits CI. See [M1_DATABASE_SECURITY](M1_DATABASE_SECURITY.md).
- NOT_RUN: actual runtime role/password and API TLS/log scan; B API HTTPS/security; C Web login/logout/expiry/mobile; D fixtures/scope/restart; E isolated backup/restore. No Web URL, no UAT claim, not Ready to Merge.

Historical checkpoints below are superseded by this section where different.

## Bootstrap Owner บน Railway — 2026-09-22

Owner ยืนยันกรอกตัวแปรแล้ว Codex ตรวจเฉพาะชื่อ BOOTSTRAP_USERNAME/BOOTSTRAP_PASSWORD และค่าถูกปิดบัง ไม่เปิดหรือคัดลอกรหัส Deployment 13df75fd-935d-4f60-b3c0-c82f67a3b96b จาก f12f66c ใช้ pnpm bootstrap/Never restart จบ Completed; runtime log ยืนยัน Owner created; password not logged. UI เคยตอบ500ตอนกดDeploy แต่ตรวจพบงานเริ่มแล้วจึงไม่สั่งซ้ำ

CI ของ f12f66c: [35711131799](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35711131799) SUCCESS. Bootstrapสำเร็จเป็นหลักฐาน migration/สร้างบัญชีบนPostgreSQL18 ไม่ใช่ผลLogin/HTTPS/UAT. Webยังไม่เปิด LINEปิด PR#2ยังDraft ไม่Merge/M2/Production/อัปเกรดเสียเงิน

Owner อนุมัติถอน bootstrap และยืนยันเฉพาะ DATABASE_URL ใน api เพิ่มหลัง automatic approval review ปฏิเสธครั้งแรกแล้ว จึงลบเฉพาะตัวแปรทั้ง3และ apply สำเร็จ: cleanup deployment e49929ec-3dde-4f72-9543-84620c1ae01d Completed; งาน13df75fd/4a27f1daเดิมเป็น Removed. ค่าปัจจุบันของapiเหลือ5variablesไม่มีbootstrap/DBผู้ดูแล; commandชั่วคราวเพียงพิมพ์สถานะแล้วจบทันที ไม่มีHTTPหรือDBconnection, restart Never, Auto deploy disabled. ไม่ลบฐานข้อมูล/บัญชีOwner และไม่อ้างว่าmetadataของdeploymentเก่าถูกลบหมด. ขั้นถัดไป: เตรียมruntime DB roleที่ไม่มีDDL/credentialผู้ดูแล, ตรวจTLS/HTTPS/backup/restoreก่อนให้ผู้ทดลองเข้าใช้


## สถานะส่งต่อ Railway — 2026-09-22

- GitHub App: บันทึกและตรวจ Only select repositories = asas-job-cost-workforce-core เพียง1repo; Railway มองเห็น source แล้ว ไม่ต้องขออนุมัติสิทธิ์เดิมซ้ำ
- PostgreSQL18 template บน volume เปิด Online แล้วใน Trial เป็นฐานใหม่ ไม่มี app schema/ข้อมูลผู้ทดลอง; ไม่ถือ DEPLOYED_STAGING ของทั้งแอป
- API build ครั้งแรก 7c0efb71 ล้มเหลวที่ Railpack prepare: ใช้ main/M0 และ0variables ไม่ได้เริ่ม runtime. แก้ staging configuration เป็น branch codex/milestone-1-foundation + deploy/Dockerfile.api แล้ว แต่ยังไม่ deploy ใหม่
- API มี9 staged changes: 6variables (Dockerfile/NODE_ENV/HOST/PORT/LINE_ENABLED=false/DATABASE_URL reference), branch M1, restart NEVER, start pnpm bootstrap; Auto deploy disabled. Credential Postgres ผู้ดูแลใช้เฉพาะ bootstrap jobชั่วคราว ห้ามใช้เปิด HTTP runtime ต้องเปลี่ยนเป็น runtime roleและถอนbootstrap varsก่อน
- รอ Owner กรอก BOOTSTRAP_USERNAME/BOOTSTRAP_PASSWORD ใน Railway Variables เองอย่างน้อย12ตัว ไม่ส่งรหัสในแชท ไม่ใช้รหัส demo เดิม ยังไม่กด Deploy จนตรวจค่าตั้งต้นครบ
- ยังไม่สร้าง Web/worker; HTTPS/UAT/restore/DB role/TLS/real LINE ยัง NOT_RUN; ไม่อัปเกรดแผน/merge PR #2/M2/Production
- ข้อควรระวัง: Railway Deploy Changes อาจรวมบริการอื่นที่เปลี่ยนค้างไว้ ต้องตรวจ source commit/branch/commandของทุกserviceก่อนกด ไม่ถือรายการท้ายmodalว่าเป็นบริการเดียวที่จะเริ่ม


อัปเดตผล: commit 0d68bba push แล้ว; [CI 35709354964](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35709354964) SUCCESS ทุก step รวม native PostgreSQL, Next build, Docker Web/API build และ smoke health ทั้งสอง container, M0 45 checks. Owner อนุมัติ Railway GitHub App เฉพาะ Repository นี้แล้ว ตรวจพบ installation มีอยู่และเลือก All repositories จึงลดเป็น Only select repositories /asas-job-cost-workforce-core และตรวจค่าที่บันทึกแล้วสำเร็จ App เดิมมี read/write actions, administration, checks, code, statuses, deployments, PRs, workflows ไม่ได้เพิ่มชนิดสิทธิ์; ยังไม่ deploy.


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

Job UI patch จาก task Reviwer: เพิ่มรายการข้างฟอร์มและผลสำเร็จ/ข้อผิดพลาดใกล้ปุ่ม หลัง POST สำเร็จล้างฟอร์มทันที; GET refresh fail แสดงคำเตือนว่าบันทึกแล้วไม่ชวนสร้างซ้ำ. ยังไม่พิสูจน์สาเหตุ Job เดิมที่ Owner รายงาน และไม่ถือว่าผ่าน browser/UAT ของ patch. ไม่มี migration ใหม่

หลักฐานเพิ่ม: code patch de99037 CI [36009851061](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36009851061) SUCCESS ครบ Local/Native PostgreSQL17/typecheck/build/API+Web containers/smoke/M0. เพิ่ม Owner-specific POST Job/GET ซ้ำสองครั้งด้วย Project สมมติไม่มี Site แล้ว targeted alignment10/10 PASS โดย task Reviwer; CI ของ test follow-up80c2868 SUCCESS ตามลิงก์ด้านบน ไม่ใช่การยืนยัน Job จริงที่ Owner รายงานหรือ Deploy patch

## สถานะแวดล้อมที่ตรวจ 26 กันยายน

- Fetch origin แล้ว branch ไม่ตกหลัง main (main-only0 / branch-only70 ณ commit e9700b6)
- Railway read-only: Trial=true เครดิตประมาณ USD4.5588 เหลือ26วัน ไม่เปลี่ยนแผน/บริการ
- Browser Staging ปัจจุบันเป็นหน้า Login จึงยังไม่ยืนยัน Web TECH Job scope ผ่านหน้าจอ ไม่อ่านหรือเปลี่ยนรหัสบัญชีจริง
- [CI36242156339](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36242156339) commit e9700b6: NativePostgreSQL53PASS/0SKIP/0FAIL, embedded51PASS/2NativeSKIP, typecheck/productionbuild/API+Webcontainer/smoke/เอกสาร PASS; local regression51PASS/2NativeSKIP/typecheck/เอกสาร45checksผ่าน

เพิ่ม M1_REMAINING_ACCEPTANCE_GATES.md แยกหลักฐานจริง/ส่วนขาด/วิธีเดินหน้าภายใต้scope ไม่ลดDoDหรือเติมPASS

26กันยายน: CIล่าสุดผ่านครบตามลิงก์ข้างต้น ไม่Deploy; browserStagingยังNOT_RUN และคำถามผู้รับผิดชอบbackupยังรอคำตอบ
