# PROJECT STATUS

อัปเดตล่าสุด: 21 กันยายน 2026

## ภาพรวม

| Workstream | สถานะ | หลักฐาน/หมายเหตุ | Owner |
| --- | --- | --- | --- |
| Master requirement v2.2 | DESIGNED | `docs/MASTER_PROMPT.md` | Owner + Codex |
| Repository structure | CODED | Private GitHub Repository พร้อมเอกสารกลางบน `main` | Codex |
| UX/Wireflow | NOT_STARTED | Milestone 0 | Unassigned |
| Database/Contracts | NOT_STARTED | มีเพียงข้อกำหนดระดับหลักการ | Unassigned |
| Web/LINE application | NOT_STARTED | ยังไม่มี source code | Unassigned |
| Integration tests | NOT_STARTED | ยังไม่มีระบบให้ทดสอบ | Unassigned |
| Staging/Production | NOT_DEPLOYED | ห้ามอ้างว่าใช้งานได้ | Unassigned |

## Decisions ล่าสุด

- สร้างระบบและ Repository ใหม่ ไม่ปนกับแอปเก่า
- Project เป็นหน่วยหลัก; Site และ Job optional
- Project ที่ไม่มี Job ลง Assignment, Budget, Time, OT, Expense และ Cost ได้โดยตรง
- Admin กรอก/ตรวจข้อมูลเวลา แต่ไม่เห็นยอด Payroll; Owner กรอกอัตราและอนุมัติ
- ภาษีและประกันสังคมเลื่อนไป phase ถัดไป

## Version / Commit

- Master Prompt: v2.2
- Baseline Git commit: `1ca4e08774959a7870271e54df7935597f31b740`
- Branch: `main`
- Migration: ยังไม่มี
- Remote repository: `naochanma-code/asas-job-cost-workforce-core` (Private)
- Remote branch: `main`
- Remote publish commit ล่าสุดของชุดเริ่มต้น: `886b2094867758242983b4b2ef27af6afcff9a1c`

## Blocker / ต้องยืนยัน

- ยังไม่มี blocker สำหรับเริ่ม Milestone 0

## ขั้นตอนถัดไป

1. ทำ Milestone 0: wireflow, state diagrams, data dictionary, permission matrix และ test acceptance script
2. ทดสอบ Payroll calendar ตัวอย่าง รวมวันสุดท้ายของเดือนและ late adjustment
3. ให้ Owner ตรวจ flow และคำศัพท์ก่อนเริ่มเขียน application code
