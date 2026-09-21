# Test Evidence — Milestone 0

## ผลตรวจปิดM0รอบ4 — M0-R4-2026-09-21

สถานะ OWNER_ACCEPTED / READY_TO_MERGE ตาม [M0_ACCEPTANCE](M0_ACCEPTANCE.md); Ownerยืนยันผ่าน7งานและรวมfeedbackล่าสุดเมื่อทดสอบผ่าน คำยืนยันOwnerแยกจากผลCodex ไม่มีการแต่งเวลา/assistanceหรืออ้างreal UAT

Artifactรอบ4: รอบันทึกcommit SHAหลังcommit (ผลรอบก่อนด้านล่างเป็นประวัติ)

| Command/check | Result |
| --- | --- |
| node docs/verification/check-m0.mjs | 24/24 PASS: golden arithmetic, calendar, links/fences, syntax, no remote dependencies |
| node docs/verification/check-r2.mjs | 14/14 PASS: current R4 contract, half days/OT/privacy/category/monthlyZIP |
| node docs/verification/check-r4.mjs | 7/7 PASS: delegated scope, own expense, role approval, employee overlap, actor projection, pending excluded |
| pwsh -NoProfile -File docs/verification/check-zip.ps1 | PASS: independent .NETreader4entries/3images byte-for-byte/2expenses180000satang |
| git diff --check / current canonical review | PASS; latest MASTERv2.5 / ADR-009/D-011/D-012 / status / changelog ตรงกัน |

ผลเครื่องอ่านได้ [m0-closeout-results.json](verification/m0-closeout-results.json) และ [m0-closeout-zip.json](verification/m0-closeout-zip.json) ไม่มีtemp paths/ภาพจริงในGit

Browserทดสอบ U-01–07 ครบ พร้อมลงเวลาแทนของPM/Admin/Ownerและส่งLINEexpenseของทุกrole; ผลรายขั้นและตัวเลข2489/550ใน M0_ACCEPTANCE พบback-from-summaryเลือกพนักงาน/ช่องทางใหม่แล้วยังใช้ค่าเดิม แก้และrerunผ่าน: พนักงานT2 ผู้กรอกADMIN ช่องทางLINE ถูกต้อง pendingก่อนกดapproveแยก

ต้นแบบเท่านั้น: channelจำลอง ไม่ส่งLINE; memory/role switch ไม่ใช่serverpermissions/retention2ปีจริง ไม่มี integration, deployment, realpilot, production readiness ผลประวัติที่เคยห้ามPMเห็นexpenseทุกชนิดถูกแทนที่ด้วยown-expense ruleรอบ4


## ประวัติผลตรวจรอบ3 — M0-R3-2026-09-21

Artifact commit: 2294814994d7a244be1989ffe4cc7f7ee074c13e; fetch/rebase origin/main up to date; commitบันทึกหลักฐานถัดมาปรับเฉพาะเอกสาร

คำตัดสินปัจจุบัน ADR-008 / MASTER v2.4; ผลรอบ2ด้านล่างเป็นประวัติ โดยเฉพาะการห้ามAdminเห็นexpenseและขั้นOwnerคำนวณถูกแทนที่แล้ว

- node docs/verification/check-m0.mjs: 24/24 PASS
- node docs/verification/check-r2.mjs (อัปเดตcontractเป็นR3): 14/14 PASS ดู [r3-check-results.json](verification/r3-check-results.json); OT2.5=60750สตางค์ปกติ/91000วันหยุด; reject2.25/2.1/0/negative/NaN/Infinity; Adminexpenseallow/PMdeny; projectionไม่ส่งค่าแรง
- pwsh -NoProfile -File docs/verification/check-zip.ps1: PASS; .NETอ่าน4entries,3รูปbytesตรง,2expenseรวม180000สตางค์ (Windows PowerShellตัวเก่าปฏิเสธscriptตามexecution policy จึงใช้pwshที่มีอยู่ โดยไม่เปลี่ยนpolicy)
- git diff --check PASS; ภาพPNG1x1สมมติอยู่OS temp ไม่เพิ่มภาพลงGit

