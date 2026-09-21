# Payroll calculation test cases — golden specification

DESIGNED; คำตอบรอบ2ตาม ADR-007: OTอ้างวันที่เลือกไม่แยกข้ามวัน สองProjectแบ่งครึ่ง OWNERหลายบัญชี ADMIN/PMไม่เห็นเงินทุกประเภท; สูตรจาก MASTER §5/5.1/17 และ PAYROLL_POLICY ใช้ข้อมูลสมมติทั้งหมด ไม่ใช่อัตราจริงหรือคำรับรองความถูกต้องตามกฎหมาย การทดสอบใน M0 เป็น arithmetic fixture checks ไม่ใช่ application tests

## Oracle และ snapshot

daily = integer satang; fraction FULL=1, AM/PM=1/2; holiday = Sunday OR calendar holiday (ไม่บวก multiplier ซ้ำ); base = daily × fraction × (holiday?2:1); meal = 12000 × fraction เมื่อ approved Work เท่านั้น

OT hourly baht = ROUND_HALF_UP((daily_satang / 100 / 8) × (holiday?3:2)); OT satang = hourly_baht × 100 × hours. คูณหลังปัด hourly เท่านั้น; cases ที่มีเศษต่ำกว่า 1 สตางค์ยัง pending Q-03 ไม่เดาผล final

Net = sum(LABOR+MEAL+OT approved source) + signed manual adjustments; pending/rejected/cancelled ไม่เข้าผล; payroll total ไม่รวมใน Project Actual อีกครั้ง Missing/overlap rate หรือ policy ห้ามคำนวณ fallback เงียบ

Snapshot ขั้นต่ำ: source_id/revision, employee_id/name, work date/day part/hours, holiday classification/calendar version, rate/policy IDs + effective interval + value, exact expression, hourly rounded rate, component amount_satang, input digest, run revision, calculator contract version

## Golden cases (บาท แสดงเพื่ออ่าน; persisted expected = ×100 สตางค์)

| ID | Input สมมติ | Labour | Meal | OT | Expected รวม / assertion |
| --- | --- | ---: | ---: | ---: | --- |
| P-01 | 970, ปกติ FULL, ไม่มี OT | 970 | 120 | 0 | 1,090 |
| P-02 | 970, ปกติ AM | 485 | 60 | 0 | 545 |
| P-03 | 970, ปกติ PM | 485 | 60 | 0 | 545 |
| P-04 | 970, อาทิตย์ FULL | 1,940 | 120 | 0 | 2,060 |
| P-05 | 970, วันหยุด AM | 970 | 60 | 0 | 1,030 |
| P-06 | 970, ปกติ FULL + OT 2h | 970 | 120 | 486 | 1,576; hourly 242.5 → 243 |
| P-07 | 970, วันหยุด FULL + OT 2h | 1,940 | 120 | 728 | 2,788; hourly 363.75 → 364 |
| P-08 | 970, ปกติ AM + OT 1.5h | 485 | 60 | 364.50 | 909.50 |
| P-09 | 970, วันหยุด PM + OT 0.5h | 970 | 60 | 182 | 1,212 |
| P-10 | 970, FULL Sunday และ calendar holiday ตรงวันเดียว | 1,940 | 120 | 0 | 2,060 ไม่คูณ 4 |
| P-11 | ไม่มี approved Work และไม่มี OT | 0 | 0 | 0 | 0; ลา/ขาดงานไม่มีค่ากิน |
| P-12 | Work/OT pending หรือ rejected | 0 | 0 | 0 | ไม่รวมทั้ง Payroll และ Actual |
| P-13 | P-01 + manual add 100 - deduct 50 | 970 | 120 | 0 | 1,140; adjustment มีประเภท/เหตุผล/Owner |
| P-14 | 970 ถึง 09-15 exclusive; 1000 เริ่ม 09-15; FULL 09-14 และ 09-15 | 1,970 | 240 | 0 | 2,210; เลือก rate ตาม work_date แม้อนุมัติทีหลัง |
| P-15 | 1000, ปกติ FULL + 1h OT | 1,000 | 120 | 250 | 1,370 |
| P-16 | 970, FULL + OT 3h ปกติ | 970 | 120 | 729 | 1,819 ไม่ใช่ OT 727.50 |

## รอบหนึ่งเดือนตรวจมือ

DEMO-T1 ในกันยายน 2026 มีเพียง 09-21 FULL+2h OT (1,576), 09-22 AM (545), 09-27 Sunday FULL+1h holiday OT (2,424), 09-30 FULL (1,090); รวมก่อน adjustment 5,635; +100 -50 = **5,685 บาท / 568500 สตางค์** ไม่มีวันอื่นใน fixture

