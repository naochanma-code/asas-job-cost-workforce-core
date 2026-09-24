# M1 LINE Pilot — Readiness 24 September 2026

สถานะ **ENROLLMENT_REAL_PASS / SCOPE_PERSISTED / BUSINESS_LINE_NOT_ENABLED** ตาม D-030/ADR-012 Ownerอนุมัติ OA/กลุ่มทดสอบกับโอ๋ ฟ้า ช่าง1คน ภายในTrial และเปลี่ยนWebhookเดิมได้ ไม่อนุมัติMerge/M2/M3/Production/ค่าใช้จ่ายเพิ่ม

## สิ่งที่ผ่านแล้ว

- API exactd5aa567 SUCCESS; Web84df39cเดิม; CI36025270535 NativePG48/48/typecheck/build/containers/smoke/M0 PASS; post-deploy app.injectแยกprocess/runtimePG27checks PASS, HTTPShealth200 และofficialwebhookVerify200ซ้ำผ่าน
- HTTPS38checks ด้วยบัญชีสมมติผ่าน; บัญชีปิดหลังตรวจ ไม่แก้ข้อมูลจริง
- OwnerกรอกChannelSecretในAPI/AccessTokenในworkerผ่านRailway; applyเฉพาะ2stagedchangesแบบskipDeploys ตรวจbotinfoตรงOA และตั้งBotIDอย่างส่วนตัว PayloadKeyสุ่ม32bytesตั้งตรงstdin ไม่แสดงค่า
- LINE official GET webhook endpointยืนยันตรงWebStagingและactive; POST webhook/test: success=true,statusCode200,reasonOK ไม่มีการส่งแชทจากระบบ
- API LINE_ENABLED=false / LINE_ENROLLMENT_ENABLED=true; worker LINE_ENABLED=false ยังไม่มีsource/deployment/domain
- log sample100linesต่อdeploymentอ่านสำเร็จไม่พบsecret patterns (ไม่ใช่รับรองlogsทุกชั้น); TrialเหลือประมาณUSD4.792/28วัน ไม่มีupgrade

## ขั้น Owner ผ่านแล้ว

ลงทะเบียนจริงครบ3คน/1กลุ่มแล้ว กดตรวจผลยืนยันก่อนdeployhotfix และเก็บexactIDsในRailway API/workerแล้ว ไม่ต้องส่งรหัสซ้ำแม้รอบหมดอายุ รอtechnicalgatesก่อนเชื่อมบัญชีตาม [Owner Setup ข้อ3](M1_LINE_OWNER_SETUP.md). ไม่ส่งcodes/IDsในChat/GitHub

Enrollmentรับเฉพาะsignature/destinationถูกต้อง+รหัสตรง รอบสูงสุด3users/1groupในmemory ไม่เก็บrawmessage ไม่linkaccount ไม่queueoutbox ไม่ส่งreply ไม่มีauto-allowlist. เริ่มใหม่หลังexpiry/restartได้ เป็นtemporarypilotไม่ใช่publicregistration

## ขั้นที่ Codex ต้องทำก่อนเปิด business LINE

1. User/Group IDsครบและpersistแล้ว API/workerตรงกัน ยังต้องตั้ง LINE_TEST_PROJECT_IDS เป็นProjectสมมติ Aไม่มีSiteJob/BมีSiteJobเท่านั้น ทั้งAPIและworker ไม่มีwildcard ไม่เปลี่ยนข้อมูลจริง
2. ตรวจ remainingTrial, ตั้งworkerprivateจากexactCI-passedSHA ไม่มีpublicport, ตรวจruntimeTLS/start/stop/retry/dedupe/DEAD recovery ใช้simulationก่อนlive จัดการsharedproxyและedge checksที่ยังค้างตามmatrix
3. ปิด LINE_ENROLLMENT_ENABLED ก่อนเปิด LINE_ENABLED ทั้งAPI/worker; ห้ามเริ่มขณะallowlistไม่ครบ ห้ามคิดว่าการเปลี่ยนAPIflagจะหยุดworkerเดิม
4. ทดสอบ link/งานของฉัน/groupbinding/revoke/expiry/replay ตามchecklistด้วยsyntheticProjects; ตรวจสิทธิ์ก่อนprocessและdeliveryโดยscopeintersection ไม่ส่งprojectจริงแม้OWNER
5. บันทึกผลแต่ละflowแยกautomated/OwnerUAT ปิดLINEและหยุดworkerหลังจบรอบ ก่อนรอบใหม่ตรวจscope/creditอีกครั้ง

## หยุดเมื่อผิดปกติ

ปิดLINEทั้งสองmode หยุดworkerและwebhook ไม่replayreplytokenเก่า ไม่fallbackpush ไม่ลบaudit. ถ้าพบsecret/ข้อมูลจริงผิดscope/Trialไม่พอให้หยุดแจ้งOwner ไม่มีการเพิ่มpaidserviceหรือเปิดproductionเพื่อแก้ปัญหา

## ยังไม่ผ่าน

workerdeployment/lifecycle, accountlink/JOBS/group/revoke, realnonce/codeexpiry และ M1OwnerUATรวมยังNOT_RUN. Manualbackup/isolatedrestoreเดิมผ่านแต่scheduledbackup/PITR/restoreWebLoginยังไม่ทำ ดูmatrix; ไม่ใช้คำว่าM1เสร็จหรือพร้อมMerge
