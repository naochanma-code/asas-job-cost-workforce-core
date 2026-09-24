# Data Dictionary — logical design M0

## Executable M1 Alignment 003 — แยกจาก target design ด้านล่าง

| Entity | Fields / constraints |
| --- | --- |
| project_types / job_types | id UUID PK; code UNIQUE immutable uppercase; display_name 1–160; sort_order int; enabled bool; version; created_at; rename/order/enable audited |
| projects | code immutable; customer required/site optional same customer; project_type_id FK default Other; type_name_snapshot; project_manager_id nullable users PM; start_date/target_completion_date nullable ordered; status PLANNED/ACTIVE/COMPLETED/CLOSED; priority LOW/NORMAL/HIGH/URGENT; description; progress int0–100; created_by/created_at/version; code_namespace UNIQUE |
| jobs | project_id required; code immutable; job_type_id default Other; type_name_snapshot; name/description; responsible_person_id optional FK employees scoped to team; planned_date optional; status PLANNED/ACTIVE/BLOCKED/DONE/CANCELLED; progress0–100; created_by/created_at/version |
| code_counters | scope PK PROJECT:YYMM or JOB:projectUUID; last_value bigint atomic increment |
| code_reservations | code PK/entity_id UNIQUE/kind/issued_at; old codes backfilled; runtime SELECT/INSERT only; no reset API |
| project_members / job_assignments | existing nullable Job scope and unique active assignment; PM targets TECH only in own project; all success audited |

Project seed5 / Job seed10 ตาม D-023. Disabled type retains old records/snapshot. Legacy Job creator/date inherits Project as explicit fallback; unknown dates/responsible person stayNULL. No financial data. See [migration plan](M1_ALIGNMENT_MIGRATION_PLAN.md) and [API](M1_API_CONTRACT.md).

DESIGNED / PROPOSED implementation; business decisions ล่าสุดตาม [ADR-007](adr/007-owner-decisions-m0-r2.md) Accepted; ไม่ใช่ SQL migration อ้าง MASTER §7 และ [ADR](adr/README.md) ชื่อ field ด้านล่างเป็น contract proposal ที่ต้อง review ก่อน M1 รายการตัวอย่างทุกค่าคือข้อมูลสมมติ

## ประเภทและการอ่าน

ทุก entity มี `id:uuid PK`, `created_at:timestamptz NOT NULL`, `created_by:uuid FK users` (nullable เฉพาะ system พร้อม actor_kind), และ mutable entity มี `updated_at:timestamptz`, `version:int >=1` สำหรับ optimistic concurrency Ledger/audit ไม่มี update/delete; system actor ต้องระบุ correlation_id ไม่ปลอม user

เครื่องหมาย `?` = nullable; ไม่มี ? = NOT NULL ยกเว้นระบุ conditional ชัดเจน `ref(table)` = uuid FK; `money` = bigint integer satang THB; `date` = business date Asia/Bangkok; timestamps เก็บ UTC แสดงไทย; `minutes` integer; money arithmetic ใช้ exact decimal/rational เท่านั้น `json snapshot` ต้องมี schema_version และตรวจ schema ไม่ใช่ช่องใส่ FK ลอย ๆ

Sensitivity: OP operational, PII จำกัดบุคคล/assignment, FIN expense/budget ตาม role, PAY Owner-only รวม rate/derived amount, SYS service-only. ไม่มีข้อมูลจริงในเอกสารนี้

Project transaction ใช้ `project_id:ref(projects)` เสมอและ `job_id:ref(jobs)?`; composite FK `(project_id,job_id)` ไป `(jobs.project_id,jobs.id)` เมื่อ job มีค่า ห้ามรับ Job ต่าง Project โครงสร้างนี้ใช้กับ assignments, budget_lines, work_entries, overtime_entries, expense_submissions, cost_ledger และ commitment ไม่ให้ nullable project เพื่อรองรับ phase อื่นก่อนเวลา

## Identity, customer และงาน

