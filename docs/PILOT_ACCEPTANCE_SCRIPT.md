# Pilot Acceptance Script

เวอร์ชัน M0-2026-09-21 · ข้อมูลสมมติเท่านั้น · Owner reviewer ยังไม่ได้รัน

## แยก gate

**Gate M0** เป็น process walkthrough บน [prototype](prototype/index.html) และเอกสาร A/B ไม่มี LINE จริง ไม่ใช่ real pilot หรือ production UAT ผู้ทดสอบเห็นโจทย์งานแต่ไม่ได้รับวิธีคลิก; ผู้สังเกตจดสิ่งที่ติดโดยไม่ช่วยจนจบ task

**Gate M6** คือ pilot 2–3 Projects, 2–4 สัปดาห์ ใช้โทรศัพท์/บัญชีจริงและระบบที่ผ่าน milestone ก่อนหน้า ต้องได้รับขอบเขตอนุญาตใหม่สำหรับ deployment/LINE/ข้อมูลจริง เอกสารนี้เตรียม script ไว้เท่านั้น ไม่ได้เริ่ม M1–M6

## เตรียมรอบ M0

เปิด prototype/index.html ด้วย browser ในเครื่อง หรือ local HTTP server; กดเริ่มใหม่ทุก session (ไม่มี persistence) ใช้ A ไม่มี Site/Job กับ B Site/สอง Jobs, DEMO-T1/T2 ตาม [MILESTONE_0](MILESTONE_0.md); role switch เป็น simulation เท่านั้น ผู้ทดสอบ Owner/Admin/PM/TECH เป็นผู้สวมบทบาท ไม่มีบัญชีจริง

จด session ID, date/time ไทย, prototype version/commit, device/browser/viewport, reviewer alias, observer, task start/end, assistance_count, result, issue ID และ artifact path ห้ามเก็บชื่อจริง/ค่าจ้างจริง/รูปบิลใน Git

## เจ็ดงานสำหรับ Owner ตรวจ flow

| Task | โจทย์อ่านให้ผู้ทดสอบ | Expected / pass criteria | Evidence |
| --- | --- | --- | --- |
| U-01 งานของฉัน | ในบทช่าง ดูงานที่ได้รับมอบหมายแล้วเปิด A; เปลี่ยนไป B | เห็น Project A ใช้ได้แม้ไม่มี Job; B เห็นงานย่อยเมื่อเปิดเพิ่มเติม; ไม่มีงานอื่นนอกสิทธิ์ | screen IDs + เวลา + assistance |
| U-02 วันทำงาน | บันทึก A วันที่ 21 ก.ย. เต็มวัน แก้เป็นเช้าแล้วส่งตรวจ | สรุปก่อนส่ง, SUBMITTED; ไม่มี Site/Job question; ไม่แสดงเงิน | source mock ID + before/after |
| U-03 OT | บันทึก A วันที่ 21 ก.ย. OT 2 ชั่วโมงพร้อมเหตุผล | เห็นชั่วโมงและสรุปก่อนยืนยัน; รอตรวจ ไม่มีจำนวนเงิน; กรณีขอบ Q-03 แยก discussion | screenshot mock + comments |
| U-04 ค่าใช้จ่าย | ส่งค่าน้ำมัน A 500 บาทพร้อมหลักฐานจำลอง 1 ภาพ; ทดลองแก้/ยกเลิกก่อนส่ง | แสดง date/category/amount/detail/count; ยืนยันแล้ว PENDING_REVIEW; หลักฐานของ T1 ไม่เข้าของ T2 (design discussion แยกจาก prototype) | source ID; no-job checklist |
| U-05 ตรวจและต้นทุน | สวมบท Admin ตรวจ U-02/03/04 แก้รายละเอียด expense พร้อมเหตุผล แล้วอนุมัติ; เปิด Budget vs Actual | pending expense ไม่เป็น Actual; approved fuel 500 ครั้งเดียว, งบ2000 เหลือ1500 ใช้25%; view เป็นหมวดที่มีสิทธิ์ ไม่เผย payroll; Owner full view อยู่ตาม spec/Q-01 | before/after/reason, ledger mock count |
| U-06 หลักฐานเดือน | หาหลักฐานกันยายน A และขอชุดส่งบัญชี | Project A ไม่มี Job filter; prototype แสดง preview count/total; ตรวจ E-01 ในเอกสารได้ว่า 3 files/2 expenses/1800; ไม่อ้างว่าดาวน์โหลด ZIP จริง | export preview + reviewer feedback |
| U-07 ตรวจรอบค่าจ้าง | Admin ตรวจเวลาแล้วส่ง Owner; Owner ตรวจตัวอย่างค่าจ้าง อนุมัติ lock และบันทึกโอนจำลอง | Admin ไม่มี rate/amount; Owner เห็น golden amount; ทุก action ชัดเจน; late path อธิบายว่า revision ไม่ทับของเดิม | run state trail + reviewer decision |