Cost จาก work/OT = **5,635 บาท**; manual payroll adjustment 50 สุทธิไม่ลง cost อัตโนมัติ เพิ่ม approved fuel expense 500 ทำ Actual Project = **6,135 บาท** ไม่ใช่ 11,820 (การบวก payroll ซ้ำผิด)

## Boundary, privacy, idempotency และ revision specifications

| ID | Arrange → action | Expected result / evidence ที่ต้องเก็บ |
| --- | --- | --- |
| P-17 | entry 09-30 เวลาไทยก่อนเที่ยงคืน; entry 10-01 00:00 | แรกอยู่กันยายน หลังอยู่ตุลาคม; 2026-09-30T17:00:00Z = ตุลาคม ไม่ใช้ UTC month |
| P-18 | รอบ February 2028/2027 และ December 2026 | จบ 29/28 และข้ามปีถูก; ไม่ hard-code 30 วัน |
| P-19 | Admin ส่ง Owner 10-01 09:59; Owner approve/lock/pay วันที่ 1 | state ตามลำดับ; Admin response มีแต่ counts/time/status; paid_at จริงภายในวันครบ SLA |
| P-20 | วันที่ 1 เป็นวันหยุด | due date ยังวันที่ 1; electronic transfer; ธนาคาร fail เก็บ incident ไม่ auto PAID |
| P-21 | after TIME_REVIEWED ส่งเพิ่ม FULL ปกติ 970 | late queue; ยอดเดิมไม่เปลี่ยน; ก่อนจ่าย Owner reopen+revision delta 1090; approved old ledger reversal ครั้งเดียว |
| P-22 | P-21 หลัง PAID | default target next period delta 1090; original paid run immutable; correction payment ต้อง Owner ระบุแยก |
| P-23 | เปลี่ยน rate/name/calendar หลัง lock | report เก่าเท่าเดิมจาก snapshot; ไม่มี silent recalculation |
| P-24 | rate หาย หรือ effective overlap | calculation blocked พร้อม exception; Admin ไม่เห็น rate values |
| P-25 | event/source approve ส่งซ้ำ 10 ครั้ง + ผู้ตรวจพร้อมกัน 2 คน | source 1; WORK posting group 1 (LABOR+MEAL=2 lines), OT 1 line; no duplicate payroll component |
| P-26 | approved Work ยกเลิกซ้ำ/แก้ 970 FULL เป็น AM | original immutable; reversal -1090 ครั้งเดียว; revision +545; net cost 545; payroll frozen ใช้ late path |
| P-27 | Admin/PM/TECH เดา payroll/rate ID/API/export | denied; ไม่มี amount/rate/formula/snapshot ใน body หรือ error; audit projection ไม่ leak |
| P-28 | Project A ไม่มี Job/Site; Work/OT approved | source project_id=A, job_id=null ผ่านทั้งหมด ไม่เตือน missing Job |
| P-29 | A ส่ง job_id=B1 | reject ก่อน source/ledger; no partial posting |
| P-30 | payroll approve/lock/pay ซ้ำ | net payroll immutable; Cost Actual เท่าเดิม; payment reference ไม่สร้าง payment ซ้ำ |
| P-31 | ทำ AM A + PM B วันเดียว ปกติ970 | Ownerยืนยันแบ่งครึ่ง: labour485+485, meal60+60; รวม1090บาท, 1man-day/1วันเข้างานจริง |
| P-32 | ระบุ21ก.ย.2026 OT8ชม. แม้ทำถึง22 ลงย้อนหลังวันที่23 | ใช้วันที่21ทั้งรายการ; hourly243 ×8 =1944บาท; ถ้าปิดรอบแล้วเข้าlate queue ไม่ย้ายไปวันที่22 |
| P-33 | paid amount หลัง deduct มากกว่ายอด base | block สำหรับ Owner review จน policy negative net ยืนยัน; ไม่โอนยอดติดลบอัตโนมัติ |

ผลที่รันจริงและคำสั่งอยู่ [TEST_EVIDENCE](TEST_EVIDENCE.md); P-17–30/P-33 เป็น acceptance specs; P-31/32 ตรวจ arithmetic ได้ในround2 แต่ backendยังNOT_RUN และกรณี OT เศษย่อย/ไม่มีWorkยังเปิดอยู่; ข้อเหล่านี้ ไม่อ้างผ่านระบบที่ยังไม่ได้สร้าง
