# PROJECT STATUS — สถานะปัจจุบัน

## จุดที่รอ Owner ตอนนี้ — 23 กันยายน 2026

Owner แจ้ง Login Admin แล้ว แต่เมื่อ reload และตรวจบทบาทจาก session บนหน้า Web ยังเป็น OWNER จึงไม่ลง PASS ให้ Admin UAT ตรวจแบบอ่านอย่างเดียวพบว่ามีบัญชี ADMIN/TECH/PM ที่ active อยู่แล้ว ไม่อ่านหรือเปลี่ยนรหัสผ่าน ไม่แก้สิทธิ์บัญชี เปิดหน้า Login ใหม่ไว้ให้ Owner เข้าบัญชีที่มีสิทธิ์ ADMIN จนข้อความใต้ชื่อแสดง ADMIN แล้วจึงทดสอบ PILOT A/B ต่อ

TECH Login/การซ่อนเมนูผู้ดูแลผ่านแล้วตามหลักฐานก่อนหน้านี้ ไม่ใช้ผลของ OWNER แทน ADMIN และยังไม่เปิด LINE

อัปเดต 23 กันยายน 2026 หลัง Owner ทดลอง Web และซ้อม Restore · ผู้รับผิดชอบ M1: Codex

## ตอนนี้ถึงไหนแล้ว

**Milestone 1 เปิดบน Staging แล้ว แต่ยังไม่ปิดตรวจรับทั้ง Milestone**