| Browser case | ผลที่ตรวจจริงผ่านlocalhost4174 |
| --- | --- |
| R3-B01 | OT2.25มีstepMismatch;2.5ส่งได้ ProjectAไม่ถามJob |
| R3-B02 | AdminapproveOTและเต็มวัน → APPROVED; ปิดเวลาระบบเข้าOWNER_REVIEWอัตโนมัติ Adminเห็น1คน/1วัน/OT2.5ไม่มีเงิน |
| R3-B03 | Ownerเปิดสรุปพบ1697.50 (work1090+OT607.50) พร้อมปุ่มอนุมัติสรุป ไม่มีปุ่มคำนวณหรืออนุมัติเวลาซ้ำ |
| R3-B04 | ช่างเลือกPNGส่งexpense500 → Adminเห็นยอด/รูปและเปิดแก้ได้; ลบรูปแล้วยกเลิก รูปต้นฉบับยังโหลดnaturalWidth1 |
| R3-B05 | Adminแก้เป็น2ชิ้น/550/รายละเอียดใหม่/เหตุผล พร้อมลบและเลือกภาพใหม่ → บันทึกยังรอตรวจ แล้วapproveได้ ไม่มีต้นทุนรวม/ค่าแรง/เมนูZIP |
| R3-B06 | PMที่ProjectBมีเฉพาะงาน/กำลังคน ไม่มีเมนูเงิน; helper testยืนยันไม่เห็นexpenseแม้senderตรง |

Auditก่อน/หลัง/actor/time/reasonเก็บในหน่วยความจำตามcode ยังไม่มีหน้าตรวจauditหรือpersistent audit ทดสอบอายุไฟล์2ปีเป็นspecเท่านั้น ไม่มีlifecycleทำงานจริง ไม่มีbackendsecurity/integration/OwnerUAT/deploy/LINEจริง


## ประวัติผลตรวจรอบ2 — M0-R2-2026-09-21

Artifact commit: `5f96422eb23151022c789441deb83a4c7eeb3312`; fetch/rebase origin/main แล้ว up to date ไม่มี conflict Commit บันทึก provenance ถัดมาปรับเฉพาะเอกสาร ไม่เปลี่ยนต้นแบบที่ทดสอบ

คำตอบ Owner บันทึกใน ADR-007; code เป็น prototype เท่านั้น ไม่ใช่ backend security หลักฐานเก่าด้านล่างเป็นประวัติรอบแรก บางflowถูกแทนที่โดยรอบ2 โดยเฉพาะ Adminห้ามเห็นเงินและExpense reviewย้ายOwner

- node docs/verification/check-m0.mjs: 24/24 PASS (สูตรเดิม/ลิงก์/JavaScript syntax/no remote dependency)
- node docs/verification/check-r2.mjs: 13/13 PASS ดู [r2-check-results.json](verification/r2-check-results.json): แบ่งครึ่งวัน, no overlap, OT8h1944/2912, no expense/receipt permissionสำหรับAdmin/PM, time projection, หมวด9ประเภท, archive filter/month/unique-expense total และ3Owner options
- pwsh -File docs/verification/check-zip.ps1: PASS อ่านZIPด้วย .NET ที่แยกจากตัวเขียนZIP; รูป3ไฟล์ bytesตรงต้นฉบับ, CSV2expenseรวม180000สตางค์ ดู [r2-zip-results.json](verification/r2-zip-results.json)
- fixtures เป็น PNG1x1 สมมติสร้างใน OS temp ไม่เก็บบิลจริงหรือภาพในGit

