# ADR-010 — Foundation slice และขอบเขตการทดสอบ

วันที่ 2026-09-21 · Accepted สำหรับ implementation M1 ตามคำสั่งเริ่มของ Owner; deployment ยังไม่อนุมัติ

ใช้ TypeScript strict / Next.js / Fastify / PostgreSQL ตาม ADR-006 แยก API, domain, database และ worker เว็บกับ LINE ใช้ project visibility service เดียวกัน งาน M0 คงเดิม ไม่มีโมดูลเวลา/OT/เงินใน M1

บนเครื่องนี้ไม่มี PostgreSQL service หรือ Docker จึงใช้ PGlite (PostgreSQL WASM) ที่บันทึกลง disk สำหรับทดลองเว็บและทดสอบ SQL; staging/production และ LINE worker บังคับ PostgreSQL service ผ่าน pg และ DATABASE_URL CI มี PostgreSQL 17 แยกทดสอบ ห้ามอ้าง PGlite ว่าเป็นหลักฐาน native PostgreSQL/concurrency/production

ใช้ opaque session cookie HttpOnly/SameSite=Strict, Secure เมื่อ HTTPS; เก็บเฉพาะ SHA-256 ของ session token ใน DB อายุ 8 ชั่วโมง และตรวจ active role ทุกคำขอ mutation ตรวจ Origin ตรงเว็บ มี rate limit และล็อก login ชั่วคราว รหัสผ่านใช้ salted scrypt (Node defaults N=16384,r=8,p=1,64-byte output) ไม่มี public signup Owner สร้างบัญชีผ่านเว็บ และ bootstrap ใช้ได้เมื่อฐานว่างเท่านั้น ทางเลือก hosted auth ยังไม่เลือกผู้ให้บริการ จึงต้อง review identity/security และ password recovery/MFA ก่อน production ไม่อ้างว่าพร้อม production

Admin/Owner สร้างลูกค้า/Project/optional Site/Job และมอบหมายทีม; PM แก้ชื่อ/สถานะเฉพาะ Project ที่ได้รับสิทธิ์; TECH อ่านงานที่ได้รับมอบหมาย ข้อมูลการเงินยังไม่มีใน schema/API นี้ ไม่บังคับ Job เมื่อไม่มี Job รองรับ Owner หลายบัญชีเก็บ actor แยก

Schema M1 เป็น executable subset ของ target schema: UUID สำหรับ entity, composite FK ป้องกัน Site ผิดลูกค้า/Job ผิด Project, active assignment uniqueness รวม NULL Job, optimistic version และ audit ใน transaction เดียวกัน Target schema ที่ยังไม่มี migration เป็น milestone ถัดไป ไม่สร้าง Opportunity/ledger/payroll ไว้ล่วงหน้า

LINE ใช้ official account-link flow และ HMAC ของ raw body; nonce/รหัสผูกกลุ่มเก็บ hash ใช้ครั้งเดียวใน 10 นาที รหัสกลุ่มใช้ได้เฉพาะบัญชีผู้สร้างที่มีสิทธิ์ Admin/Owner ไม่เปลี่ยน binding เดิมเงียบ ๆ

Inbox dedupe ด้วย webhookEventId; transaction สร้าง outbox แล้วจึง DONE worker ใช้ lease/retry สูงสุด 5 ครั้ง มี DEAD status ไม่อ้าง exactly-once delivery ของ LINE เมื่อส่งแล้ว network ขาด อนุญาตเฉพาะ user/group allowlists ของ pilot; กลุ่มได้ข้อความทั่วไป งานส่วนตัวอ่าน scope ใหม่ก่อนส่ง ข้อมูล payload inbox/outbox เข้ารหัส AES-256-GCM ด้วย key นอก Git และล้างหลังสำเร็จ ไม่เก็บ raw body ใน log

Backup logical snapshot ใช้ repeatable read พร้อม schema checksum; restore รับเฉพาะฐานว่างและตรวจ checksum ไม่ restore sessions/pending LINE tokens เพื่อไม่ส่งข้อความเก่าซ้ำ ไฟล์ backup มีข้อมูลส่วนบุคคลและ password hash ต้องอยู่ private encrypted storage การทดสอบ local ใช้ข้อมูลสมมติเท่านั้น

M1 CODED/TESTED_LOCAL ไม่เท่ากับ DEPLOYED/UAT_PASSED ต้องทดสอบ LINE จริงจาก OA/กลุ่มที่ Owner ระบุ และทดสอบ native PostgreSQL/HTTPS/backup restore บน staging ก่อนปิด Gate ไม่มี permission ให้ deploy production หรือเริ่ม M2 จาก ADR นี้

Account recovery, MFA, role changes, group unbind/rebind UI, DLQ replay UI และ automated backup scheduler ยังไม่มี ต้องประเมินก่อน real pilot/production; ไม่เพิ่มเมนูว่าง

อ้างอิงที่ตรวจเมื่อ implementation: [LINE account linking](https://developers.line.biz/en/docs/messaging-api/linking-accounts/), [LINE signature verification](https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/), [PGlite filesystems](https://pglite.dev/docs/filesystems), [PostgreSQL constraints](https://www.postgresql.org/docs/18/ddl-constraints.html)

หลักฐานปัจจุบันและรายการ NOT_RUN ดู [M1_TEST_EVIDENCE](../M1_TEST_EVIDENCE.md)
