# PROJECT STATUS — Milestone 1

อัปเดต 24 กันยายน 2026 · Module owner: Codex (Foundation/API/LINE/เอกสาร); task Reviwer ดู design reference · branch codex/milestone-1-foundation · PR #2 ยัง Draft / ไม่ Merge

## ตอนนี้ถึงไหน

**ลงทะเบียน LINE ได้ครบ 3 คนและ 1 กลุ่มแล้ว** ตรวจจากปุ่มตรวจผลบนหน้า Owner จริง ได้รับแล้วทั้ง 4 ช่องและ complete=true ก่อนติดตั้ง hotfix. นำขอบเขตไปเก็บใน Railway Variables ของ API และให้ worker อ้างอิงค่าเดียวกันแล้ว ไม่ต้องลงทะเบียนซ้ำ แม้รอบในหน้าเว็บหมดอายุหรือ API รีสตาร์ท

ยังไม่เปิดเชื่อมบัญชี/งานของฉัน/ผูกกลุ่ม: LINE_ENABLED=false ทั้ง API/worker, worker ยังไม่มี deployment. การลงทะเบียนครั้งนี้ไม่ใช่การเชื่อมบัญชีแอปหรือการตรวจรับ M1 ทั้งหมด

- [Web Staging](https://web-staging-cb6f.up.railway.app/)
- API: d5aa5675b426408609166ebf0744dc3a557d3d1e, deployment 8e0b8403-c007-4f50-a0e3-7ad4e4a17f9b SUCCESS
- Web: 84df39ce386d4892c943baae36822084a3421a4a, deployment 88979aa4-f253-42f1-a154-9b3cb432e401 เดิม ไม่มี Web change ใน hotfix
- ไม่มี migration ใหม่ ไม่แก้ข้อมูลจริง ไม่มีการเพิ่มบริการหรือเปลี่ยนแผน Railway

## สถานะตาม Definition of Done

| รายการ | สถานะและหลักฐาน |
| --- | --- |
| CODED | PASS — Foundation/Alignment + bounded LINE scope/enrollment/worker guards และ D-031 รับรหัสอย่างเดียวหรือคำสั่งเต็ม |
| TESTED_LOCAL | PASS — regression enrollment 3/3 + typecheck; รอบก่อน full local45PASS/2nativeSKIP |
| TESTED_CI | PASS — CI36025270535: 46PASS/2nativeSKIP แล้ว Native PostgreSQL48PASS/0SKIP; typecheck/build/API+Web containers/smoke/M0 ผ่าน |
| DEPLOYED_STAGING | PASS — API exact d5aa567; Web exact84df39c |
| TESTED_STAGING_HOTFIX | PASS — 27checks แบบ app.inject ใน process แยกใช้ runtime PostgreSQLและบัญชีสมมติ; DB TLS/privileges/schemaผ่าน; ปิดบัญชีหลังตรวจ; queues/accounts/bindingsไม่เพิ่ม ไม่ใช่ผล live chat หรือ HTTP27ข้อ |
| HTTPS / REAL_WEBHOOK_VERIFY | PASS — หลัง hotfix /api/health200; official LINE webhook test success=true/statusCode200; endpointตรงและactive |
| LINE_ENROLLMENT_REAL | PASS — ก่อน hotfix Owner refreshผลได้3ผู้ใช้ไม่ซ้ำ/1กลุ่มครบ; exact IDsเก็บในRailwayโดยไม่แสดงค่า; API/worker scopeตรงกัน ไม่มีauto-grant |
| LINE_WORKER | PREPARED / NOT_DEPLOYED — LINE_ENABLED=false, ยังไม่มีsource/deployment/domain; ขอบเขตUser/Groupตั้งแล้ว เหลือProjectallowlistและgates |
| REAL_LINE_LINK/JOBS/GROUP/REVOKE | NOT_RUN — ยังไม่เปิด business LINE |
| OWNER_UAT_JOB_CREATE / MOBILE | PASS ตามคำยืนยัน Owner รอบก่อน |
| OWNER_UAT_ALL_M1 | PARTIAL — Webบางflowและenrollmentผ่าน ยังไม่รับM1ทั้งหมด |
| BACKUP/RESTORE | PASS แบบmanual snapshot/isolated recoveryรอบก่อน; scheduledbackup/PITR/keyescrowข้ามเครื่องยังไม่มี |
| MERGE / M2 / M3 / PRODUCTION | NOT_AUTHORIZED — ยังไม่ดำเนินการ |

## สิ่งที่ Owner ต้องทำต่อ

ตอนนี้ไม่ต้องส่งรหัสซ้ำ ไม่ต้องกรอก Secret/Token ใหม่ และใช้ OA เดิมได้. การย้าย Webhook ไม่ย้ายข้อมูลเชื่อมบัญชีของแอปเก่า ต้องเชื่อมบัญชี CoreApp เมื่อ operator แจ้งว่ารอบใช้งาน LINE พร้อมแล้ว

## ขั้นต่อไปของ Codex / ข้อจำกัด

1. ตั้ง exact Project allowlist เฉพาะโครงการสมมติ A ไม่มีSite/Job และ B มีSite/Job ห้ามใช้ข้อมูลจริง
2. ตรวจ private worker sourceSHA/TLS/start-stop/retry/dedupe/DEAD recovery ด้วยsimulationก่อนlive; ปิด enrollmentก่อนเปิด business LINE และตรวจเครดิต Trial ก่อนเริ่มworker
3. ตรวจ live rate-limit/sharedproxy, edge/querylog และข้อค้างใน [Test Matrix](M1_STAGING_TEST_MATRIX.md). ต้องกำหนดการเก็บ encrypted queue payload/DEAD ให้ชัดก่อนlive ตามrunbook; ไม่เปลี่ยนรายการเหล่านี้เป็นPASSจากlocaltests
4. เมื่อgatesครบจึงทดลอง link → งานของฉัน → group → revoke/expiry/replay กับผู้ลงทะเบียนเดิม แล้วปิดworker/LINEหลังจบรอบ

Railway ยังเป็น Trial; อ่านล่าสุดก่อน hotfixเหลือประมาณ USD4.790/28วัน ไม่ใช่ยอดคงเหลือแบบเรียลไทม์ ไม่มีupgradeหรือpaidserviceใหม่. ถ้าเครดิตไม่พอให้หยุดแจ้งOwner

## หลักฐาน

[CI36025270535](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36025270535) · [Test Evidence](M1_TEST_EVIDENCE.md) · [LINE Readiness](M1_LINE_PILOT_READINESS.md) · [Owner Setup](M1_LINE_OWNER_SETUP.md) · [ADR-012](adr/012-bounded-line-pilot.md)

M1อยู่ใน .local/m1-staging โฟลเดอร์หลักเป็นM2ที่พักไว้ มีเพียงpointerให้อ่านสถานะM1 ไม่รวมsource/schemaM2. [UI Design Direction](UI_DESIGN_DIRECTION.md) เป็นDESIGNED_REFERENCE ยังไม่ใช่UIที่deploy