| Browser case | ผลที่เห็นจริง |
| --- | --- |
| R2-B01 | เลือกPNGจากเครื่อง → previewภาพโหลดได้ naturalWidth1 → สรุป → ส่ง; แสดง9ประเภทรายจ่าย |
| R2-B02 | Adminเปิดreviewหลังมีexpense500 → ไม่มีรายการexpense/เงิน/รูปบิล และไม่มีเมนูexport |
| R2-B03 | Owner1เห็นภาพ/ยอด pending0cost → อนุมัติ → ศูนย์เดือนแสดง1รายการ500บาท → ปุ่มดาวน์โหลดZIPทำงาน |
| R2-B04 | Owner2และOwner3สลับบัญชีเข้าหน้าเงินได้ มี3บัญชีแยกให้เลือก |
| R2-B05 | OT21ก.ย.8ชม.ส่งสำเร็จ ไม่ถามเวลาเริ่ม/จบหรือJob |
| R2-B06 | AM A + PM B ส่งและAdminอนุมัติ → สรุปเวลา1คน/วันเข้างาน1/วันทำงาน1/OT8ชม. ไม่มีเงิน |
| R2-B07 | PM B เห็น1คน/1วันเข้างาน/0.5วันทำงาน ไม่มีเงินหรือexpense/รูป |
| R2-B08 | Adminส่งรอบเวลา → Owner1คำนวณ → Owner2อนุมัติ → Owner3lock/paidจำลอง; auditชื่อผู้ทำตรงทุกขั้น ยอด3034บาทจากwork1090+OT1944 |

การทดสอบข้อความใช้ regex ตัวเลขตามด้วยสกุลเงิน ไม่ใช้ substring “บาท” เพราะคำว่า “บทบาท” ทำให้false positive ผลDOMจริงไม่มีเงินสำหรับAdmin/PM

Browser smokeไม่ใช่Owner UAT และ local ZIPไม่ใช่versioned private storage/backup restoreจริง ข้อกำหนดfiles1–5/10MB/signatureมีในต้นแบบ; invalid signatureตรวจในlocal test แต่ยังไม่ได้อ้างว่าทดสอบinputทุกชนิด/ทุกdeviceผ่านbrowserครบ


## ประวัติผลตรวจรอบแรก (ก่อนคำตอบ Owner รอบ2)

วันที่ 2026-09-21 · ผู้ตรวจ Codex · artifact M0-2026-09-21 · baseline main `dd7cbcc2e5379b7fb83c283833332e2710bba936`

Artifact commit ที่ตรวจ: `be4bfc6137394f34e0b1f5399f98e8a864298f9c`; fetch origin/main แล้ว rebase ได้ผล up to date ไม่เกิด conflict ผล local checks 24/24 PASS; `git diff --check` ผ่าน Commit ถัดจากนี้บันทึก provenance/status เท่านั้น ไม่เปลี่ยนสูตรหรือต้นแบบ

## ขอบเขตและ environment

Windows workspace, Node.js ในเครื่อง, HTML process prototype ผ่าน Codex in-app browser ที่ localhost; fixture สมมติทั้งหมด ไม่มี PostgreSQL/LINE/API/production application หรือเงินจริง

## Local checks

คำสั่งตรวจซ้ำจาก repository root: `node docs/verification/check-m0.mjs`

สคริปต์ตรวจ expected arithmetic P-01–16 ด้วย BigInt rational, rounding 970→243/364, monthly reconciliation, unique-expense export total, calendar fixture, Markdown local links, fenced diagrams, required deliverables และ JavaScript parse/no remote dependency ผลจริงเก็บใน [local-check-results.json](verification/local-check-results.json)

สคริปต์นี้เป็น executable specification ของ fixtures ไม่ใช่ production calculator และไม่ได้พิสูจน์ rate lookup, transition, SQL concurrency, permissions หรือ checksum export ใน application

## Browser smoke ที่รันจริง

