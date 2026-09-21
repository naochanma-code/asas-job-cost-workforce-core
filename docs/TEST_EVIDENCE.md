# Test Evidence — Milestone 0

วันที่ 2026-09-21 · ผู้ตรวจ Codex · artifact M0-2026-09-21 · baseline main `dd7cbcc2e5379b7fb83c283833332e2710bba936`

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
- Q-01–07 ยัง OPEN; ไม่เริ่ม Milestone 1

## Known limitations / recovery

Local clone ครั้งแรกติด Git helper path/network; ใช้ GitHub connector อ่าน canonical files และ clone ผ่าน authorized Git path ภายหลัง การ checkout พบไฟล์เอกสารที่ดึงไว้แล้ว จึงคืน index จาก HEAD โดยไม่ทับงานใหม่และสร้าง branch แยก ตรวจ baseline เดียวกันแล้ว ไม่มี legacy import

ต้นแบบใช้ memory และ role switch; ไม่ได้ทำ authentication, source persistence, database unique constraints, secure payroll payload, file upload, actual export, required-job modes หรือ late/reopen resolution ทุกข้อเป็น design/spec เท่านั้น ห้ามเก็บข้อมูลจริงในต้นแบบ
