# M1 LINE Pilot — Readiness 25 September 2026

สถานะ **BOUNDED_LINE_ENABLED / WAITING_OWNER_LINK_UAT** ภายในTrialเดิมตามD-030/ADR-012และD-033

API/Web/worker exactdc289ee3088cd84639cc828b49a6f5c50a665f55 SUCCESS; CI NativePG50/50/container PASS;24fixture/HTTPS/ratechecks,21HTTPSrolechecks,16worker/runtime/mockqueuechecks PASS. Providerworkerstop/startผ่านและofficialLINEVerify200หลังเปิดbusinessmode. ไม่มีmigrationหรือpaidserviceใหม่

Enrollmentครบและpersistแล้ว ปิดenrollment; LINEtrueเฉพาะ3users/1group/2ProjectสมมติAไม่มีSiteJob/BมีSiteJob API/workerallowlistsตรงกัน ไม่เปิดProjectจริงแม้OWNER และสิทธิ์role/assignmentยังบังคับ ไม่มีpublicdomainของAPI/worker

## ขั้น Owner

ส่ง “เชื่อมบัญชี” ในแชทส่วนตัว @ASAS-WORK เปิดลิงก์ LoginOwnerของโอ๋ กด “ยืนยันเชื่อมบัญชี” แล้วกลับLINEส่ง “งานของฉัน” คาดเห็นPILOT LINE A/Bเท่านั้น แจ้งผลโดยไม่ส่งลิงก์มีรหัส/Secret/Password. ทำOwnerก่อนหนึ่งคน แล้วAdmin/TECHใช้บัญชีตนตามรอบถัดไป ไม่ต้องสมัครใหม่

## ข้อจำกัดที่คงไว้

- realaccountlink/JOBS/group/revoke/nonceexpiry/OwnerUATยังไม่ผ่านเพียงเพราะserviceเปิด ต้องตรวจผลจริง
- sharedproxybucketผ่านboundedtestsแต่ยังไม่เหมาะscale; global120/minผ่านlocal/CIเท่านั้น
- EdgeHTTPlogsรอบนี้0แถว ไม่รับรองlogsทุกชั้น; ย้ายtokenไปfragmentไม่ส่งCoreAppHTTPqueryและclientล้างทันที deploymentlogsampleไม่พบsecretpatterns
- QueuepayloadTTL24hได้รับอนุมัติแล้ว workerกวาดทุกloop/startupและไม่claimของหมดอายุ การล้างphysicalรอworkerเมื่อproviderdown ต้องตรวจoverdueก่อนresume; ไม่มีการลบevent/status/Audit
- manualbackup/isolatedrestoreเดิมผ่าน แต่scheduledbackup/PITR/restoreWebLoginยังไม่ครบ ไม่ถือM1พร้อมMerge/Production

## หลังจบรอบหรือพบปัญหา

ปิดLINEทั้งAPIและworker หยุดworkerdeploymentตรวจdeploymentStopped=true; ไม่ใช้ปิดAPIแทนหยุดworker ไม่replayreplytokenเก่าหรือfallbackpush. ห้ามเปิดscopeกว้างเพื่อแก้ปัญหา หยุดเมื่อsecret/ข้อมูลจริง/เครดิตมีความเสี่ยง ไม่มีupgradeเอง. Trialล่าสุดประมาณUSD4.7354/28วัน

[สถานะกลาง](PROJECT_STATUS.md) · [หลักฐาน](M1_TEST_EVIDENCE.md) · [Owner Setup](M1_LINE_OWNER_SETUP.md)
