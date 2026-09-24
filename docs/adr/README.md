# ADR index — Milestone 0

2026-09-21 · Author Codex · Reviewer Owner: business decisions รอบ3 Accepted; implementation details pending

ADR เหล่านี้บันทึก baseline ที่มีอยู่และข้อเสนอ implementation แยกกัน ส่วนที่ระบุ Proposed ยังไม่ถือว่า Owner ยืนยันและห้ามนำข้อขัดแย้งไป implement/merge โดยไม่มีคำตอบ

| ADR | เรื่อง | สถานะ |
| --- | --- | --- |
| [001](001-project-scope.md) | Project scope, optional Site/Job, budget | Q-02/Q-04 Accepted via007; Q-05 budget detail proposed |
| [002](002-permission-boundaries.md) | แยกข้อมูลเวลา/ค่าจ้างและช่องรั่ว | Superseded by007: Admin/PMไม่เห็นเงินทั้งหมด |
| [003](003-ledger-and-payroll.md) | ledger, monetary rounding, revision | Dates/split-day Accepted via007; OT0.5 Accepted via008; missing Work proposed |
| [004](004-line-reliability.md) | durable inbox/outbox และ draft isolation | Baseline confirmed; contracts proposed |
| [005](005-evidence-export.md) | private evidence และ export revision | Baseline confirmed; month proposed; retention2ปี via008 |
| [006](006-modular-monolith.md) | Modular monolith และขอบเขต M0 | Baseline confirmed; deployment choices deferred |
| [007](007-owner-decisions-m0-r2.md) | คำตอบOwner: ไม่มีเงินสำหรับAdmin/PM, 3Owners, OTย้อนหลัง, ครึ่งวัน, รูปบิล | บางส่วน superseded by008; ประวัติรอบ2 |

| [008](008-admin-review-ot-retention.md) | Adminตรวจเงิน/รูปexpenseรายรายการ, เวลาอนุมัติครั้งเดียว, OT0.5, เก็บ2ปี | Accepted; supersedes007ส่วนที่ระบุ |

| [009](009-delegated-entry-and-expense-review.md) | ลงเวลาแทน ทุกroleส่งexpense LINEรอตรวจทุกครั้ง | Accepted รอบ4; supersedes008เฉพาะsubmission/PM own expense |
| [010](010-foundation-implementation.md) | M1 implementation, authentication/schema/LINE/backup | Accepted implementation; deployment pending |

| [011](011-m1-v3-alignment.md) | M1 v3 types, fields, code reservation, PM assignment และ recovery | Implementation ตาม D-021–023; Staging approval pending |

| [012](012-bounded-line-pilot.md) | Bounded LINE project scope, signed private enrollment, worker guards | Owner bounded pilot approved; runtime evidence in PROJECT_STATUS |