| ID | ทำใน local prototype | Observed result |
| --- | --- | --- |
| B-01 | TECH Project A → work FULL 2026-09-21 → ตรวจสรุป → ยืนยัน | DEMO-001 SUBMITTED; ไม่มี Site/Job question |
| B-02 | TECH A → OT 2h พร้อมเหตุผล → ยืนยัน | DEMO-002 SUBMITTED; ไม่มีจำนวนเงินหรือ Job question |
| B-03 | TECH A → FUEL500 พร้อมหลักฐานจำลอง1 → ยืนยัน | DEMO-003 PENDING_REVIEW; status เห็น3รายการของตน |
| B-04 | ADMIN review ก่อน/หลัง approve ทั้ง3 | pending Actual FUEL0; approved FUEL500, budget2000, remaining1500, used25%; เวลาแสดงวัน/OT ไม่มีค่าแรง |
| B-05 | ADMIN evidence เดือนกันยายน → preview | 1 expense / 1 evidence / 500บาท / r1; ติดป้ายไม่ได้สร้าง ZIP จริง |
| B-06 | ADMIN payroll → ส่ง Owner | OPEN→TIME_REVIEWED; หน้ามี1 work และ2 OT hours ไม่มี rate/payroll amount |
| B-07 | OWNER calculate → เปิดยอด → approve → lock → paid จำลอง | 1,576บาท; TIME_REVIEWED→OWNER_REVIEW→APPROVED→LOCKED→PAID; ระบุไม่ได้โอนเงินจริง |
| B-08 | TECH Project B เปิดเพิ่มเติม เลือก B1 ส่ง Work แล้วสลับ DEMO-T2 | B1/B2 เป็นตัวเลือกได้; สรุปแสดง B1; T2 ไม่เห็นรายการ T1 ในหน้าสถานะ (UI simulation ไม่ใช่ security proof) |

ระหว่างตรวจพบ Job B1 ไม่เป็น selectable option เนื่องจากปิด HTML tag ผิด แก้ markup แล้วตรวจ B1/B2 ใหม่; ตรวจพบการใช้ innerHTML ต่อหลังผูกปุ่มอาจล้าง event handlers ของ export/payroll จึงเปลี่ยนเป็น insertAdjacentHTML ก่อน smoke ข้างต้น

Snapshot DOM และ screenshot ตรวจระหว่าง tool session ยืนยันผลข้างต้น; screenshot viewport แคบแสดงเมนูเลื่อนแนวนอนและเนื้อหาอ่านได้ ไม่อ้าง full device/browser matrix

## สิ่งที่ยังไม่รันและ gate

- TESTED_INTEGRATION: NOT_RUN (ยังไม่มี PostgreSQL/backend)
- Deployed smoke: NOT_RUN / NOT_DEPLOYED
- Real LINE test: NOT_RUN (ไม่เชื่อม OA/ไม่ส่งข้อความ)
- Accounting ZIP/CSV/XLSX/hash/restore system tests: NOT_RUN; มี specifications E-01–09 เท่านั้น
- Payroll P-17–33 system scenarios: NOT_RUN; calendar ที่สคริปต์ตรวจเป็น fixture sanity เท่านั้น
- Owner UAT/U-01–U-07: NOT_RUN_BY_OWNER; Codex browser smoke ไม่ใช่ UAT_PASSED
- คำตอบOwnerรอบ2อยู่ใน ADR-007; ยังไม่เริ่ม Milestone1 และยังไม่ผ่านOwner UAT ทั้ง7งาน

## Known limitations / recovery

Local clone ครั้งแรกติด Git helper path/network; ใช้ GitHub connector อ่าน canonical files และ clone ผ่าน authorized Git path ภายหลัง การ checkout พบไฟล์เอกสารที่ดึงไว้แล้ว จึงคืน index จาก HEAD โดยไม่ทับงานใหม่และสร้าง branch แยก ตรวจ baseline เดียวกันแล้ว ไม่มี legacy import

ต้นแบบใช้ memory และ role switch; ไม่ได้ทำ authentication, source persistence, database unique constraints, secure payroll payload, server upload/storage, production export, required-job modes หรือ late/reopen resolution ทุกข้อเป็น design/spec เท่านั้น ห้ามเก็บข้อมูลจริงในต้นแบบ
