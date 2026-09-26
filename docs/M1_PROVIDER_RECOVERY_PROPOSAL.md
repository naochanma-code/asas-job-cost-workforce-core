# M1 — ปลายทางทดสอบ Browser Recovery บน Provider

26 กันยายน 2026 · ผู้ดูแล: Codex · สถานะ `INVENTORIED / OWNER_DECLINED_NEW_ENVIRONMENT / NOT_PROVISIONED / NOT_RUN`

## สิ่งที่ตรวจแล้ว

- Railway Workspace ใน browser มี Project `asas-m1-staging` หนึ่งรายการ และ environment `staging` เพียงรายการเดียว. มีบริการออนไลน์ 4 ตัว: `web`, `api`, `line-worker`, `Postgres`. ไม่พบ environment หรือ Web/API recovery ที่แยกและพร้อมใช้.
- Usage แสดง Limited Trial เหลือประมาณ USD 4.54 / 26 วัน ณ เวลาตรวจ; เป็นยอด ณ ขณะนั้น ไม่ใช่การอนุมัติใช้เครดิตเพิ่มหรือประมาณการค่าใช้จ่ายปลายทางใหม่. Trial แสดงขีดจำกัด RAM 1 GB, CPU 2 vCPU, Disk 1 GB.
- เมนู `New Environment` มีตัวเลือก `Empty Environment` ที่ไม่คัดลอกบริการหรือ variables; ค่าเริ่มต้นคือ `Duplicate Environment` ซึ่งคัดลอกทั้งสองอย่างจาก staging. ตรวจตัวเลือกแล้วปิด dialog โดย **ไม่ได้สร้าง environment**. บันทึกไว้เป็นเหตุผลด้านความปลอดภัย ไม่ใช่แผนให้สร้างหลัง Owner ปฏิเสธ.
- Owner ตอบ **ไม่สร้าง environment เพิ่ม**. หยุดเส้นทางนี้. [Railway Trial](https://docs.railway.com/pricing/free-trial) จำกัด 5 services ต่อ project และ staging ปัจจุบันมี 4. [Private network](https://docs.railway.com/networking/private-networking/how-it-works) ไม่เชื่อมข้าม environment จึงใช้ Postgres เดิมผ่าน private network จาก environment ใหม่ไม่ได้โดยตรง.
- ฐาน `m1_recovery_20260924_alignment` ตาม [หลักฐานเดิม](M1_ALIGNMENT_STAGING_EVIDENCE.md) เป็นสำเนาข้อมูล Staging ที่มีข้อมูลจริงและ runtime CONNECT=false. ใช้เป็น fixture สมมติหรือเชื่อม Web/API ทดสอบไม่ได้.
- [Local browser drill](M1_TEST_EVIDENCE.md) ผ่านแล้ว แต่ไม่แทน HTTPS/provider recovery. Staging health ตอบ `status=ok, database=ready` แบบอ่านอย่างเดียว; ไม่ได้พิสูจน์ปลายทาง recovery.

## ทางเลือกใน environment เดิมที่ยังไม่ได้อนุมัติ

ใช้ service ช่องที่ 5 เพียงตัวเดียวสำหรับ Web และ API ของ recovery บน origin HTTPS แยก; ไม่เริ่ม worker. สร้างฐาน `m1_synthetic_source_*` และ `m1_synthetic_target_*` ใหม่ใน Postgres service เดิมด้วย role ที่ไม่มี grant อ่าน/เขียน business tables ของ Pilot. ไม่คัดลอกข้อมูลจริงและไม่เปลี่ยน variables/URL ของ Web/API/worker เดิม. ก่อนใช้ต้องพิสูจน์ role isolation รวมการปฏิเสธอ่านตาราง Pilot. หลังสำรอง source/restore target ให้เปลี่ยนเฉพาะ connection ของ service ทดสอบและตรวจ session เดิม.

เตรียม `deploy/Dockerfile.recovery` และ `scripts/recovery-server.mjs` แล้วใน code: Web และ API ทำงานใน service เดียว, API ฟัง loopback, startup ปฏิเสธถ้าไม่ใช่ production/synthetic mode, LINE ไม่ปิด, origin ไม่ใช่ HTTPS หรือชื่อฐานไม่ขึ้นต้นตามรูปแบบ `m1_synthetic_source_YYYYMMDD` / `m1_synthetic_target_YYYYMMDD`. `tests/recovery-entrypoint.test.ts` ตรวจ fail-closed สามกรณีผ่านแบบ local; typecheck ผ่าน. ยังไม่ deploy, ไม่สร้างฐาน/service และ CI ของ code commit ต้องผ่านก่อนนำไปใช้.

entrypoint/container นี้ต้องผ่าน CI ก่อน deploy. [อัตรา Railway ปัจจุบัน](https://docs.railway.com/pricing/plans) เป็น RAM USD 0.000231/GB/min และ CPU USD 0.000463/vCPU/min; หาก service ใช้สูงสุดของ Trial 1 GB และ 2 vCPU ตลอด 2 ชั่วโมง ค่า compute โดยประมาณ USD 0.139 จาก Trial credit **บวก** egress/การใช้ Postgres เพิ่มและเวลาสร้าง/ทดสอบจริง. ตัวเลขนี้ไม่ใช่ hard cap หรือใบเสนอราคา; ตรวจ Usage ก่อน/ระหว่าง/หลัง และหยุดหากเครดิตไม่พอ. ยังไม่สร้าง service/ฐานหรือใช้เครดิตเพิ่มเพื่อทดสอบ C2.

ถ้า Owner ไม่อนุญาต service ทดสอบเพิ่ม ให้คง provider browser recovery `NOT_RUN` และตัดสินเกณฑ์รับ M1 โดยระบุข้อยกเว้นชัดเจน; Local/CI ไม่ถูกยกเป็น provider PASS.

## เกณฑ์ก่อนเริ่ม C2 หากเลือกทางนี้

1. สร้างฐาน PostgreSQL **ว่างสำหรับข้อมูลสมมติเท่านั้น** แยกชื่อและสิทธิ์จากฐาน Pilot และฐาน recovery ที่มีข้อมูลจริง. ตรวจความว่าง, schema checksum, role/สิทธิ์ก่อนใส่ fixture. ห้าม clone ฐาน/volume/variables ที่มีข้อมูลจริง.
2. จัด API และ Web สำหรับ recovery ผ่าน HTTPS บน origin แยกใน service ทดสอบตัวเดียว. ใช้ release SHA ที่บันทึกได้, operator/runtime credential แยก, ตั้ง `LINE_ENABLED=false` และ `LINE_ENROLLMENT_ENABLED=false`, ไม่เริ่ม worker หรือ webhook และไม่ชี้ URL Pilot ไปฐานใหม่.
3. ตรวจ capacity และค่าใช้จ่ายใน Railway UI ก่อนสร้างหรือเปิดบริการ. ต้องอยู่ใน Trial เดิมและวงเงินที่ Owner อนุมัติ; หากต้องเพิ่มแผน/บริการเสียเงิน ให้หยุดและเสนอใหม่. ปิด runtime ทดสอบหลังเก็บหลักฐานโดยไม่ลบข้อมูลหรือฐานที่ยังต้องตรวจ.
4. ทำตาม [Browser recovery checklist](M1_BROWSER_RECOVERY_CHECKLIST.md): fixture สมมติ, session เดิมถูกปฏิเสธหลัง Restore, Login ใหม่, TECH scope/Job sibling, revoke, audit, logout และ cookie flags. บันทึกผลแยกจาก Local/CI.

ปัจจุบันยังไม่มี resource ตามข้อ 1–2 และ Owner ไม่อนุญาต environment ใหม่ จึงคง C2 `NOT_READY / NOT_RUN`. ทางเลือก service เดียวข้างต้นยังเป็นข้อเสนอ ไม่ใช่การอนุมัติสร้าง service/ฐาน. ต้องยืนยัน topology, เวลาและวงเงิน Trial, วิธีหยุดบริการ และผู้อนุมัติก่อน provisioning. การอนุมัติ UAT โดยรวมไม่อนุญาตให้ใช้ข้อมูลจริงหรือเปลี่ยน Pilot.
