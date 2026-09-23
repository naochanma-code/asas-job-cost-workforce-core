# PROJECT STATUS — สถานะปัจจุบัน

## 23 กันยายน 2026 — ปรับ UX และทดสอบอัตโนมัติก่อนส่ง Owner

Owner ขอให้พัฒนาและทดสอบเป็นชุดก่อนส่งตรวจ ไม่ต้องสลับบัญชีทีละขั้น จึงพักคำขอ Login TECH ก่อนหน้า ไม่รอ Owner เพื่อทดสอบอัตโนมัติ ใช้บัญชี OWNER/ADMIN/PM/TECH ที่ชุดทดสอบสร้างเองในฐานสมมติแยก รหัสผ่านสุ่มในหน่วยความจำ ไม่พิมพ์/บันทึกและไม่ใช้กับ Staging ที่มีข้อมูลจริง

CODED: เพิ่มชื่อลูกค้า/สถานที่บนการ์ดและรายละเอียดโครงการ เปิดรายการ Job และแบบฟอร์มเพิ่ม Job ให้มองเห็นชัด ตัวเลือกมอบหมายทั้งโครงการ/Job แสดงทันทีเมื่อมี Job เท่านั้น โครงการไม่มี Job ยังไม่ถาม Job ล้างข้อมูลหน้าจอเมื่อ Logout ป้องกันข้อมูลค้างข้ามบัญชี

TESTED: Local regression 24 tests: 22 PASS / 2 native-PostgreSQL-only SKIP / 0 FAIL; typecheck และ Next production build PASS; M0 document checks 24/24 PASS; git diff --check PASS. ชุดใหม่ตรวจ customer/site ตาม scope, ห้ามอ่าน directory, A ไม่มี Job และ B มี Job โดยสร้างบัญชี/รหัสผ่านอัตโนมัติในฐานแยก CI รุ่นใหม่ยังรอผล DEPLOYED: Staging ยังเป็น release 4fcb29e จึงยังไม่เห็น UX ใหม่ UAT: ยังไม่ส่ง Owner ตรวจรอบใหม่ ไม่ถือผล automated เป็น Owner acceptance

ยังไม่เปิด LINE ไม่ Merge PR #2 ไม่เริ่ม M2/Production ไม่แก้ข้อมูลจริงหรือเพิ่มค่าใช้จ่าย ส่ง Owner ตรวจเป็น flow เดียวหลังรุ่นพร้อม และขอ Owner เฉพาะเรื่องที่ต้องตัดสินใจ/กรอก secret ของบริการจริง

## 23 กันยายน 2026 — Admin และชุด PILOT A/B

PASS บน Web Staging release 4fcb29e: reload แล้วยืนยันบทบาท ADMIN; Admin สร้างลูกค้า PILOT-20260923-Customer และ Project A โดยไม่กรอก Site/Job ได้ มอบหมายช่างสมมติที่เคย Login ให้ A โดยแบบฟอร์มมีเฉพาะพนักงาน ไม่มีช่อง Job หลังบันทึกพบช่างสมมติและปุ่มถอนมอบหมาย

PASS: สร้าง Site B เลือก Site นี้ตอนสร้าง Project B และเพิ่ม Job B ได้ ตรวจพบ Job B ในรายละเอียด และ B ไม่มี assignment ช่าง ทั้งหมดใช้ชื่อขึ้นต้น PILOT-20260923 ไม่แก้รายการจริงเดิม Owner ยืนยันเพิ่มเติมว่า Admin เลือกช่างได้ถูกต้อง

ประวัติก่อนเปลี่ยนวิธีทดสอบ: เคยรอ Login ช่างสมมติเพื่อตรวจ A/B; คำขอนี้พักแล้วตามคำสั่ง Owner ล่าสุด ยังไม่ลง PASS ให้ cross-project, ถอนสิทธิ์, PM หรือ security live ที่เหลือ LINE ยังคงปิด ไม่มี deploy/merge/M2/ค่าใช้จ่ายเพิ่ม

อัปเดต 23 กันยายน 2026 หลัง Owner ทดลอง Web และซ้อม Restore · ผู้รับผิดชอบ M1: Codex

## ตอนนี้ถึงไหนแล้ว

**Milestone 1 เปิดบน Staging แล้ว แต่ยังไม่ปิดตรวจรับทั้ง Milestone**

เข้าเว็บ: [ASAS Web Staging](https://web-staging-cb6f.up.railway.app/)

Owner ยืนยันว่า Login, สร้างพนักงาน, สร้างลูกค้า, สร้างโครงการ และมอบหมายคนเข้าโครงการได้ จึงบันทึก 5 รายการนี้เป็น **PASS จากการทดลองของ Owner** ไม่เหมารวมว่า Admin/PM/ช่างทุกบทบาท หรือการป้องกันข้อมูลข้ามโครงการผ่านแล้ว

หน้าเว็บทำได้เท่านี้ตามขอบเขต Foundation ปัจจุบัน: บัญชีผู้ใช้ ลูกค้า โครงการ Site/Job แบบไม่บังคับ และทีมงาน ยังไม่มีวันทำงาน/OT/ค่าใช้จ่าย/รูปบิล/Payroll บน Staging; งานเหล่านี้เป็น Milestone ถัดไปที่ยังไม่อนุญาตให้เริ่มต่อ

| งาน | เขียนโค้ด (CODED) | ทดสอบ (TESTED) | เปิดใช้งาน (DEPLOYED) | Owner ตรวจรับ (UAT) |
| --- | --- | --- | --- | --- |
| Login และจัดการพนักงาน/ลูกค้า/โครงการ/มอบหมาย | YES | Local/CI PASS | Staging YES | Owner 5 flow PASS; Admin สร้างลูกค้า/A/B/มอบหมาย PASS; ยังไม่ครบทุกบทบาท |
| ขอบเขต Admin/PM/ช่างและถอนสิทธิ์ | YES | Local/CI PASS; ADMIN/TECH Login PASS บน Web | Staging YES | PM, TECH ข้ามโครงการ/ถอนสิทธิ์ ยังไม่ครบ |
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

## แผน UAT รอบรวม — ยังไม่ต้องทำตอนนี้

พักรายการต่อไปนี้จน Codex เตรียมรุ่นพร้อมตามคำขอ Owner ล่าสุด ไม่ต้องสลับ Login ระหว่างการพัฒนา เมื่อถึงรอบ UAT ทำเฉพาะบัญชีและโครงการสมมติ ตั้งชื่อขึ้นต้น `PILOT` และใช้รหัสผ่านใหม่สำหรับทดสอบโดยกรอกในเว็บเอง ไม่ส่งรหัสในแชท

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
