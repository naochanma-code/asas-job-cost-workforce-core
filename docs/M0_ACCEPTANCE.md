# Milestone 0 — ผลตรวจรับรอบ4

สถานะ OWNER_ACCEPTED / MERGED · วันที่21กันยายน2026 · Session M0-R4-2026-09-21

Owner ตอบในtaskนี้ว่า **“ยืนยันผ่านทั้ง 7 งาน รวมการแก้ล่าสุดเมื่อทดสอบผ่าน”** เป็นคำยืนยันการตรวจรับจากOwner ไม่ใช่Codexลงชื่อแทน ผลCodexเป็นregressionแยกด้านล่าง ไม่มีการแต่งเวลาเริ่ม/จบ จำนวนassistance อุปกรณ์ หรือผลสังเกตของOwnerที่ไม่ได้ส่งมา

| งาน | Owner Acceptance | Codex regression / ข้อสังเกต |
| --- | --- | --- |
| U-01 ดูงานของฉัน | PASS | Aไม่มีSite/Job ใช้งานได้; BเปิดดูB1/B2ได้ งานย่อยoptional |
| U-02 ลงวันทำงาน | PASS | เต็มวันย้อนแก้เป็นเช้าส่งSUBMITTED; ลงแทนT2แยกผู้กรอก PM/Admin/Ownerครบ |
| U-03 ลงOT | PASS | วันที่21ก.ย.8ชม.ไม่ถามเริ่ม/จบ;2.5ผ่าน2.25ไม่ผ่าน; ลงแทนครบ3role |
| U-04 ส่งค่าใช้จ่าย | PASS | 9หมวด เลือกPNGจริง ลบ/เพิ่มpreviewโหลดได้ ทุกroleส่งLINEจำลองแล้วPENDING_REVIEW |
| U-05 ตรวจรายการ | PASS | Adminแก้500เป็น550พร้อมเหตุผลแล้วapprove; ไม่มีProjecttotal/Payroll PMเห็นเฉพาะexpenseตน Owner3บัญชีแยกactor |
| U-06 หลักฐานรายเดือน | PASS | Ownerดาวน์โหลดZIPจากapproved550; pendingไม่รวม; .NETอ่านZIPfixtureรูป3/expense2 ยอด180000สตางค์ bytesตรง |
| U-07 รอบค่าจ้าง | PASS | Adminปิดเวลาระบบคำนวณ Owner1approve/Owner2lock/Owner3paidจำลอง ยอด2489=ครึ่งวัน545+OT1944; ไม่มีOwnerตรวจเวลาซ้ำ |

## Regressionเพิ่มเติมของfeedbackล่าสุด

- PM/Admin/Owner ลงWorkและOTให้T2 ในBได้ วันที่22/23/24แยกกัน ผู้กรอกเป็นบัญชีของตน; TECHลงแทนไม่ได้; PMนอกBปฏิเสธตามfixture
- TECH/PM/Admin/Owner ส่งexpenseผ่านLINEจำลองได้ทั้งหมดและรอตรวจเสมอ PMไม่เห็นexpenseอีก3คน ไม่มีปุ่มapprove
- พบและแก้การย้อนสรุปแล้วเปลี่ยนemployee/source channelไม่อัปเดต ทดสอบใหม่: Adminเปลี่ยนT1เป็นT2และWebเป็นLINE ผลบันทึกตรงและexpenseยังpendingก่อนกดapproveแยก
- รายการเวลาหลังปิดรอบแสดงlate ไม่เปลี่ยนยอดรอบเดิม ยังไม่มีหน้าตัดสินlate/reopen

## หลักฐานและขอบเขต

Windows / Codex in-app browser / localhost4174; ข้อมูลและPNG1x1สมมติทั้งหมด localchecks24 + contract14 + delegate7 ผ่าน รวม45checks พร้อม independentZIPreader; ดู [TEST_EVIDENCE](TEST_EVIDENCE.md)

ไม่มีbackend authentication/persistence/production permission/LINEจริง/เก็บไฟล์2ปีจริง/backup restore การเลือกroleและช่องทางเป็นsimulation ไม่ใช่real UAT ข้อเสนอrequiredJob/budgetallocation/OTไม่มีWorkยังเป็นรายละเอียดออกแบบก่อนimplementation ไม่บล็อกM0processที่Ownerรับแล้ว

Ownerสั่งMerge PR#1ภายหลังการตรวจรับแล้วและmergeสำเร็จ a7e5c9e08a4d2c8185a12ef65f705a190c243a8d; ยังไม่เริ่มM1/deploy/LINEจริง

Artifactที่ตรวจ cf615b00e97f1d2fdaa71b4501c7c0340d6cc2c3; GitHub PR#1 Ready for review, mergeable=true/clean, merged=false, auto_merge=null ตรวจหลังpush เป็นผลก่อนMerge; Ownerสั่งและmergeสำเร็จแล้ว ดูPROJECT_STATUS

## ไฟล์ที่เปลี่ยนรอบ4 (28ไฟล์)

- AGENTS.md
- README.md
- docs/ACCOUNTING_EVIDENCE.md
- docs/CHANGELOG.md
- docs/DATABASE_SCHEMA.md
- docs/DATA_DICTIONARY.md
- docs/DECISION_LOG.md
- docs/M0_ACCEPTANCE.md
- docs/MASTER_PROMPT.md
- docs/MILESTONE_0.md
- docs/OWNER_QUESTIONS.md
- docs/PAYROLL_CALCULATION_TEST_CASES.md
- docs/PAYROLL_POLICY.md
- docs/PERMISSION_MATRIX.md
- docs/PILOT_ACCEPTANCE_SCRIPT.md
- docs/PROJECT_STATUS.md
- docs/STATE_DIAGRAMS.md
- docs/TEST_EVIDENCE.md
- docs/WIREFLOWS.md
- docs/adr/008-admin-review-ot-retention.md
- docs/adr/009-delegated-entry-and-expense-review.md
- docs/adr/README.md
- docs/prototype/model.js
- docs/prototype/ui.js
- docs/verification/check-r2.mjs
- docs/verification/check-r4.mjs
- docs/verification/m0-closeout-results.json
- docs/verification/m0-closeout-zip.json
