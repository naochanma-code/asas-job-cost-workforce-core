# PROJECT STATUS — M1 Alignment v3.0

อัปเดต 23 กันยายน 2026 · Module owner: Codex · Branch codex/milestone-1-foundation · Draft PR #2

## ตอนนี้ถึงไหน

Foundation เพิ่มข้อมูล Project/Job, ประเภทที่ตั้งค่าได้ และสิทธิ์ PM ตาม D-022 แล้วในโค้ด กำลังตรวจ CI ก่อนเสนออนุมัติย้ายรุ่น ยังไม่ deploy migration003 หรือ Web/API รุ่นใหม่ไป Staging และไม่เริ่ม M2/M3/Expense/Payroll/Real LINE

| Definition of Done | สถานะ / หลักฐาน |
| --- | --- |
| DESIGNED | Master v3.0 + D-021/D-022/D-023 + ADR-011 และ migration plan |
| CODED | Types5/10, operational fields, code generation, PM TECH assignment/revoke, scoped TECH jobs, audit, Web forms |
| TESTED_LOCAL | 32 PASS / 2 native-only SKIP / 0 FAIL; typecheck/build PASS; M0 45 checks PASS |
| TESTED_INTEGRATION | รอ CI Native PostgreSQL และ Docker รุ่นใหม่; ไม่ใช้ CI baselineแทนรุ่นนี้ |
| DEPLOYED_STAGING | รุ่นเก่า4fcb29eเท่านั้น; Alignment003 NOT_DEPLOYED |
| REAL_INTEGRATION_TESTED | Real LINE NOT_RUN/ยังปิด |
| UAT_PASSED | M1 ยังไม่ accepted; Ownerผ่าน5flowรุ่นเก่า/ADMIN PILOT A/Bบางส่วน ไม่ใช้แทนAlignmentUAT |
| PRODUCTION_READY | NO; PR#2ไม่merge |

## สิ่งที่เพิ่มและสิ่งที่คงไว้

- Project Typeเริ่ม5: Installation/Service/Survey/POC/Other ตามคำตอบ Owner; Job Type10 ตามMaster เพิ่ม/แก้ชื่อ/เรียง/เปิดปิดผ่านAdmin/Owner ไม่hardcodeในFrontend
- Projectรองรับtype/PM/วันเริ่ม/วันจบ/priority/description/progressและ4สถานะ; Site/Jobยังoptional ไม่มีJobปลอม
- Jobรองรับtype/description/ผู้รับผิดชอบ/วันที่วางแผน/5สถานะ/progress/creator/time; TECH job-onlyเห็นเฉพาะJobตน
- PMเพิ่มถอนเฉพาะTECHในProjectที่ตนเป็นPM ห้ามแตะบัญชี/Role/Owner/Admin/PMassignment การตรวจอยู่Backendพร้อมaudit
- รหัสใหม่PRJ-YYMM-NNNและJOB-projectNamespace-NNใช้atomiccounter/registry รหัส/UUIDเดิมไม่เปลี่ยน
- Expense D-022เป็น[ข้อกำหนดทดสอบอนาคต](M3_EXPENSE_TEST_PLAN.md) ไม่มีExpenseAPI/table/menu

## Migration / ความเสี่ยง

เพิ่มเฉพาะ003_m1_alignment.sql ไม่แก้001/002 BackfillOther/defaults/null; legacyJobcreator/dateอ้างProjectเป็นfallback; primaryPMเติมเมื่อมีmembershipเดียว ที่มีหลายPMไม่ลบสมาชิกเก่า ดู[แผนDryRun/Recovery](M1_ALIGNMENT_MIGRATION_PLAN.md)

Backupformat2เพิ่มtypes/counters/reservations Format1ต้องกู้ด้วยรุ่นเก่าลงฐานใหม่ก่อนmigrate APIรุ่นเก่าstrictschemacheckไม่รองรับ003ตอนrestart ต้องmaintenanceและdeployคู่กัน ใช้migrationroleแยก/grantsเฉพาะตารางใหม่ ไม่มีDDLในruntime

ฐานStagingมีข้อมูลจริงปน ห้ามใช้ทดสอบ ไม่คัดลอก/ลบ/แก้รายการจริงรอบนี้ การสำรองและrecoveryข้อมูลจริงต้องอยู่ในขอบเขตที่Ownerอนุมัติก่อนmigration

## หลักฐานก่อนแก้

Fetch/fast-forwardถึง543a899; [CI baseline](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35863738772) SUCCESS; PR#2Draftไม่Merge/ไม่มีconflict/behindmain0; executable001/002 บนbranch; StagingHTTPShealth200/database readyแบบอ่านอย่างเดียว ไม่อนุมานว่าAlignmentdeployแล้ว

## ขั้นต่อไปและสิ่งที่รอ Owner

1. Codex ตรวจCI Native PostgreSQL/containerและสรุปrelease/evidenceให้ครบ
2. Ownerยังไม่ต้องสลับบัญชีทดสอบ รอรุ่นที่พร้อมตรวจเป็นรอบเดียว
3. เมื่อtestsผ่าน ให้OwnerอนุมัติStagingmigration/deployพร้อมช่วงmaintenanceและprivatebackupที่กู้ได้ก่อนลงมือ; ขณะนี้ยังไม่อนุมัติ

สถานะตอนนี้: ยังไม่พร้อมDeployจนCIและpreflightพร้อม ไม่เปิดLINE ไม่ใช้บริการเสียเงิน/upgrade ไม่Merge PR#2 ไม่เริ่มM2/M3/Production

## ไฟล์กลาง

งานM1อยู่ที่ .local/m1-staging โฟลเดอร์หลักยังเป็นbranchM2ที่พักไว้ ห้ามนำmigration003_time_entries.sqlจากM2มาปนในM1 ดู[หลักฐาน](M1_TEST_EVIDENCE.md), [GapAnalysis](MASTER_V3_GAP_ANALYSIS.md), [ประวัติStaging](M1_STAGING_HISTORY.md)
