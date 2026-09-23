# M1 — ผลซ้อม Backup/Restore ด้วยข้อมูลสมมติบน Railway

ซ้อม 22 กันยายน 2026 · บันทึก 23 กันยายน 2026 · Operator: Codex · D-019

## ผล: PASS เฉพาะการสำรองและกู้คืนฐานสมมติ

ใช้ PostgreSQL 18 service เดิมใน Railway Trial ไม่สร้าง paid service ไม่ใช้ฐานที่ Owner กรอกข้อมูลจริงเป็นต้นทางของ data backup ไม่แก้/ลบ/restore ทับฐานนั้น LINE และ worker ของชุดซ้อมไม่เปิด

- source: `m1_drill_20260922_source`
- destination: `m1_drill_20260922_restore`
- ตรวจว่าชื่อทั้งสองยังไม่มีและฐานหลักมี schema M1 18 tables / 2 migrations ก่อนสร้างฐานใหม่ที่ว่าง เจ้าของฐานคือ migration role เดิม
- อ่านเฉพาะ schema ด้วย `pg_dump --schema-only --schema=public --no-owner --no-privileges --no-comments --no-security-labels` และ metadata migration history ไม่มีแถวข้อมูลผู้ใช้/ลูกค้า/โครงการจริงถูกคัดลอก
- เตรียม schema ของ source ภายใต้ `SET ROLE asas_m1_migrator`; ใส่ข้อมูล PILOT สมมติใน transaction หลังตรวจ users/customers/projects/audit ว่าง
- บัญชีสมมติในฐานซ้อมใช้ค่าที่ไม่ใช่ password hash ใช้ Login ไม่ได้ ไม่ใช่บัญชีที่ Owner ต้องใช้ทดสอบ Web
- ทั้งสองฐานถอน PUBLIC database privileges และยืนยันว่า runtime ของ Web ไม่มี CONNECT เข้าฐาน restore จึงไม่เปิดข้อมูลชุดซ้อมผ่าน Web

## วิธีสำรองและกู้คืนที่ทดสอบจริง

ใช้ native `pg_dump --format=custom` / `pg_restore` บน provider console ผ่าน Unix socket ของ operator **ไม่ใช่การทดสอบ application logical backup CLI บน Staging**

Dump ไม่รวม data ของ sessions, login_attempts, line_link_nonces, line_binding_codes, line_event_inbox และ notification_outbox (ยังเก็บ schema ของตารางเหล่านี้) ไม่คืน session/code เก่าหรือคิวส่ง LINE

ก่อน restore ตรวจว่า destination มี public tables 0 ตาราง ใช้ `--role=asas_m1_migrator --single-transaction --exit-on-error --no-owner --no-privileges --no-comments`; ไม่ใช้ `--clean`, DROP, TRUNCATE หรือ overwrite ฐานเดิม TOC ไม่สร้าง public schema ซ้ำกับ schema ว่างของฐานใหม่

ไฟล์อยู่เฉพาะ `/tmp/asas-m1-drill-20260922/synthetic.dump` ใน Postgres container; directory mode 700 / file mode 600 ไม่ดาวน์โหลด ไม่แนบ Git/แชท ไม่มี password/hash ของบัญชีจริง

SHA-256: `010da8cb06257c85e039e8bc8f30bbe594ec926cb29e8c5210f3ac16cc1b362d`

## หลักฐานที่ตรวจ

| รายการ | ผล |
| --- | --- |
| จำนวนหลัง restore: users 5, employees 2, customers 1, projects 2, sites 1, jobs 1, assignments 1, PM membership 1, audit 4 | PASS |
| Digest ของข้อมูลทุก column/row ของ 9 business tables และ migration history ตรงกันระหว่าง source/restore (ไม่พิมพ์ row data) | PASS |
| Project A ไม่มี Site และไม่มี Job | PASS |
| Project B เชื่อม Site ที่ลูกค้าเดียวกันและ Job ของ B | PASS |
| Assignment และ Audit รวมอยู่ใน exact-data comparison | PASS |
| Source ใส่ transient fixture; destination sessions/login attempts/nonces/codes/inbox/outbox ว่างทั้งหมด | PASS |
| Application runtime ไม่มี CONNECT เข้าฐาน restore | PASS |
| Restart Web/API และเปรียบเทียบข้อมูลหลัง restart | แยกบันทึกใน PROJECT_STATUS; ไม่อนุมานจาก restore |
| Login/สิทธิ์ผ่าน Web บนฐาน restore | NOT_RUN — ไม่มี Web ชี้ฐานซ้อม และ fixture Login ไม่ได้ |

## ขอบเขตผลและงานค้าง

พิสูจน์ว่ากู้คืนโครงสร้างและข้อมูลสมมติของ M1 ด้วย PostgreSQL tools ได้ภายใน provider ปัจจุบัน ไม่ใช่หลักฐานว่ามี backup ของข้อมูลจริงใน Staging และไม่ใช่ disaster recovery เมื่อ provider/volume ทั้งหมดสูญหาย

ยังไม่มี encrypted off-provider copy/scheduled backup และยังไม่วัด RPO/RTO แบบ production ไฟล์ใน /tmp อาจหายเมื่อ container ถูกแทนที่ ฐานสมมติทั้งสองยังคงอยู่และไม่ได้ลบเพื่อทำตามข้อห้ามลบ/เขียนทับข้อมูล หากต้องซ้อมใหม่ให้ใช้ชื่อใหม่และตรวจงบ/พื้นที่ก่อน ไม่ลบฐานเดิมอัตโนมัติ
