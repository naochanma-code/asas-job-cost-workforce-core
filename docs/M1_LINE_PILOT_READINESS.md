# M1 LINE Pilot — Readiness 25 September 2026

## สถานะปัจจุบัน — รับ Admin ใหม่ตาม D-034

พักbusiness LINE: API false/enrollment true; worker falseและหยุดแล้ว. OWNER/TECHเชื่อมคงเดิม ช่างได้รับเฉพาะassignmentสมมติAแล้ว. OwnerขอLINEAdminใหม่ที่ยังไม่เคยสมัคร ใช้รหัสส่วนตัวช่อง1จากหน้าOwnerเท่านั้น ไม่ต้องส่งอีก2ช่องหรือกลุ่ม. หลังรับเก็บ2บัญชีที่เชื่อมแล้ว + Adminใหม่ รวม3คนก่อนปิดenrollment/เปิดbusiness. ระหว่างนี้ไม่มีreplyของงาน/เชื่อมบัญชี ไม่ใช่รหัสเสีย. ผลท้ายรอบดูPROJECT_STATUS

## รอบถัดไป — Admin/TECH/กลุ่ม

Owner ยืนยันให้พัก Rich Menu จนส่วน LINE ของ Milestone ครบ. รันคำสั่งข้อความต่อได้ ดู [รอบทดสอบล่าสุด](M1_LINE_PILOT_ROUND_2.md). Runtime ยืนยัน OWNER เชื่อมหนึ่งบัญชี; Admin/TECH ยังไม่เชื่อมและกลุ่มยังไม่ผูก ณ เวลาตรวจ ไม่ต้องให้ Owner เชื่อมซ้ำ

สถานะ **BOUNDED_LINE_ENABLED / OWNER_JOBS_UAT_PASSED** ภายในTrialเดิมตามD-030/ADR-012และD-033

API/Web/worker exactdc289ee3088cd84639cc828b49a6f5c50a665f55 SUCCESS; CI NativePG50/50/container PASS;24fixture/HTTPS/ratechecks,21HTTPSrolechecks,16worker/runtime/mockqueuechecks PASS. Providerworkerstop/startผ่านและofficialLINEVerify200หลังเปิดbusinessmode. ไม่มีmigrationหรือpaidserviceใหม่

Enrollmentครบและpersistแล้ว ปิดenrollment; LINEtrueเฉพาะ3users/1group/2ProjectสมมติAไม่มีSiteJob/BมีSiteJob API/workerallowlistsตรงกัน ไม่เปิดProjectจริงแม้OWNER และสิทธิ์role/assignmentยังบังคับ ไม่มีpublicdomainของAPI/worker

## ผล Owner ล่าสุด

Owner แจ้งพร้อมภาพว่า “งานของฉัน” แสดง PILOT LINE A/B ถูกต้องแล้ว ไม่ต้องทำซ้ำ. เมนูเก่ายังค้าง; แผนเปลี่ยน Rich Menu ยังไม่ Deploy. Admin/TECH/group/revoke/expiry ยังรอทดสอบจริง

## วิธีเชื่อมสำหรับผู้ทดลองคนถัดไป

ส่ง “เชื่อมบัญชี” ในแชทส่วนตัว @ASAS-WORK เปิดลิงก์ Loginด้วยบัญชีแอปของผู้ทดลองคนนั้น กด “ยืนยันเชื่อมบัญชี” แล้วกลับLINEส่ง “งานของฉัน” คาดเห็นPILOT LINE A/Bเท่านั้น แจ้งผลโดยไม่ส่งลิงก์มีรหัส/Secret/Password. Ownerผ่านแล้ว ให้Admin/TECHใช้บัญชีตนในรอบนี้ ไม่ต้องสมัครใหม่

## ข้อจำกัดที่คงไว้

- Owner JOBS ผ่านตามผลบนโทรศัพท์; link ทุกขั้น/Admin/TECH/group/revoke/nonceexpiry และ OwnerUAT รวมยังไม่ครบ
- sharedproxybucketผ่านboundedtestsแต่ยังไม่เหมาะscale; global120/minผ่านlocal/CIเท่านั้น
- EdgeHTTPlogsรอบนี้0แถว ไม่รับรองlogsทุกชั้น; ย้ายtokenไปfragmentไม่ส่งCoreAppHTTPqueryและclientล้างทันที deploymentlogsampleไม่พบsecretpatterns
- QueuepayloadTTL24hได้รับอนุมัติแล้ว workerกวาดทุกloop/startupและไม่claimของหมดอายุ การล้างphysicalรอworkerเมื่อproviderdown ต้องตรวจoverdueก่อนresume; ไม่มีการลบevent/status/Audit
- manualbackup/isolatedrestoreเดิมผ่าน แต่scheduledbackup/PITR/restoreWebLoginยังไม่ครบ ไม่ถือM1พร้อมMerge/Production

## หลังจบรอบหรือพบปัญหา

ปิดLINEทั้งAPIและworker หยุดworkerdeploymentตรวจdeploymentStopped=true; ไม่ใช้ปิดAPIแทนหยุดworker ไม่replayreplytokenเก่าหรือfallbackpush. ห้ามเปิดscopeกว้างเพื่อแก้ปัญหา หยุดเมื่อsecret/ข้อมูลจริง/เครดิตมีความเสี่ยง ไม่มีupgradeเอง. Trialล่าสุดประมาณUSD4.7354/28วัน

[สถานะกลาง](PROJECT_STATUS.md) · [หลักฐาน](M1_TEST_EVIDENCE.md) · [Owner Setup](M1_LINE_OWNER_SETUP.md)