เข้าเว็บ: [ASAS Web Staging](https://web-staging-cb6f.up.railway.app/)

Owner ยืนยันว่า Login, สร้างพนักงาน, สร้างลูกค้า, สร้างโครงการ และมอบหมายคนเข้าโครงการได้ จึงบันทึก 5 รายการนี้เป็น **PASS จากการทดลองของ Owner** ไม่เหมารวมว่า Admin/PM/ช่างทุกบทบาท หรือการป้องกันข้อมูลข้ามโครงการผ่านแล้ว

หน้าเว็บทำได้เท่านี้ตามขอบเขต Foundation ปัจจุบัน: บัญชีผู้ใช้ ลูกค้า โครงการ Site/Job แบบไม่บังคับ และทีมงาน ยังไม่มีวันทำงาน/OT/ค่าใช้จ่าย/รูปบิล/Payroll บน Staging; งานเหล่านี้เป็น Milestone ถัดไปที่ยังไม่อนุญาตให้เริ่มต่อ

| งาน | เขียนโค้ด (CODED) | ทดสอบ (TESTED) | เปิดใช้งาน (DEPLOYED) | Owner ตรวจรับ (UAT) |
| --- | --- | --- | --- | --- |
| Login และจัดการพนักงาน/ลูกค้า/โครงการ/มอบหมาย | YES | Local/CI PASS | Staging YES | 5 flow ข้างต้น PASS; ยังไม่ครบทุกบทบาท |
| ขอบเขต Admin/PM/ช่างและถอนสิทธิ์ | YES | Local/CI PASS; TECH Login/เมนูตามบทบาท PASS บน Web | Staging YES | Admin/PM, ข้ามโครงการ/ถอนสิทธิ์ ยังไม่ครบ |
| ความปลอดภัยฐานข้อมูล/TLS | YES | Staging PASS | Staging YES | เป็นการตรวจทางเทคนิค |
| HTTPS/CSRF/ปฏิเสธผู้ไม่ Login/มือถือหน้า Login | YES | Staging PASS | Staging YES | Logout PASS; rate limit API ภายใน PASS; cookie/expiry/public-edge ยังไม่ครบ |
| Backup/Restore และ Restart | YES | Local/CI PASS; native restore ชุดสมมติบน Railway PASS | เครื่องมืออยู่ใน API | Web UAT หลัง restore NOT_RUN; Web/API Restart และข้อมูลคงอยู่ PASS |
| LINE | YES | จำลองใน Local/CI PASS | ปิด LINE_ENABLED=false | NOT_RUN / ยังไม่เปิด |
| M2 วันทำงาน/OT และงานเงิน | พักงานเก่าในเครื่อง | ไม่ใช้เป็นผล M1 | NO | ยังไม่เริ่มต่อ |

## ข้อมูลจริงใน Staging — ข้อจำกัดปัจจุบัน

Owner ยืนยันว่าข้อมูลที่สร้างมีข้อมูลจริงปนอยู่ จึง **หยุดการสำรอง/คัดลอกชุดข้อมูลนี้เพื่อซ้อมกู้คืน** และไม่แก้ ลบ หรือถอน assignment ของรายการเดิม การทดสอบต่อใช้ข้อมูลสมมติที่ระบุชัดเท่านั้น การซ้อมฐานข้อมูลต้องแยกจากฐานที่ Owner ใช้และไม่คัดลอกแถวข้อมูลจริง; ไม่เพิ่มบริการหรือแผนเสียเงิน

ข้อขัดกับแผนเดิม: Phase D/E กำหนดข้อมูลสมมติทั้งหมด แต่ฐานปัจจุบันไม่เข้าเงื่อนไขนี้แล้ว บันทึกตามคำตอบ Owner ไม่ถือว่าได้รับอนุญาตให้ใช้ข้อมูลจริงทำ backup drill ดู D-019 ใน [DECISION_LOG](DECISION_LOG.md)

## เปิด LINE ได้หรือยัง

**ยังไม่เปิด LINE จริง**: Restore แบบ native ของชุดสมมติแยกผ่านแล้ว ดู [หลักฐานและข้อจำกัด](M1_STAGING_RESTORE_DRILL.md) ยังเหลือผล Admin/ช่าง/PM แยกบทบาท, การถอนสิทธิ์, expiry/cookie/public-edge rate limit; Logout และ Restart ผ่านแล้ว จากนั้นเตรียม OA/กลุ่ม/allowlist/secret ผ่านหน้าผู้ให้บริการก่อนนัดทดลอง ไม่ถือว่าคำสั่งให้ทำ process ถัดไปยกเลิก gate A–E หรืออนุญาต Merge/M2/Production

## โอ๋ต้องทดสอบอะไรต่อ

ทำเฉพาะบัญชีและโครงการสมมติ ตั้งชื่อขึ้นต้น `PILOT` และใช้รหัสผ่านใหม่สำหรับทดสอบโดยกรอกในเว็บเอง ไม่ส่งรหัสในแชท

1. **Admin:** Login ด้วยบัญชี Admin สมมติ สร้างลูกค้าและ Project A โดยเว้น Site/Job แล้วมอบหมายช่างสมมติ ต้องบันทึกได้โดยไม่ถาม Job
2. **ช่าง:** ใช้อีก browser profile/มือถือ Login บัญชีช่างสมมติ ต้องเห็น A ที่มอบหมาย และไม่เห็น Project B สมมติที่ยังไม่ได้มอบหมาย
3. **ถอนสิทธิ์และ Logout:** เมื่อช่างตรวจ A แล้ว ให้ Admin ถอนเฉพาะ assignment สมมตินี้ ช่าง refresh/เปิด URL เดิมต้องเข้า A ไม่ได้; Logout แล้วเปิดหน้าที่ต้อง Login ต้องกลับไปหน้าเข้าสู่ระบบ

แจ้งผลเป็น `ข้อ 1 ผ่าน/ไม่ผ่าน, ข้อ 2 ผ่าน/ไม่ผ่าน, ข้อ 3 ผ่าน/ไม่ผ่าน` พร้อมข้อความผิดพลาดถ้ามี ไม่ต้องส่งข้อมูลจริงหรือรหัสผ่าน รายการละเอียดและ Site/Job/PM อยู่ใน [M1_OWNER_UAT](M1_OWNER_UAT.md)

## Codex ทำต่ออะไร

- ตรวจความปลอดภัย live ที่ยังเหลือโดยไม่รบกวนบัญชีหรือข้อมูลจริง
- ซ้อม native Backup/Restore ชุดสมมติและเทียบ Customer/Project/Assignment/Audit ผ่านแล้ว; ยังเหลือ application logical CLI บน Staging/การตรวจผ่าน Web บนฐานกู้คืน แยกจากผล CI
- Restart/persistence Web/API ผ่านแล้ว; ดำเนินการ Admin/TECH/PM scope/revoke และแยกผลทดสอบทางเทคนิคจากผล Owner
- อัปเดตไฟล์นี้, CHANGELOG และ M1_TEST_EVIDENCE เมื่อได้ผลใหม่; ยังไม่เปิด LINE หลัง A–E ผ่านจน Owner อนุมัติรอบ LINE

## Release และขอบเขตที่อนุมัติ

- Repository: naochanma-code/asas-job-cost-workforce-core
- Branch: `codex/milestone-1-foundation`; [Draft PR #2](https://github.com/naochanma-code/asas-job-cost-workforce-core/pull/2) ยังไม่ Merge
- โค้ดที่ Deploy: `4fcb29e5625caad99b2d6c3056ebd08a344b7728`; [CI 35738098892 PASS](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35738098892)
- API deployment `66ce64bf-c1f8-4a1a-abc2-5292b33c734c`; Web `4202ccc1-70f1-480b-af33-8b1a7c8da635`; เอกสารอาจใหม่กว่า release โดยไม่มีการเปลี่ยน application
- Railway Trial เท่านั้น ห้าม upgrade/เพิ่มบริการเสียเงิน; เครดิตล่าสุดที่ตรวจ 23 กันยายน $4.94 ไม่ใช่ยอด realtime
- M0: OWNER_ACCEPTED / MERGED PR #1; M1: DEPLOYED_STAGING / PARTIAL_UAT / NOT_ACCEPTED; M2: PAUSED; Production: NOT_DEPLOYED
- ประวัติเก็บใน [M1_STAGING_HISTORY](M1_STAGING_HISTORY.md) ไม่ใช้สถานะเก่าในนั้นแทนหน้านี้

## เหตุใดไฟล์ในโฟลเดอร์หลักจึงไม่ตรงกัน

โฟลเดอร์หลัก CoreApp-v2 ยังเป็น branch M2 ที่มีงานค้าง จึงแยกงาน M1 ไว้ที่ `.local/m1-staging` เพื่อไม่ปนโค้ด M2 เข้า PR #2 ไฟล์กลางล่าสุดคือ `.local/m1-staging/docs/PROJECT_STATUS.md` และไฟล์เดียวกันบน GitHub branch M1; ไฟล์ docs/PROJECT_STATUS.md ในโฟลเดอร์หลักมีป้ายชี้มาหน้านี้แล้ว ไม่สลับ branch หรือทับงาน M2 เดิม

ผลตรวจเอกสารรอบนี้: git diff --check PASS; check-m0 24 checks PASS (รวม link consistency) ไม่มี application/schema change ไม่รันชุด application เดิมซ้ำโดยไม่มีการเปลี่ยนโค้ด
