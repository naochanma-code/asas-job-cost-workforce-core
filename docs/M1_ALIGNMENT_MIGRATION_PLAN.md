# M1 Alignment — Dry Run / Roll-forward / Recovery

## 24 กันยายน 2026 — DEPLOYED_STAGING / รอ Owner UAT

Owner อนุมัติ Backup/Recovery และ migration003/grants/Deploy SHA cda461d แล้ว ทั้ง API/Web Online; encrypted backup และ isolated restore PASS; legacy business digest ไม่เปลี่ยน; HTTPS24 checks และ restart persistence PASS; log sample ไม่พบ secret patterns LINE=false ไม่เปลี่ยนแผน ไม่ Merge/M2/M3/Production ดู [หลักฐาน Staging](M1_ALIGNMENT_STAGING_EVIDENCE.md) สถานะรออนุมัติด้านล่างเป็นประวัติที่แก้ไขแล้ว


ขอบเขต: 001/002 → 003_m1_alignment.sql เท่านั้น ไม่ใช่ M2 migration. Owner ให้เริ่มตามแผนแล้วตาม D-024 แต่ apply ได้เมื่อ Backup/Restore/preflight ผ่านเท่านั้น. ผู้รับผิดชอบ: Codex; ผู้อนุมัติ deployment: Owner.

## ผลกระทบที่ต้องรับทราบ

- เก็บ UUID, code, customer/site, project status, assignment และ audit เดิมครบ ไม่มีการลบ/rename โครงการหรือ Job
- Type เดิมที่ไม่ทราบใช้ Other; snapshot Other; dates/responsible person ไม่ทราบเป็น NULL; progress=0 ไม่อ้างว่าเป็นผลวัดจริง
- Job รุ่นเดิมไม่มี creator/date จึง backfill จาก Project เป็น fallback ที่ระบุชัด ไม่ใช่ original Job creation evidence
- Primary PM เติมเฉพาะ Project ที่มี PM membership เดียว; หลาย PM ยังเก็บครบและ primary=NULL จน Admin เลือก
- รหัสเก่าไม่เปลี่ยน แต่รับ namespace สำหรับ Job ใหม่ Counters/reservations ต้องรวมใน backup เสมอ รหัสใหม่ใช้เดือน Bangkok ณเวลาสร้าง
- API รุ่นเก่า strict schema verifier จะปฏิเสธ 003 เมื่อ restart ต้องจัด maintenance และย้าย Web/API เป็นรุ่นเดียวกัน ไม่ rollback application เก่าไปฐาน 003 โดยตรง
- Backup format 2 เพิ่ม types/counters/reservations; format 1 ต้องกู้ด้วยรุ่นเดิมลงฐานแยกก่อน migrate 003 ไม่ข้าม schema
- Runtime ต้องได้ SELECT/INSERT types+registry และ UPDATE เฉพาะ types/counters ไม่มี DDL/registry rewrite/audit rewrite

## Dry run ด้วยข้อมูลสมมติ (Local/CI)

1. สร้างฐาน/namespace ใหม่ชื่อสุ่มสำหรับ test ภายใต้ Native PostgreSQL ที่ทิ้งได้ กำหนดเฉพาะ TEST_DATABASE_URL ผ่าน environment ไม่คัดลอกจาก Railway
2. รัน `node --import tsx --test --test-concurrency=1 tests/*.test.ts` CI ทำทั้ง PGlite และ Native PostgreSQL จากชุดเดียวกัน
3. Case migration เตรียม 001/002 + schema checksums จริง แล้วสร้าง legacy A ไม่มี Site/Job, B, legacy Job/PM ด้วยข้อมูลสมมติ บันทึกเฉพาะผลเทียบ ไม่ใช้ข้อมูลจริง/รหัสผ่านจริง
4. รัน migrate → verifySchema → migrate ซ้ำ ตรวจ old fields/IDs/codes ไม่เปลี่ยน, seed 5/10 ไม่ซ้ำ, Other/default/null/backfill ถูก, primary PM ถูก, high-water mark ถูก
5. ทดสอบ 24 concurrent Project POST และ 24 concurrent Job POST บน connection pool; unique codes/reservations; PM cross-scope/privileged targets/duplicate/revoke audit; tests นี้ต้อง PASS Native ไม่ใช่เพียง PGlite
6. Backup format 2 จากชุดสมมติ → restore เฉพาะฐานใหม่ที่ไม่มี business data และมี seed ที่ยังไม่แก้ ตรวจ master customization, project/job/team/counters/registry, ปฏิเสธ restore ซ้ำ/ลงฐานมีข้อมูล
7. Native runtime test ตรวจห้าม DDL/audit change/registry change/counter delete; container build และ smoke ผ่านก่อนเสนอ deploy

