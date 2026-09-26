# M1 — ปลายทางทดสอบ Browser Recovery บน Provider

26 กันยายน 2026 · ผู้ดูแล: Codex · สถานะ `INVENTORIED / NOT_PROVISIONED / NOT_RUN`

## สิ่งที่ตรวจแล้ว

- Railway Workspace ใน browser มี Project `asas-m1-staging` หนึ่งรายการ และ environment `staging` เพียงรายการเดียว. มีบริการออนไลน์ 4 ตัว: `web`, `api`, `line-worker`, `Postgres`. ไม่พบ environment หรือ Web/API recovery ที่แยกและพร้อมใช้.
- Usage แสดง Limited Trial เหลือประมาณ USD 4.54 / 26 วัน ณ เวลาตรวจ; เป็นยอด ณ ขณะนั้น ไม่ใช่การอนุมัติใช้เครดิตเพิ่มหรือประมาณการค่าใช้จ่ายปลายทางใหม่. Trial แสดงขีดจำกัด RAM 1 GB, CPU 2 vCPU, Disk 1 GB.
- ฐาน `m1_recovery_20260924_alignment` ตาม [หลักฐานเดิม](M1_ALIGNMENT_STAGING_EVIDENCE.md) เป็นสำเนาข้อมูล Staging ที่มีข้อมูลจริงและ runtime CONNECT=false. ใช้เป็น fixture สมมติหรือเชื่อม Web/API ทดสอบไม่ได้.
- [Local browser drill](M1_TEST_EVIDENCE.md) ผ่านแล้ว แต่ไม่แทน HTTPS/provider recovery. Staging health ตอบ `status=ok, database=ready` แบบอ่านอย่างเดียว; ไม่ได้พิสูจน์ปลายทาง recovery.

## ปลายทางที่ต้องเตรียมก่อน C2

1. สร้างฐาน PostgreSQL **ว่างสำหรับข้อมูลสมมติเท่านั้น** แยกชื่อและสิทธิ์จากฐาน Pilot และฐาน recovery ที่มีข้อมูลจริง. ตรวจความว่าง, schema checksum, role/CONNECT ก่อนใส่ fixture. ห้าม clone ฐาน/volume/variables ที่มีข้อมูลจริง.
2. จัด API และ Web สำหรับ recovery ผ่าน HTTPS บน origin แยก. ใช้ release SHA ที่บันทึกได้, operator/runtime credential แยก, ตั้ง `LINE_ENABLED=false` และ `LINE_ENROLLMENT_ENABLED=false`, ไม่เริ่ม worker หรือ webhook และไม่ชี้ URL Pilot ไปฐานใหม่.
3. ตรวจ capacity และค่าใช้จ่ายใน Railway UI ก่อนสร้างหรือเปิดบริการ. ต้องอยู่ใน Trial เดิมและวงเงินที่ Owner อนุมัติ; หากต้องเพิ่มแผน/บริการเสียเงิน ให้หยุดและเสนอใหม่. ปิด runtime ทดสอบหลังเก็บหลักฐานโดยไม่ลบข้อมูลหรือฐานที่ยังต้องตรวจ.
4. ทำตาม [Browser recovery checklist](M1_BROWSER_RECOVERY_CHECKLIST.md): fixture สมมติ, session เดิมถูกปฏิเสธหลัง Restore, Login ใหม่, TECH scope/Job sibling, revoke, audit, logout และ cookie flags. บันทึกผลแยกจาก Local/CI.

ปัจจุบันยังไม่มี resource ตามข้อ 1–2 และยังไม่มีค่าใช้จ่ายที่ยืนยันสำหรับการเปิดปลายทางใหม่ จึงคง C2 `NOT_READY / NOT_RUN`. ต้องระบุ topology, ค่าใช้จ่ายสูงสุดใน Trial, วิธีปิดบริการ และผู้อนุมัติก่อนสร้าง. การอนุมัติ UAT โดยรวมไม่อนุญาตให้ใช้ข้อมูลจริงหรือเปลี่ยน Pilot.
