# ADR index — Milestone 0

2026-09-21 · Author Codex · Reviewer Owner: business decisions รอบ2 Accepted; implementation details pending

ADR เหล่านี้บันทึก baseline ที่มีอยู่และข้อเสนอ implementation แยกกัน ส่วนที่ระบุ Proposed ยังไม่ถือว่า Owner ยืนยันและห้ามนำข้อขัดแย้งไป implement/merge โดยไม่มีคำตอบ

| ADR | เรื่อง | สถานะ |
| --- | --- | --- |
| [001](001-project-scope.md) | Project scope, optional Site/Job, budget | Q-02/Q-04 Accepted via007; Q-05 budget detail proposed |
| [002](002-permission-boundaries.md) | แยกข้อมูลเวลา/ค่าจ้างและช่องรั่ว | Superseded by007: Admin/PMไม่เห็นเงินทั้งหมด |
| [003](003-ledger-and-payroll.md) | ledger, monetary rounding, revision | Dates/split-day Accepted via007; fractional edge proposed |
| [004](004-line-reliability.md) | durable inbox/outbox และ draft isolation | Baseline confirmed; contracts proposed |
| [005](005-evidence-export.md) | private evidence และ export revision | Baseline confirmed; month/retention proposed Q-06 |
| [006](006-modular-monolith.md) | Modular monolith และขอบเขต M0 | Baseline confirmed; deployment choices deferred |
| [007](007-owner-decisions-m0-r2.md) | คำตอบOwner: ไม่มีเงินสำหรับAdmin/PM, 3Owners, OTย้อนหลัง, ครึ่งวัน, รูปบิล | Accepted business decisions; supersedes parts of001/002/003/005 |