| Entity | Fields เพิ่มจาก common | Constraint / index / classification |
| --- | --- | --- |
| users | auth_subject:text, role:OWNER/ADMIN/PM/TECH, status:ACTIVE/DISABLED | UNIQUE(auth_subject); role ไม่ได้มาจาก LINE display name; OWNER มีหลาย users ได้ ไม่มี unique(role); audit เก็บผู้กระทำรายบัญชี; OP/PII |
| employees | user_id:ref(users)?, code:text, display_name:text, active:boolean | UNIQUE(user_id) เมื่อไม่ null, UNIQUE(code); disable ไม่ลบ history; PII |
| employee_rate_versions | employee_id:ref(employees), valid_from:date, valid_to:date?, daily_rate_satang:money, reason:text, approved_by:ref(users) | rate>0; [from,to) ไม่ overlap ต่อ employee; index(employee_id,valid_from); PAY |
| line_accounts | user_id:ref(users), channel_id:text, line_user_id:text, linked_at:timestamptz, revoked_at:timestamptz? | UNIQUE(channel_id,line_user_id) active; linking proof single-use ใน secure store; PII/SYS |
| customers | code:text, name:text, active:boolean | UNIQUE(code); archive แทน hard delete; PII |
| sites | customer_id:ref(customers), code:text, name:text, address:text?, active:boolean | UNIQUE(customer_id,code); index(customer_id); PII |
| projects | code:text, customer_id:ref(customers), name:text, site_id:ref(sites)?, job_required:boolean=false, status:ACTIVE/CLOSED, source_opportunity_id:ref(opportunities)? | UNIQUE(code); site ต้องเป็นลูกค้าเดียวกัน; code immutable; index(status,customer_id); OP |
| jobs | code:text, context_type:PROJECT/OPPORTUNITY/INTERNAL, project_id:ref(projects)?, opportunity_id:ref(opportunities)?, job_type_id:ref(job_types), job_type_name_snapshot:text, name:text, status:ACTIVE/CLOSED | PROJECT ต้องมี project_id และไม่มี opportunity; OPPORTUNITY กลับกัน; INTERNAL ไม่มีทั้งคู่; UNIQUE(code), UNIQUE(project_id,id); index(project_id,status); OP |
| job_types | code:text, label:text, sort_order:int, enabled:boolean | UNIQUE(code); used code immutable; seed ตาม MASTER §2.3; OP |
| project_members | project_id:ref(projects), user_id:ref(users), member_role:PM/TECH, active_from:date, active_to:date? | ไม่ overlap membership เดียวกัน; index(user_id,active_to,project_id); OP |
| job_assignments | project_id, job_id?, employee_id:ref(employees), valid_from:date, valid_to:date? | Project assignment default job=null; unique active scope ต้องใช้ NULLS NOT DISTINCT/partial constraints; index(employee_id,project_id); OP |

ชื่อ job_assignments คงตาม master แต่รองรับ Project assignment โดยไม่สร้าง Job ตาม ADR-001 ประวัติย้าย Site/ปิดงาน/reopen เก็บ audit before/after/reason และไม่เปลี่ยน transaction snapshot เก่า

## Budget และเวลา

