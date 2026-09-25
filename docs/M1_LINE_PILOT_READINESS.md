# M1 LINE Pilot — Readiness 25 September 2026

## 25 กันยายน 2026 — Admin/TECH เห็นงานแล้ว และเริ่มตรวจถอนสิทธิ์

Owner ยืนยัน TECH เห็นงานและ ADMIN เห็น A/B; runtime ตรวจบัญชี active/เชื่อม LINE/อยู่ใน allowlist ตรงกัน โดย TECH เห็นเฉพาะ PRJ-2609-014 และ ADMIN เห็น PRJ-2609-014/015 ก่อนถอนสิทธิ์. ADMIN_ACCOUNT_LINK / ADMIN_LINE_JOBS และ TECH_LINE_JOBS ก่อนถอน = UAT_PASSED จากรายงาน Owner ร่วมกับ runtime ไม่ใช่ภาพโทรศัพท์ที่ระบบตรวจเอง. A/B เป็น Project ทดสอบ ไม่ใช่ Job สองรายการ. สถานะนี้แทนการพัก Admin ก่อนหน้า

R2-06 ถอนเฉพาะ assignment ระดับ Project ของ TECH ใน PILOT LINE A ผ่าน deployed Application แล้ว: backend PASS, เหลือ Pilot project ที่มองเห็น 0, assignment นอก Pilot ไม่เปลี่ยน, audit ASSIGNED 1 / ASSIGNMENT_REVOKED 1. ปิด operator สมมติและ session หลังตรวจ เก็บ audit ไว้ ไม่แก้ข้อมูลจริง ไม่เก็บชื่อบัญชีหรือรหัสลับในเอกสาร

**ขั้นต่อไป:** ให้ TECH ส่ง “งานของฉัน” ใหม่ ต้องไม่แสดงโครงการที่ได้รับมอบหมายใน Pilot; ข้อความเก่าในแชทไม่ถูกลบ. ผลหลังถอนบนโทรศัพท์ = WAITING_USER. ยังไม่มอบหมาย Job B จนตรวจขั้นนี้ผ่าน. ADMIN ยังคงเห็น A/B. Replay/expiry และ Staging browser restore ยังไม่ผ่านครบ จึงยังไม่รับ M1 ทั้งหมด

ไม่มี code/schema/deploy/merge หรือค่าใช้จ่ายเพิ่ม. CI เดิม 36109173357: Native PostgreSQL 52/52 PASS; รอบนี้ตรวจเอกสารและ diff เท่านั้น

## ประวัติก่อนผลล่าสุด (ไม่ใช่คำสั่งปัจจุบัน)

## คำสั่งล่าสุด — พัก Admin LINE

Ownerให้ข้ามLINEAdminไปก่อน: DEFERRED_BY_OWNER ไม่ใช่PASS. ใช้Ownerที่เชื่อมแล้วทำgroupbindingตามสิทธิ์OWNER/ADMINเดิมต่อได้ ไม่เพิ่มscopeหรือเปลี่ยนrole. คำสั่งให้Adminเชื่อมในประวัติด้านล่างพักไว้จนOwnerกลับมาทดสอบ รอผลกลุ่ม/TECH/revoke/expiry และRestore gatesก่อนรับM1ทั้งหมด ดู [สถานะกลาง](PROJECT_STATUS.md)

## สถานะปัจจุบัน — เปิด LINE กลับหลังรับ Admin ใหม่

Adminลงทะเบียนเข้าขอบเขตทดลองแล้วและบันทึกRailwayเรียบร้อย; API/workerLINE=true/enrollment=false. OWNER/TECHเดิมยังเชื่อมอยู่ ไม่ต้องสมัครใหม่. Adminส่ง “เชื่อมบัญชี” แล้วLoginบัญชีADMINของตนและยืนยัน; TECHส่ง “งานของฉัน” ใหม่ต้องเห็นPILOT LINE Aเท่านั้น. Group/revoke/expiryยังไม่ผ่านจริง รายละเอียดและdeploymentล่าสุดดู [สถานะกลาง](PROJECT_STATUS.md). ข้อความพัก/enrollment/รอAdminส่งในส่วนประวัติด้านล่างถูกแทนด้วยสถานะนี้

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