เกณฑ์ Gate M0: ทั้ง 7 tasks ทำได้โดย assistance_count=0, คำศัพท์เข้าใจตรงกัน, ไม่มี critical no-Job/privacy ambiguity ที่ไม่ได้บันทึก, Owner ยืนยัน flow; หากช่วยชี้คลิกให้ FAIL task นั้นและ rerun หลังแก้ ไม่ตั้ง completion time เป็นเกณฑ์ผ่านโดยไม่มี baseline

## Edge-case walkthrough ต่อจากเจ็ดงาน

| ID | สิ่งให้ทดลอง/ทบทวน | Expected |
| --- | --- | --- |
| U-08 | B optional Job → submit project-level; B required 1/2 Jobs | optional ไม่ถาม; one auto; two เลือก; ไม่มี cross-project ID |
| U-09 | project required Jobs แต่ active=0 | configuration error ส่ง Admin แก้; ไม่สร้าง fake Job |
| U-10 | cancel/retry/double click/loading/error/unsaved | draft ไม่สูญหาย; ไม่มี success ก่อน durable save ในระบบจริง; mock labels ชัดเจน |
| U-11 | Admin เปิด payroll amount/audit/export, TECH เปิดคนอื่น, external group ส่งคำสั่ง | ทุกตัวถูก deny ตาม matrix; prototype ไม่ถือเป็น server proof |
| U-12 | หลัง TIME_REVIEWED มี Work ใหม่; หลัง PAID มีแก้ยอด | queue late; revision ก่อนจ่ายหรือ delta รอบถัดไป; frozen amount ไม่เปลี่ยน |

## Script ระบบจริงใน milestones ถัดไป — NOT_RUN

| ID | ขั้นตอนทดสอบ | ผลที่ต้องได้ / gate |
| --- | --- | --- |
| R-01 | raw event เดียว replay10 + ผู้ตรวจสองคน approve พร้อมกัน | source1/posting group1, components ที่ถูกต้อง; PostgreSQL evidence M2/3 |
| R-02 | ช่างสองคนสลับข้อความ/ภาพในกลุ่มเดียว + หนึ่งคนหลาย drafts | source/sender/evidence ไม่สลับ; private/group scopes แยก M3 |
| R-03 | kill worker หลัง inbox/ก่อน transaction/หลัง commit/ก่อน reply; DB/storage unavailable | durable recovery, no false success, no duplicate cost, outbox retry M3 |
| R-04 | approve/cancel/revise expense และงบ Job allocation | sum ledger ตรง baseline/actual; pending แยก; reversal once M4 |
| R-05 | golden P-01–30 + rate/calendar change + frozen run | manual monthly total ตรงทุกคน; no payroll-cost double count M5 |
| R-06 | denied direct API/URL/export/notification/cache/aggregate subtraction | ไม่ leak restricted amount/PII; server evidence M1/M5 |
| R-07 | export E-01–09 + checksum + เปิดภาพ/PDF/XLSX | files/count/amount/hash/snapshot ถูก; no payroll data M3/M4 |
| R-08 | backup DB+binary restore isolated env และ rollback drill | row counts, money totals, relationships, hashes ตรง, restore times บันทึก M6 |
| R-09 | real phone authenticated role sessions, no mocked session | ครบ 7 tasks และ A/B flows บัญชีจริงโดยอนุญาต M6 |
| R-10 | load เริ่ม 20 concurrent users, 2000 events/day, 10–20 images/day | วัด latency p50/p95, completion/correction/duplicate/lost และ admin time; thresholds ให้ Owner ตกลงก่อน gate M6 |

## Checklist ก่อน real pilot (ยังไม่ขอทุกข้อในคราวเดียว)

- [ ] Owner เลือก 2–3 Projects/ผู้ร่วมทดลอง/ผู้รับผิดชอบสนับสนุน
- [ ] ยืนยันปริมาณจริง/อุปกรณ์/LINE group permissions และกติกาภายนอก
- [ ] งบ hosting/domain และผู้อนุมัติค่าใช้จ่าย
- [ ] แผนนำเข้า master data โดยไม่ย้าย legacy DB อัตโนมัติ
- [ ] วิธีจ่ายเงินจริง/ผู้อนุมัติ/ธนาคารขัดข้อง และ policy gaps Q-01–06
- [ ] ผู้รับผิดชอบ backup/restore, retention, rollback และ checklist บัญชี
- [ ] Milestone ที่เกี่ยวข้องผ่าน integration/staging/real LINE และอนุญาตขอบเขตใช้งานจริง

## แบบบันทึกผล (ว่างโดยเจตนา)

| Session/task | Commit/env/device | Result NOT_RUN/PASS/FAIL/BLOCKED | Assistance | Evidence/issue | Reviewer/date |
| --- | --- | --- | --- | --- | --- |
| M0 U-01–U-07 | local prototype | NOT_RUN_BY_OWNER | — | รอ Owner | — |
| Real pilot R-01–R-10 | ยังไม่มี environment | NOT_RUN | — | milestones ถัดไป | — |

ผู้สังเกตห้ามเปลี่ยน NOT_RUN เป็น PASS จากการเขียน script หรือ local fixture checks เพียงอย่างเดียว
