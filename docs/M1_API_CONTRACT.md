# M1 implemented contract

อ้างอิง migrations 001_foundation.sql / 002_line_outbox.sql และ ADR-010; ไม่แทน target schema ของโมดูลอนาคต

## ตารางที่มีจริง

| กลุ่ม | Tables / key / fields ที่สำคัญ |
| --- | --- |
| Identity | users: UUID, username unique, display_name, password_hash, role, active; employees: UUID, user_id unique, code, display_name, active |
| Sessions | sessions: SHA256 token key, user_id, expires_at; login_attempts: hashed username key, failures, blocked_until |
| Master | customers: UUID, code, name, creator; sites: UUID, customer_id, name; projects: UUID, customer_id, nullable site_id, code/name, ACTIVE/CLOSED, version, creator |
| Team | jobs: UUID/project_id/code/name; project_members: project_id + user_id (PM); job_assignments: UUID, project_id, nullable job_id, employee_id, created_by, revoked_at |
| Audit | audit_logs: UUID, actor_id, action, entity_id, JSON details, occurred_at |
| LINE | line_accounts: line_user_id → unique user_id; line_link_nonces / line_binding_codes: hash + expiry; line_group_bindings: group_id → project_id |
| Durability | line_event_inbox: webhookEventId PK, encrypted JSON payload, state/attempt/next_attempt/lease; notification_outbox: UUID + unique event_id, encrypted payload, state/attempt/next_attempt/lease/error category |

วันที่บันทึกใช้ timestamptz, UUID entity ไม่ใช้รหัสที่แสดงเป็น FK; unique active assignment รวม job_id=NULL; composite FK ตรวจ project/job และ customer/site ข้อมูลการเงินไม่มีใน M1

Staging API (NODE_ENV=production) ต้องผ่าน schema checksum, runtime-role restrictions และ TLS ก่อนฟัง HTTP. Runtime role ไม่มี ownership/DDL/CREATE/TEMP/membership หรือสิทธิ์แก้ migration history/audit เดิม; operator ใช้ migration role แยก. DATABASE_SSL_CA รับเฉพาะ public CA และห้าม URL SSL overrides. ดู [M1_DATABASE_SECURITY](M1_DATABASE_SECURITY.md); guard นี้ไม่เปลี่ยนสิทธิ์ผู้ใช้หรือ HTTP payload.

## HTTP `/api`

JSON strict input; mutation ต้องส่ง Origin เท่ากับ WEB_ORIGIN; server อ่านสิทธิ์จาก session ทุกครั้ง ไม่รับ role/actor จาก body

| Endpoint | Method | สิทธิ์ / payload หลัก |
| --- | --- | --- |
| login / logout / me | POST / POST / GET | username+password / current session / actor fields เท่านั้น |
| users | GET / POST | Admin/Owner ดู operational fields; Owner สร้าง username,password,display_name,role |
| users/:id | PATCH | Owner active boolean; ปิดบัญชีตนเองไม่ได้; ลบ sessions ของบัญชีที่เปลี่ยน |
| customers / sites | GET / POST | Admin/Owner; name / customer_id+name |
| projects | GET / POST | อ่านตาม scope; สร้าง Admin/Owner ด้วย customer_id,name,optional site_id |
| projects/:id | GET / PATCH | อ่าน scope; PM ที่ assigned หรือ Admin/Owner แก้ name,status,version |
| projects/:id/jobs | POST | Admin/Owner name; เฉพาะ Project ACTIVE |
| projects/:id/assignments | GET / POST | Admin/Owner; employee_id,optional job_id |
| assignments/:id | DELETE | Admin/Owner revoke พร้อม audit |
| projects/:id/pm | POST | Admin/Owner user_id,active เพื่อเพิ่ม/ถอนสิทธิ์ PM |
| audit | GET | Admin/Owner operational action/actor/time ไม่มี secret/details payload |
| health | GET | public DB probe; unavailable=503 |
| line/link | POST / DELETE | logged user; linkToken → official link URL / unlink current user |
| projects/:id/line-code | POST | Admin/Owner; รหัสผูกกลุ่มครั้งเดียวของผู้สร้าง อายุ 10 นาที |
| line/status | GET | Admin/Owner; counts สถานะ inbox/outbox ไม่คืน payload |
| line/webhook | POST | raw body + LINE signature + destination + pilot allowlist; ยกเว้น cookie/Origin |

401 ต้อง login ใหม่; 403 ไม่มีสิทธิ์/Originผิด; 404 scope ไม่ถึง; 409 conflict/constraint/stale version; 400 input; 429 rate limit; 500 ข้อความทั่วไปไม่คืน stack

PM/TECH ไม่เห็น user directory/audit/team assignments ของคนอื่น TECH เห็นรายชื่อ Job ภายใต้ Project ที่ตนมี assignment แต่ไม่มีสิทธิ์แก้ มุมมอง Job นี้ไม่เป็นการให้สิทธิ์ลงข้อมูลข้าม Job ใน M2

## LINE state

RECEIVED → PROCESSING → DONE หรือ RETRY → PROCESSING → DEAD (5 attempts); lease 1 นาที กู้ processing ที่ค้างได้ Outbox PENDING → SENDING → SENT/RETRY/DEAD และ CANCELLED เมื่อผู้รับหลุด allowlist ก่อนส่ง ไม่มี push fallback อัตโนมัติ

Account linking ที่ชน user/LINE เดิมไม่สลับเจ้าของ มี audit LINE_LINK_CONFLICT; ให้ unlink เดิมแล้วเชื่อมใหม่ เปลี่ยนกลุ่มที่ผูกแล้วต้องมีขั้นตอนตรวจโดย operator ไม่มี silent overwrite