| Entity | Fields | Constraint / query / sensitivity |
| --- | --- | --- |
| cost_categories | code:text, label:text, enabled:boolean, sort_order:int | UNIQUE(code); 11 codes ตาม MASTER §5; used code ไม่เปลี่ยนความหมาย; OP |
| budgets | project_id:ref(projects), revision:int, status:DRAFT/APPROVED/SUPERSEDED, approved_at:timestamptz?, approved_by:ref(users)?, reason:text?, supersedes_id:ref(budgets)? | UNIQUE(project_id,revision); หนึ่ง active APPROVED/project; FIN/PAY ตามหมวด |
| budget_lines | budget_id:ref(budgets), project_id, job_id?, category_id:ref(cost_categories), amount_satang:money, kind:ENVELOPE/ADDITIONAL/ALLOCATION, parent_line_id:ref(budget_lines)? | amount>=0; budget/project ตรงกัน; allocation มี parent envelope เดียว project/category; index(budget_id,category_id,job_id); Q-05; FIN/PAY |
| work_entries | project_id, job_id?, employee_id:ref(employees), work_date:date, day_part:FULL/AM/PM, note:text?, status:DRAFT/SUBMITTED/APPROVED/REJECTED/CANCELLED, revision:int, supersedes_id:ref(work_entries)?, submitted_by:ref(users), source_channel:WEB/LINE, submitted_at:timestamptz?, reviewed_at:timestamptz?, reviewed_by:ref(users)?, reason:text? | index(employee_id,work_date), (project_id,status,work_date); active FULL กัน AM/PM overlap; สอง Project ใช้ AM/PM อย่างละครึ่งรวม1วัน (Q-04 Accepted); OP/PII |
| overtime_entries | project_id, job_id?, employee_id:ref(employees), work_date:date, hours:decimal(8,2), work_entry_id:ref(work_entries)?, reason:text, status:same Work, revision:int, supersedes_id:ref(overtime_entries)?, submitted_by:ref(users), source_channel:WEB/LINE, submitted_at:timestamptz?, reviewed_by:ref(users)?, reviewed_at:timestamptz? | hours>0; work_date เป็นวันที่เลือก (ย้อนหลังได้), ไม่แยกข้ามเที่ยงคืน, ไม่บังคับ start/end; CHECK(hours>0 AND hours*2 เป็นจำนวนเต็ม) รับทีละ0.5 ไม่ปัด input; work reference employee/project match; missing work exception Q-03; index(employee_id,work_date),(project_id,status); OP |
| holiday_calendars | calendar_version:int, holiday_date:date, label:text, is_holiday:boolean, reason:text | UNIQUE(calendar_version,holiday_date); version snapshot; Sunday default ไม่คูณซ้ำเมื่อเป็นวันหยุดด้วย; OP |
| payroll_policy_versions (เพิ่มเพื่อรองรับข้อกำหนด version) | code:text, valid_from:date, valid_to:date?, formula_schema_version:int, parameters:json, approved_by:ref(users) | ไม่ overlap ต่อ code; params เช่น multipliers, meal, hourly rounding; published immutable; PAY |

FULL/AM/PM ไม่ใช้ float สัดส่วนเป็น rational 1 หรือ 1/2 การอนุมัติหลายรายการวันเดียวต้องล็อก employee/date และตรวจ overlap ใน transaction จริงก่อนใช้ Owner ยืนยันการแบ่งครึ่งวันแล้ว; ยังไม่สร้าง constraint migration

## Expense และต้นทุน

| Entity | Fields | Constraint / query / sensitivity |
| --- | --- | --- |
| expense_submissions | project_id, job_id?, code:text, employee_id:ref(employees)?, expense_date:date, category_id:ref(cost_categories), amount_satang:money, quantity:decimal(12,2)?, unit:text?, description:text, status:DRAFT/PENDING_REVIEW/APPROVED/REJECTED/CANCELLED, revision:int, supersedes_id:ref(expense_submissions)?, submitted_by:ref(users), source_channel:WEB/LINE, submitted_at:timestamptz?, reviewed_by:ref(users)?, reviewed_at:timestamptz? | amount>0; UNIQUE(code,revision); submit มี READY evidence 1–5; index(project_id,status,expense_date),(submitted_by,expense_date); FIN/PII |
| expense_evidence | expense_id:ref(expense_submissions), project_id, job_id?, owner_user_id:ref(users), revision:int, sequence:int, object_key:text, sha256:char(64), mime_type:text, byte_size:bigint, stored_at:timestamptz, retain_until:timestamptz, expired_at:timestamptz?, source_channel_id:text?, line_message_id:text?, state:RECEIVED/FETCHING/READY/RETRY/FAILED, replaces_id:ref(expense_evidence)? | sequence 1–5 active; bytes 1..10MB; UNIQUE(object_key), UNIQUE(channel_id,line_message_id) when present; hash ไม่ unique ข้ามผู้ส่งเพราะรูปเดียวอาจต้อง review; expense/project/job match; FIN/PII |
| expense_review_history | expense_id:ref(expense_submissions), source_version:int, action:text, before:json, after:json, reason:text, actor_id:ref(users), occurred_at:timestamptz | append-only; index(expense_id,occurred_at); ไม่มีหลักฐาน binary; FIN/PII |
| cost_ledger | project_id, job_id?, category_id:ref(cost_categories), source_type:APPROVED_WORK_ENTRY/APPROVED_OT_ENTRY/APPROVED_EXPENSE/MANUAL_ADJUSTMENT, work_entry_id:ref(work_entries)?, overtime_entry_id:ref(overtime_entries)?, expense_id:ref(expense_submissions)?, manual_adjustment_id:ref(cost_adjustments)?, source_revision:int, component:LABOR/OT/MEAL/EXPENSE/ADJUSTMENT, amount_satang:money, currency:THB, direction:POST/REVERSAL, reverses_id:ref(cost_ledger)?, policy_version_id:ref(payroll_policy_versions)?, rate_version_id:ref(employee_rate_versions)?, calculation_snapshot:json?, posted_at:timestamptz | exactly-one typed source FK/type match; immutable; UNIQUE(source type,source FK,revision,component,direction) via per-type index; UNIQUE(reverses_id); index(project_id,posted_at,category_id); labour components PAY |
| cost_adjustments (supporting) | project_id, job_id?, category_id:ref(cost_categories), amount_satang:money, reason:text, owner_id:ref(users), reference:text? | only Owner; nonzero signed amount; append-only; FIN/PAY |
| project_commitments (supporting forecast) | project_id, job_id?, category_id:ref(cost_categories), amount_satang:money, description:text, status:OPEN/SETTLED/CANCELLED, settled_expense_id:ref(expense_submissions)? | amount>=0; link settlement เพื่อไม่รวม commitment + posted expense ซ้ำ; FIN/PAY |

