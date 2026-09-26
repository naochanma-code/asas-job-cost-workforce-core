# PROJECT STATUS — Milestone 1

อัปเดต 26 กันยายน 2026 · ผู้ดูแล M1: Codex · branch codex/milestone-1-foundation · PR #2 Draft / ห้าม Merge

## ตอนนี้ถึงไหน

Foundation และ M1 Alignment เปิดใช้งานบน Staging แล้ว LINE Pilot จำกัด Owner/Admin/TECH รวมสามคน หนึ่งกลุ่ม และสองโครงการสมมติ. ยังไม่รับ Milestone 1 ทั้งหมด ไม่เริ่ม M2/M3 และไม่ Deploy Production

| รายการ | สถานะจริง |
| --- | --- |
| CODED | PASS — Foundation/Alignment และ D-033 link privacy/queue retention |
| TESTED_LOCAL / CI | PASS ตามหลักฐานเดิม: CI36109173357 Native PostgreSQL52/52, embedded50PASS/2NativeSKIP, typecheck/build/container/smoke; ไม่ใช่ผล LINE UAT |
| DEPLOYED_STAGING | dc289ee3088cd84639cc828b49a6f5c50a665f55 ตามหลักฐาน deployment เดิม; รอบ26ก.ย.ไม่ได้ deploy ใหม่ |
| Web Owner / Project / Job / Mobile | UAT_PASSED ตามผล Owner รอบก่อน |
| LINE Owner/Admin งานของฉัน | UAT_PASSED — เห็น A/B ตามสิทธิ์ |
| LINE TECH งานของฉัน | UAT_PASSED — ก่อนถอนเห็น A; หลังถอน A ไม่พบโครงการ; หลังมอบหมาย Job B เห็นเฉพาะ B |
| Assignment/Audit | PASS — มอบหมายระดับ Job B มี audit; assignment นอก Pilot ไม่เปลี่ยน |
| Web TECH เฉพาะ Job ที่มอบหมาย | NOT_RUN สำหรับหน้าจอรอบ Job B; ไม่ใช้ผล LINE แทน |
| กลุ่มผูกโครงการ | PASS — กลุ่มทดสอบผูก A, audit การผูกสำเร็จ1 |
| R2-05 ส่งคำสั่งเดิมซ้ำ | PASS เฉพาะไม่เปลี่ยน mapping/audit; ไม่แยกพิสูจน์ single-use จาก expiry |
| R2-07 รหัสหมดอายุ | PARTIAL — Ownerแจ้งส่งซ้ำแล้ว; ตรวจ26ก.ย.พบรหัส B หมดอายุ กลุ่มยังA/audit1. ไม่มีหลักฐานระบุเวลา event ของคำสั่งนั้น จึงยังไม่อ้าง isolated expiry UAT PASS |
| Queue retention24h | PASS ณ26ก.ย.: overdue inbox/outbox0, inboxDONE33, outboxSENT28/DEAD1เดิม; ไม่มี pending. ไม่ได้อ่าน payload |
| Backup/Restore | manual encrypted backup/isolated recovery PASS เดิม; synthetic NativeCI restore-login PASS; Staging browser restore-login ยัง NOT_RUN |
| Owner acceptance ทั้ง M1 / Merge | NOT_AUTHORIZED |

## ผลตรวจล่าสุด

26ก.ย.เวลา12:22:13Z ตรวจแบบอ่านอย่างเดียว: รหัส B ที่เตรียมไว้ expires_at25ก.ย.14:40:07.715Z, expired=true; กลุ่มยังชี้ PILOT LINE A เพียงรายการเดียว และ LINE_GROUP_BOUND auditรวมA/Bคง1. การตรวจครั้งก่อนถูกระบบอนุมัติอัตโนมัติระงับเพราะ usage limit; ครั้งนี้ตรวจได้แล้ว ไม่ต้องให้ Owner ส่งคำสั่งเดิมซ้ำตอนนี้

