# M1 implemented contract

อ้างอิง migrations 001_foundation.sql / 002_line_outbox.sql / 003_m1_alignment.sql และ ADR-010; ไม่แทน target schema ของโมดูลอนาคต

## ตารางที่มีจริง

| กลุ่ม | Tables / key / fields ที่สำคัญ |
| --- | --- |
| Identity | users: UUID, username unique, display_name, password_hash, role, active; employees: UUID, user_id unique, code, display_name, active |
| Sessions | sessions: SHA256 token key, user_id, expires_at; login_attempts: hashed username key, failures, blocked_until |
| Master | customers; optional sites; configurable project_types/job_types; projects: UUID, customer_id, nullable site_id, immutable code, name, type, primary PM, dates, status PLANNED/ACTIVE/COMPLETED/CLOSED, priority, description, progress, version, creator/time |
| Team | jobs: UUID/project_id/code/name/type/description/responsible person/planned date/status/progress/version/creator/time; project_members: project_id + user_id (PM); job_assignments: UUID, project_id, nullable job_id, employee_id, created_by, revoked_at |
| Code registry | code_counters: atomic high-water values; code_reservations: immutable committed code identity retained across backup/restore |
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
| projects/:id | GET / PATCH | อ่าน scope; PM ที่ assigned หรือ Admin/Owner แก้ operational fields ตามรายละเอียดด้านล่าง; version required |
| projects/:id/jobs | POST | Admin/Owner/PM ที่รับผิดชอบ; Project PLANNED/ACTIVE |
| projects/:id/assignments | GET / POST | Admin/Owner หรือ PM ใน Project ตนเฉพาะ target TECH; employee_id,optional job_id |
| assignments/:id | DELETE | Admin/Owner หรือ PM ใน Project ตนเฉพาะ target TECH; revoke พร้อม audit |
| projects/:id/pm | POST | Admin/Owner user_id,active เพื่อเพิ่ม/ถอนสิทธิ์ PM |
| audit | GET | Admin/Owner operational action/actor/time ไม่มี secret/details payload |
| health | GET | public DB probe; unavailable=503 |
| line/link | POST / DELETE | logged user; linkToken → official link URL / unlink current user |
| projects/:id/line-code | POST | Admin/Owner; รหัสผูกกลุ่มครั้งเดียวของผู้สร้าง อายุ 10 นาที |
| line/status | GET | Admin/Owner; counts สถานะ inbox/outbox ไม่คืน payload |
| line/webhook | POST | raw body + LINE signature + destination + pilot allowlist; ยกเว้น cookie/Origin |

401 ต้อง login ใหม่; 403 ไม่มีสิทธิ์/Originผิด; 404 scope ไม่ถึง; 409 conflict/constraint/stale version; 400 input; 429 rate limit; 500 ข้อความทั่วไปไม่คืน stack

PM/TECH ไม่เห็น user directory/audit; PM เห็น TECH assignment เฉพาะ Project ที่ตนเป็น PM เพื่อจัดทีม TECH ที่รับมอบหมายระดับ Project เห็น Job ภายใน Project ส่วน Job-level เห็นเฉพาะ Job ที่ได้รับมอบหมาย ไม่ได้สิทธิ์แก้หรือสิทธิ์ M2

## LINE state

RECEIVED → PROCESSING → DONE หรือ RETRY → PROCESSING → DEAD (5 attempts); lease 1 นาที กู้ processing ที่ค้างได้ Outbox PENDING → SENDING → SENT/RETRY/DEAD และ CANCELLED เมื่อผู้รับหลุด allowlist ก่อนส่ง ไม่มี push fallback อัตโนมัติ

Account linking ที่ชน user/LINE เดิมไม่สลับเจ้าของ มี audit LINE_LINK_CONFLICT; ให้ unlink เดิมแล้วเชื่อมใหม่ เปลี่ยนกลุ่มที่ผูกแล้วต้องมีขั้นตอนตรวจโดย operator ไม่มี silent overwrite

## Project display context — D-020

GET projects และ projects/:id คืน customer_name และ site_name (string หรือ null) เพิ่มจาก project fields เดิม โดย join หลังใช้ขอบเขต Project เดิม ช่าง/PM อ่านได้เฉพาะลูกค้าและสถานที่ของโครงการที่ตนมีสิทธิ์ ไม่เปิด endpoint directory และไม่คืน contact/ข้อมูลเงิน Job อยู่ภายใต้โครงการเช่นเดิม ไม่มี schema migration

## M1 Alignment endpoints (003)

- GET /project-types และ /job-types: authenticated operational master including disabled entries ordered sort_order/code
- POST /project-types หรือ /job-types: OWNER/ADMIN; code (uppercase stable), display_name, sort_order optional; idempotent code uniqueness (duplicate=409)
- PATCH /project-types/:id หรือ /job-types/:id: OWNER/ADMIN; version required, display_name/sort_order/enabled optional; no code/id/delete mutation; stale=409
- POST /projects: เดิม + project_type_id (default Other), project_manager_id nullable, start_date/target_completion_date nullable ISO dates, status PLANNED/ACTIVE/COMPLETED/CLOSED (default ACTIVE compatible), priority LOW/NORMAL/HIGH/URGENT, description<=4000, progress int0–100; server generates immutable code
- PATCH /projects/:id: version required, operational fields optional; manager change OWNER/ADMIN only; CLOSED reopen requires OWNER/ADMIN+reason; no customer/site/code replacement via PATCH
- GET projects/project detail: operational fields + created_by/created_at + type code/name/enabled + type_name_snapshot + PM name; no financial data
- POST /projects/:id/jobs: name plus job_type_id, description, responsible_person_id nullable scoped employee, planned_date nullable, status PLANNED/ACTIVE for new Job, progress; actor/time/code assigned by server
- PATCH /projects/:id/jobs/:job: version required and optional fields; same-project enforced; full Job lifecycle validation; Project CLOSED rejects edit; DONE/CANCELLED cannot reopen
- GET /projects/:id/assignable-technicians: OWNER/ADMIN/assigned PM; active TECH employee ID/name only; no username/credentials/contacts
- GET assignments: PM receives TECH team only in own Project; assign/revoke enforces role+membership+target role on server in locked transaction

Disabled type remains usable on unchanged record and retains snapshot; new/different selection rejects409. Assign duplicate409/revoke repeated404 do not create another audit. Code reservation and insert/audit share transaction; no code reset/reuse endpoint. Project code PRJ-YYMM-NNN Bangkok month; Job code JOB-projectNamespace-NN. Padding minimum expands at 1000/100. Legacy code remains unchanged. Primary PM backfill and membership compatibility documented in ADR-011.

## LINE disabled capability — D-026

GET /me เพิ่ม line_enabled:boolean (true เฉพาะ LINE_ENABLED=true); ยังต้องมี session ไม่มี secret/counters. Web ใช้ boolean นี้ปิด link/unlink/group-code controls. POST/DELETE /line/link และ POST /projects/:id/line-code คืน503เมื่อ disabled โดยไม่เปลี่ยน DB; group-code คง role guard เดิม OWNER/ADMIN ก่อน feature gate. LINE status/webhook/worker คงกติกาเดิม ไม่เปิด Real LINE.