Cost WORK มี LABOR และ MEAL components ในหนึ่ง posting group ไม่ใช่สองเหตุการณ์ source ซ้ำ; OT มี OT; Expense มี EXPENSE หนึ่ง component ถ้า reversal ต้องคืนค่าตรงข้ามของแต่ละ original line โดยไม่คำนวณ rate ใหม่ Cost total คือ SUM ledger signed amounts เท่านั้น

## Payroll (PAY ทั้งกลุ่ม ยกเว้น projection วัน/ชั่วโมง/status)

| Entity | Fields | Constraint / query |
| --- | --- | --- |
| payroll_periods | period_month:date, starts_on:date, ends_on:date, review_due_at:timestamptz, payment_due_at:timestamptz | UNIQUE(period_month); first..last calendar date ไทย; index(starts_on,ends_on) |
| payroll_runs | period_id:ref(payroll_periods), revision:int, state:OPEN/TIME_REVIEWED/OWNER_REVIEW/APPROVED/LOCKED/PAID, supersedes_run_id:ref(payroll_runs)?, time_reviewed_at:timestamptz?, approved_by:ref(users)?, approved_at:timestamptz?, locked_at:timestamptz?, paid_at:timestamptz?, payment_reference:text?, payment_evidence_key:text?, input_digest:char(64)?, snapshot_schema_version:int | UNIQUE(period_id,revision); one current run/period; frozen revision immutable; paid evidence restricted private storage |
| payroll_lines | run_id:ref(payroll_runs), employee_id:ref(employees), work_entry_id:ref(work_entries)?, overtime_entry_id:ref(overtime_entries)?, adjustment_id:ref(payroll_adjustments)?, component:LABOR/MEAL/OT/ADJUSTMENT, source_revision:int, amount_satang:money, rate_version_id:ref(employee_rate_versions)?, policy_version_id:ref(payroll_policy_versions)?, employee_name_snapshot:text, calculation_snapshot:json | exactly-one source; unique(run,source,revision,component); snapshot วัน/สูตร/input/calendar/rate/result; draft calculation ก่อน approve |
| payroll_adjustments | employee_id:ref(employees), original_period_id:ref(payroll_periods)?, target_period_id:ref(payroll_periods), source_work_id:ref(work_entries)?, source_ot_id:ref(overtime_entries)?, kind:MANUAL_ADD/MANUAL_DEDUCT/LATE_ADJUSTMENT/CORRECTION_PAYMENT, amount_satang:money?, reason:text, owner_id:ref(users)?, evidence_key:text?, status:PROPOSED/APPROVED/APPLIED/REJECTED | late request ยังไม่มี amount/owner ได้จน Owner ตัดสิน; approve ต้อง amount+owner; deduct signed negative; correction linked original; unique applied reference |
| payroll_ledger | payroll_line_id:ref(payroll_lines), run_id:ref(payroll_runs), employee_id:ref(employees), amount_satang:money, direction:POST/REVERSAL, reverses_id:ref(payroll_ledger)?, posted_at:timestamptz | immutable; UNIQUE(payroll_line_id,direction), UNIQUE(reverses_id); run/employee match line; index(run_id,employee_id); ไม่ post เข้า Cost Ledger |
| payroll_revision_history | period_id:ref(payroll_periods), old_run_id:ref(payroll_runs), new_run_id:ref(payroll_runs), reason:text, actor_id:ref(users), changed_at:timestamptz | append-only; unique(old,new); จ่ายแล้วไม่ reopen run เดิม |