การซ้อม CI ไม่ใช่ Staging UAT/Real LINE. Local ไม่มี Docker/PostgreSQL CLI ใน PATH จึงใช้ CI service PostgreSQL 17 และ Docker runner เป็นหลักฐาน native/container แยกจาก Local.

## ก่อน apply Staging (ต้องผ่านทุก gate ตาม D-024)

1. Owner ยืนยัน release SHA, maintenance window, ผู้ดูแล recovery และวิธีสำรองข้อมูลจริงแบบ private/encrypted แยกจาก test drill; คำสั่งรอบนี้ยังไม่อนุญาตใช้ข้อมูลจริงทดสอบหรือคัดลอก
2. ตรวจ Trial credits โดยไม่อัปเกรด; หากไม่พอหยุด ห้ามสร้างบริการเสียเงิน
3. สำรองฐานจริงด้วยวิธีที่ Owner อนุมัติและตรวจ restore ในขอบเขตที่อนุมัติ ถ้ายังไม่มี recoverable backup ห้าม migrate
4. Preflight แบบไม่พิมพ์ข้อมูลจริง: 001/002 checksum ตรง, ไม่มี migration M2, ไม่มีรหัสชนกันข้าม project/job ที่จะชน registry, ไม่มี date/namespace collision, บันทึก count/checksum เท่านั้น
5. หยุด writes/worker และปิด LINE ไว้ ใช้ migration operator แยก runtime; ตั้ง MIGRATION_ROLE=asas_m1_migrator ให้ `pnpm migrate` ใช้ SET LOCAL ROLE ในแต่ละ transaction ทำให้ objects ใหม่เป็นของ migrator ไม่ใช่ runtime
6. Apply `deploy/grant-m1-alignment.sql` หลัง schema ผ่าน; เก็บ actual database credentials ใน Secret Manager เท่านั้น รัน verify-runtime-db กับ runtime เดิม
7. Deploy API/Web จาก SHA ที่อนุมัติพร้อมกัน ตรวจ health/TLS/cookie/PM scope บนชุด PILOT ใหม่ที่ไม่แตะข้อมูลจริง ตรวจ old counts/checksum ด้วย operator ตามขอบเขตที่อนุมัติ ไม่เปิด LINE
8. อัปเดต PROJECT_STATUS/CHANGELOG/M1_TEST_EVIDENCE พร้อม migration checksum/CI/release/ข้อจำกัด และให้ Owner ตรวจเป็นรอบรวม

## เมื่อมีปัญหา

- ถ้า 003 ล้มเหลวก่อน COMMIT: runner rollback SQL/data/history ทั้ง migration; หยุดและตรวจสาเหตุ ไม่แก้ checksum 001/002 และไม่ retry แบบเดา
- ถ้า commit แล้ว: รักษาฐานไว้ ปิด writes ใช้ roll-forward migration 004 ที่ผ่าน test/approval แก้ปัญหา ห้ามลบ 003 หรือแก้ไฟล์ที่ apply แล้ว
- ถ้าต้อง recovery: restore backup ที่อนุมัติลงฐานใหม่แยก ตรวจผลก่อนสลับ connection ด้วย Owner approval ห้ามเขียนทับ Staging เดิม เก็บ high-water marks/reservations ของรหัสที่เคยออกหลัง backup แล้วเพื่อไม่ออกซ้ำ; หากกู้ประวัติรหัสไม่ได้ห้ามเปิด writes จนกำหนด namespace ใหม่ที่ไม่ชน
- Recovery แบบย้อน snapshot อาจสูญเสีย writes หลัง backup จึงต้อง maintenance freeze และ reconciliation ไม่อ้าง RPO/RTO โดยไม่มีการซ้อมจริง

สถานะ: OWNER_APPROVED_PROCESS / BLOCKED_BACKUP_AUTH. Manual backup ที่เข้ารหัสและดาวน์โหลดออกจาก provider ยังไม่ผ่าน; provider Backup/PITR ต้อง Pro จึงไม่ใช้ ไม่อนุญาตเปลี่ยนแผนหรือเปิด LINE.
