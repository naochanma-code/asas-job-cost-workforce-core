# Milestone 0 — ผลตรวจรับรอบ4

สถานะ OWNER_ACCEPTED / READY_TO_MERGE · วันที่21กันยายน2026 · Session M0-R4-2026-09-21

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

การปิดM0อนุญาตให้PRพร้อมreviewเท่านั้น ห้ามmerge เริ่มM1 deploy หรือเปิดLINEจริงจนOwnerสั่งใหม่