## Integration และ Audit

| Entity | Fields | Constraint / index / privacy |
| --- | --- | --- |
| line_group_bindings | channel_id:text, group_id:text, project_id:ref(projects), bound_by:ref(users), bound_at:timestamptz, revoked_at:timestamptz? | one active (channel,group); many groups/project intentional; SYS |
| line_binding_codes (supporting) | project_id:ref(projects), code_hash:text, expires_at:timestamptz, used_at:timestamptz?, issued_by:ref(users) | UNIQUE(code_hash); single-use atomic claim; ไม่เก็บ raw token ใน log; SYS |
| line_event_inbox | channel_id:text, webhook_event_id:text, payload_ref:text, payload_digest:char(64), state:RECEIVED/PROCESSING/DONE/RETRY/DEAD, attempts:int, lease_until:timestamptz?, next_attempt_at:timestamptz?, last_error_category:text?, correlation_id:uuid | UNIQUE(channel,event); index(state,next_attempt_at,lease_until); raw payload encrypted restricted retention ไม่ใส่ log; SYS/PII |
| line_conversation_flows | channel_id:text, source_kind:GROUP/PRIVATE, source_id:text, sender_id:ref(line_accounts), project_id, job_id?, flow_id:uuid, action:WORK/OT/EXPENSE, state:text, work_entry_id:ref(work_entries)?, overtime_entry_id:ref(overtime_entries)?, expense_id:ref(expense_submissions)?, expires_at:timestamptz, version:int | isolation key ครบทุกองค์ประกอบรวม nullable Job; one eligible image receiver/route หรือขอผู้ส่งเลือก; draft source มีได้ไม่เกินหนึ่ง typed FK และต้องตรง action; required เมื่อมี source draft แล้ว; SYS |
| notification_outbox | event_id:ref(line_event_inbox)?, business_action_key:text, recipient_ref:text, template_code:text, state:PENDING/SENDING/SENT/RETRY/DEAD, attempts:int, next_attempt_at:timestamptz?, lease_until:timestamptz?, provider_message_id:text?, last_error_category:text? | UNIQUE(business_action_key,recipient_ref,template_code); index(state,next_attempt_at); no payroll group payload; SYS |
| audit_logs | actor_id:ref(users)?, actor_kind:USER/SYSTEM, action:text, entity_type:text, entity_id:uuid, before:json?, after:json?, reason:text?, correlation_id:uuid, occurred_at:timestamptz, sensitivity:OP/PII/FIN/PAY | append-only, index(entity_type,entity_id,occurred_at), (correlation_id); entity reference audit metadata เท่านั้นไม่ใช่ business FK; secure visibility |

## Accounting export

| Entity | Fields | Constraint / index |
| --- | --- | --- |
| accounting_export_runs | month:date, filter_snapshot:json, scope_digest:char(64), revision:int, state:REQUESTED/BUILDING/READY/FAILED/SUPERSEDED, requested_by:ref(users), requested_at:timestamptz, source_cutoff_at:timestamptz, snapshot_digest:char(64)?, zip_object_key:text?, zip_sha256:char(64)?, file_count:int?, expense_count:int?, total_satang:money?, supersedes_id:ref(accounting_export_runs)?, error_category:text? | UNIQUE(scope_digest,revision); immutable READY content; index(month,state); FIN/PII |
| accounting_export_items | export_run_id:ref(accounting_export_runs), evidence_id:ref(expense_evidence), expense_id:ref(expense_submissions), source_revision:int, relative_path:text, evidence_hash:char(64), row_snapshot:json | UNIQUE(run,evidence), UNIQUE(run,path); FK สอดคล้องกัน; หนึ่ง row/evidence ไม่ใช้ row sum เป็นยอด expense |

