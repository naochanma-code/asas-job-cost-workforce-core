# PROJECT STATUS

อัปเดต 21 กันยายน 2026 · Milestone 0 รอบ3เท่านั้น · Owner ของเอกสาร/ต้นแบบ: Codex

## สิ่งที่ใช้งานได้ในต้นแบบ

- Project เป็นหลัก A ไม่มี Site/Job; B เพิ่มงานย่อยได้ ไม่บังคับเลือก
- Admin ตรวจแก้และอนุมัติ expense รายรายการรวมจำนวน/รายละเอียด/เงิน/รูปได้ ไม่เห็นต้นทุนรวม/ค่าแรง; PM ดูเฉพาะกำลังคนและเวลา
- Owner มีบัญชีจำลองแยก3คน ดูเงิน ตรวจและอนุมัติค่าใช้จ่าย พร้อมบันทึกผู้ทำ
- ช่างลง OT เป็นชั่วโมงพร้อมวันที่ย้อนหลังได้ ไม่แยกเที่ยงคืน; สอง Project ใช้เช้า/บ่ายอย่างละครึ่งวัน ป้องกันลงช่วงวันซ้ำ
- เลือกภาพ/PDFจากเครื่อง 1–5 ไฟล์ สูงสุด10MB/ไฟล์ ดูภาพก่อนส่ง ลบหรือเพิ่มแทนได้ มี9ประเภทรายจ่าย
- Owner ดูค่าใช้จ่ายรายเดือนรวมทุกProject และดาวน์โหลด ZIP ที่แตกเป็น folder ของไฟล์ที่เลือกจริง พร้อมทะเบียน expense

ทั้งหมดเป็น local HTML simulation ไม่มี Production Application, backend, database, migration, upload server, LINE OA หรือ deployment ไฟล์อยู่ในหน่วยความจำ browser Refresh แล้วหาย ไม่ใช้ข้อมูลจริง

## คำตอบ Owner และขอบเขตที่ยืนยัน

[OWNER_QUESTIONS](OWNER_QUESTIONS.md) เปลี่ยนเป็นทะเบียนคำตอบแล้ว ไม่ต้องถาม Q-01/02/03เรื่องวันที่/04/05เรื่องสิทธิ์/06เรื่องfolder ซ้ำ ใช้ [ADR-008](adr/008-admin-review-ot-retention.md), D-010 และ MASTER v2.4 แทนข้อเสนอ non-pay visibility รอบแรก คำตอบล่าสุด ADR-008/D-010 ให้Adminตรวจexpenseรายรายการ; Budget/ยอดรวมยังOwner

Owner เตรียมผู้ร่วมทดลองจริงภายหลัง (Q-07) ยังไม่ถือว่าผ่าน UAT จากการตอบคำถามนี้ Work ยังไม่ได้รับมอบหมายให้แก้ module/schema คู่ขนาน

## สถานะแยกตามหลักฐาน

| Workstream | DESIGNED | CODED | TESTED_LOCAL | TESTED_INTEGRATION | DEPLOYED_STAGING | UAT_PASSED | PRODUCTION_READY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| เอกสาร MASTER v2.4 / schema / permission / ADR | YES (business decisions Accepted; implementation draft) | N/A | consistency checks | NOT_RUN | NO | NO | NO |
| Process prototype รอบ3 | YES | MOCK_ONLY | 24 baseline +14 current contract checks PASS, independent ZIP PASS, browser R3-B01–06 PASS | NOT_RUN | NO | NO | NO |
| Production Web/API/worker/LINE | design only | NOT_STARTED | NOT_RUN | NOT_RUN | NO | NO | NO |
| Backup/restore/real pilot | spec only | NOT_STARTED | NOT_RUN | NOT_RUN | NO | NO | NO |

หลักฐาน [TEST_EVIDENCE](TEST_EVIDENCE.md) แยกรอบใหม่กับผลเก่าที่ถูกแทนที่แล้ว ไม่มีการอ้างว่า mock role switch เป็น server security

## Version / Repository

- Repository: naochanma-code/asas-job-cost-workforce-core (Private)
- Branch: codex/milestone-0-process-design; Draft PR #1
- Base main: dd7cbcc2e5379b7fb83c283833332e2710bba936; MASTER v2.4 / artifact M0-R3-2026-09-21
- Artifact รอบ3: working tree; commitรอบ2คือ5f96422eb23151022c789441deb83a4c7eeb3312
- ต้นแบบเปิดจาก docs/prototype/index.html หรือรัน node docs/verification/serve-m0.mjs แล้วเปิด http://127.0.0.1:4174/prototype/index.html
- Migration: ไม่มี; deploy: ไม่มี;เงินจริง/ข้อมูลจริง/การส่งLINEจริง: ไม่มี

## ข้อจำกัดและเรื่องที่ค่อยยืนยัน

- OTทีละ0.5ชั่วโมงยืนยันแล้ว ปฏิเสธเศษนาที; กรณีไม่มีWork Entryยังรอนโยบาย
- วิธีแบ่ง/เพิ่ม Job budget, เดือนอ้างอิง export และวันเริ่มนับอายุไฟล์ยังเป็นข้อเสนอ; ระยะเก็บ2ปียืนยันแล้ว ไม่ถือว่า Owner ยืนยันทั้งหมดเมื่อบอกว่าใช้ SMEMOVE แยก
- required-Job mode, rate editor, manual payroll adjustment, reopen/late resolution, server authorization, concurrent transactions, persistent storage/backup และ production export ยังไม่ได้พัฒนา
- Snapshot payroll ในต้นแบบ freeze source เมื่อ Admin ปิดเวลา ระบบคำนวณอัตโนมัติ Ownerไม่ตรวจเวลาซ้ำ; late source ไม่เปลี่ยนผลเดิม แต่ยังไม่มีหน้าตัดสิน late adjustment
- ไม่ต้องรอคำตอบเรื่องเหล่านี้เพื่อทดลองเลือกรูป/หมวด/กำลังคน/OTย้อนหลังในรอบนี้

## ขั้นตอนถัดไป

1. โอ๋ลองต้นแบบรอบ3 โดยเฉพาะรูปบิล หมวดรายจ่าย OTย้อนหลัง และข้อมูลแต่ละบทบาท
2. บันทึกผลเจ็ดงานตาม [PILOT_ACCEPTANCE_SCRIPT](PILOT_ACCEPTANCE_SCRIPT.md); ปรับตามfeedbackก่อนถือว่า M0ผ่าน
3. ยังไม่เริ่ม Milestone1/LINEจริง/deploy จากคำตอบนโยบายครั้งนี้
