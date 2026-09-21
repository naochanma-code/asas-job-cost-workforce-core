# PROJECT STATUS

2026-09-21 · MASTER v2.5 · M0-R4 · ผู้ดูแลเอกสาร/ต้นแบบ Codex

**Milestone 0: OWNER_ACCEPTED / MERGED**

Owner ยืนยันผ่านทั้ง7งานรวมfeedbackล่าสุดเมื่อทดสอบผ่านแล้ว ผลแยกรายงานใน [M0_ACCEPTANCE](M0_ACCEPTANCE.md) Codexตรวจซ้ำผ่าน ไม่ใช่การอ้างreal pilotหรือproduction UAT

## ผลงานปัจจุบัน

- ครบwireflow Web/LINE, state diagrams, dictionary/schema, permission matrix, payroll cases, evidence export, pilot script และADR001–009
- Projectเป็นหลัก Site/Joboptional ไม่มีJobไม่ถาม; Owner3บัญชีแยกactor
- PM/Admin/Ownerลงเวลาแทนพนักงานได้ เก็บผู้กรอกกับพนักงานแยกกัน PMจำกัดProjectที่assigned TECHลงตนเอง
- ทุกroleส่งexpenseได้ PMเห็นเงิน/รูปเฉพาะของตน Adminตรวจรายรายการได้แต่ไม่เห็นต้นทุนรวม/Payroll LINEทุกroleรอAdmin/Ownerอนุมัติทุกครั้ง Webคงขั้นรอตรวจ
- Adminapproveเวลาแล้วไม่ส่งOwnerตรวจซ้ำ ปิดเวลาคำนวณอัตโนมัติ Ownerตรวจยอดจ่าย OTทีละ0.5ย้อนหลังได้ สองProjectแบ่งครึ่งวัน
- รูป/PDF1–5ไฟล์10MB/ไฟล์ หมวด9ประเภท Ownerดาวน์โหลดZIPเดือน; policyเก็บ2ปีเป็นdesign

## สถานะแยก

| Workstream | DESIGNED | CODED | TESTED_LOCAL | OWNER_ACCEPTANCE | INTEGRATION / REAL UAT | DEPLOYED |
| --- | --- | --- | --- | --- | --- | --- |
| เอกสาร/Process prototype M0 | YES | MOCK_ONLY | 45checks + ZIP +7งานและfeedbackregression PASS | PASSทั้ง7 ตามOwner | NOT_RUN | NO |
| Production Web/API/DB/LINE | design only | NOT_STARTED | NOT_RUN | ไม่ใช่ขอบเขตM0 | NOT_RUN | NO |
| Persistence/retention/backup/real pilot | spec only | NOT_STARTED | NOT_RUN | ไม่ใช่ขอบเขตM0 | NOT_RUN | NO |

## Repositoryและการส่งมอบ

Repository naochanma-code/asas-job-cost-workforce-core; Ownerสั่งMerge PR#1จากcodex/milestone-0-process-designเข้าmainแล้ว merge commit a7e5c9e08a4d2c8185a12ef65f705a190c243a8d; ยังไม่เริ่มMilestone1

ฐานก่อนรอบ4: 1ce069297731383c918df2b30b3c06158be1175c; artifactรอบ4ที่ทดสอบ cf615b00e97f1d2fdaa71b4501c7c0340d6cc2c3; หลักฐานใน [TEST_EVIDENCE](TEST_EVIDENCE.md) พร้อมตรวจremote head

## ข้อจำกัดที่ยอมรับในM0

Role/channelจำลอง ทุกข้อมูลอยู่memory refreshแล้วหาย ไม่มีLINEจริง/serverauthorization/database/retentionworker/backuprestore ไม่มีrateeditor/manualadjustment/reopenlateUI/requiredJobmode/productionexport

OTไม่มีWork, Jobbudgetallocation, เดือนอ้างอิงexportและจุดเริ่มนับ2ปีเป็นรายละเอียดก่อนimplementation ไม่ใช่คำถามซ้ำเรื่องสิทธิ์หรือOT0.5 ทุกข้ออยู่ [OWNER_QUESTIONS](OWNER_QUESTIONS.md)

## ขั้นตอนถัดไป

รอOwnerอนุมัติขอบเขตและสั่งเริ่มMilestone1แยกต่างหาก ข้อเสนอ [M1_FOUNDATION_PROPOSAL](M1_FOUNDATION_PROPOSAL.md) เป็นเอกสารเท่านั้น ยังไม่มีapplication/migration/environment/LINEจริงของM1

## ตรวจหลังMerge

mainหลังmergeมีAGENTS/README/docsตรงกับPRhead22b8f32706396cbac31bfb87f77598613b1bc857 ไม่มีไฟล์ตกหล่น (git diffเท่ากัน); รัน24+14+7=45checksและindependentZIPผ่าน เอกสารบันทึกผลหลังMergeไม่เปลี่ยนprototypeหรือสูตร