## Target architecture หลัง pilot

`opportunities`: id, code unique, customer_id FK, name, status, created/updated actor fields; `opportunity_status_history`: opportunity_id FK, from_status, to_status, reason, changed_by, changed_at append-only. สงวน logical identity ตาม MASTER §2.4/7 โดยยังไม่สร้างตาราง migration/UI หรือ polymorphic transaction

Won สร้าง Project.source_opportunity_id ใหม่; ไม่ย้าย Job/source/cost เก่า; copied estimate จะเป็น draft budget พร้อม lineage เมื่อออกแบบ M7 ถึงจุดนั้น contract และ subtype สำหรับ opportunity ledger ต้องมี ADR เพิ่ม Project transaction ใน Release แรกยัง project_id NOT NULL

## Query-driven indexes และข้อที่รอ validation

- หน้า pending: (status,submitted_at,project_id); งานของฉัน: active membership(user,project); evidence month: expense_date + project + status; ledger dashboard: project/category/date
- Financial batch ห้ามอ่านผ่าน index/filter ที่ข้าม row scope; server ตรวจสิทธิ์ทุก query
- Soft deactivate master; FK RESTRICT สำหรับ business history; ไม่ cascade delete source/ledger/evidence
- Final SQL exclusion/partial indexes, RLS strategy, encrypted fields, query plans และ load numbers ต้องพิสูจน์กับ PostgreSQL ใน M1–M5 ไม่มีผลทดสอบฐานข้อมูลใน M0

## คำตอบรอบ3 — ADR-008

- expense_submissions เพิ่ม quantity:decimal(12,2)? (>0 เมื่อกรอก), unit:text?; จำนวน/หน่วยไม่บังคับ ไม่คำนวณยอดแทน amount_satang
- expense_evidence เพิ่ม stored_at:timestamptz, retain_until:timestamptz, expired_at:timestamptz?; เสนอ retain_until=stored_at+2ปีปฏิทิน (29ก.พ.ใช้วันสุดท้ายของก.พ.) ไม่มีการลบledgerตาม binary
- Admin expense-review projection มี amount, quantity/unit, note, evidence และประวัติรายการที่มีสิทธิ์; ไม่มี Project aggregate หรือ PAY fields; PM ไม่ได้สิทธิ์นี้
- Work/OT approved_by Admin ถือว่าผ่าน ไม่เพิ่ม owner_time_approval; OWNER_REVIEW ของ payroll เป็น financial review เท่านั้น

## ผู้กรอกและช่องทาง — ADR-009

work_entries/overtime_entries: employee_id เป็นผู้ทำงาน; เพิ่ม submitted_by:ref(users) NOT NULL, source_channel:WEB/LINE NOT NULL และ submitted_at ตามเดิม แยกผู้กรอกออกจากพนักงาน ตรวจassignment/overlapตามemployee_id ไม่ใช้submitted_by

expense_submissions: submitted_by:ref(users) NOT NULL, source_channel:WEB/LINE NOT NULL; employee_id ต้องnullableเมื่อผู้ส่งไม่ใช่พนักงานที่มีemployee record ไม่ปลอมพนักงาน TECH/PM query own ตามsubmitted_by ทุกroleเข้าPENDING_REVIEW reviewed_by/atแยกจากsubmitted_by/at ก่อนลงledger

## LINE Pilot transient enrollment — ADR-012

ไม่มีตารางหรือmigrationใหม่: process memoryเก็บ hash ของรหัส192bit, kind USER/GROUP, ownerผู้เริ่ม, expiresAt15นาที, captured userId/groupId สูงสุด3คน/1กลุ่ม. ไม่เก็บrawmessage/replyToken; restart/expiryทำให้ข้อมูลอ่านไม่ได้และต้องเริ่มรอบใหม่ ไม่มีFK/สิทธิ์/บัญชีแอปเกิดจากcapture. audit LINE_PILOT_ENROLLMENT_STARTEDมีactor/timeแต่ไม่มีcodes/IDs. Businessqueue schemaและencryptedpayloadเดิมไม่เปลี่ยน