กลุ่มที่ผูกอยู่แล้วมีการป้องกันเขียนทับอีกชั้น จึงไม่ใช้ผล mapping คงเดิมพิสูจน์ expiry เพียงอย่างเดียว. ไม่อ่านรหัสหรือข้อความย้อนหลังเพื่อสร้างหลักฐานเพิ่ม. แยก automated security tests ที่ผ่านออกจาก live provider UAT ที่ยังไม่ครบ

## งานรอบต่อเนื่อง 26 กันยายน

เพิ่ม automated Restore/Job isolation ผ่าน HTTP loopback ด้วยข้อมูลสมมติ: targeted test/typecheck PASS; full regression 51PASS/2NativeSKIP/0FAIL; Native CI รอผล. ไม่แทน browser Staging UAT. ขั้นตอน browser recovery อยู่ [checklist](M1_BROWSER_RECOVERY_CHECKLIST.md) PREPARED/NOT_RUN. ฝากคำถามเรื่องผู้รับผิดชอบ backup ประจำวันไว้ ยังไม่เปิดบริการหรือเพิ่มค่าใช้จ่าย

## งานถัดไปของ Codex

1. ตรวจ Web TECH เห็นเฉพาะ Job ที่ได้รับมอบหมาย โดยใช้บัญชีสมมติและไม่แก้บัญชีจริง
2. เตรียมขั้นตอน browser restore/login บนฐานสมมติแยก ไม่เขียนทับ Staging หรือใช้ข้อมูลจริงเพิ่ม
3. จัดรายการ live checks ที่ยังไม่รัน ได้แก่ unlink/nonce replay-expiry/wrong actor และข้อจำกัดหนึ่งกลุ่ม/TECHหนึ่งคน ให้ Owner เห็นก่อนรับ M1
4. ตรวจแผนสำรองข้อมูลประจำวัน ผู้รับผิดชอบ ระยะเก็บ และ restore. PITR เป็น production-readiness requirement ตาม runbook ไม่อ้างว่าเปิดแล้วหรือซื้อเพิ่มโดยอัตโนมัติ

Owner ยังไม่ต้องทำซ้ำขั้นเห็นงาน/ถอนสิทธิ์/มอบหมาย B. จะขอเฉพาะขั้นที่ต้องใช้ตัวตน LINE จริงเมื่อพร้อม ไม่ต้องส่งรหัสผ่านหรือ token

## ขอบเขตและข้อจำกัด

- Railway Trial เท่านั้น ไม่เพิ่มแผน/บริการเสียเงิน; เครดิตล่าสุดที่บันทึกในรอบก่อนประมาณ USD4.7314 ไม่ใช่ยอดสด
- API/worker LINE_ENABLED=true, enrollment=false ตาม config รอบก่อน; Rich Menu พักตาม Owner
- ข้อมูลจริงปนใน Staging ห้ามใช้เป็น test fixture; การทดลองใช้ A PRJ-2609-014 และ B PRJ-2609-015 เท่านั้น
- Worker restartPolicy=NEVER ตาม configเดิม; หาก cleanupล้มเหลวให้หยุดpilotตาม runbook
- Retentionล้างเมื่อ worker ทำงาน; ไม่อ้างล้างตรงเวลาระหว่าง outage. เก็บสถานะและAudit
- Proxy rate bucket รวมผู้ใช้/observabilityทุกชั้นยังมีข้อจำกัด; ไม่รับรอง scale หรือ production
- AccountingConnector/InventoryConnector เป็น design ตามD-032 ยังไม่ implement
- root M2 พักไว้ งานM1อยู่ .local/m1-staging; rootแก้เฉพาะเอกสาร pointer

## หลักฐานและผู้ช่วย

[CI36109173357](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36109173357) · [Test Evidence](M1_TEST_EVIDENCE.md) · [รอบLINE](M1_LINE_PILOT_ROUND_2.md) · [Operations](OPERATIONS_RUNBOOK.md)

รอบนี้ใช้ subagent1ตัวตรวจเอกสารแบบอ่านอย่างเดียว ไม่แก้ code/schema/ข้อมูล และไม่เรียกบริการภายนอก. CodexหลักตรวจRailwayและอัปเดตเอกสาร ป้องกันงานซ้ำ. ประวัติผลรายรอบอยู่ใน CHANGELOG และ M1_TEST_EVIDENCE