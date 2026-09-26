# PROJECT STATUS — Milestone 1

26 กันยายน: Owner อนุญาตใช้ LINE ของตนเองทดสอบ unlink/relink กลับบัญชีเดิมแล้ว; รอ Owner Login Web เพื่อระบุตัวตน ไม่ขยายผู้ทดลองหรือกลุ่ม. Targeted LINE security regression 20 PASS / 0 FAIL / 0 SKIP (embedded PostgreSQL, fake transport), เอกสาร M0 45 checks PASS. ไม่แทน live provider UAT.

## 26 กันยายน 2026 — ข้อ 1 Web TECH ผ่าน; ข้อ 2 LINE security กำลังปิดหลักฐาน

C1 ตรวจ browser Staging ด้วย TECH สมมติแล้ว: เห็นเฉพาะ B และ Job ที่มอบหมาย ไม่เห็น sibling/เมนูจัดการ; refresh ผ่าน. Injected deployed API คืน A404/B200/users403. ปิดบัญชีทดสอบและ session แล้ว browser กลับ Login. Direct API URL ผ่าน browser ถูกเครื่องมือบล็อก จึงแยก NOT_RUN จาก API result. ดูรายละเอียดใน M1_TEST_EVIDENCE.md. ไม่ต้องให้ Owner ทดลอง C1 ชุดนี้ซ้ำ.

C3–C5 live LINE ยัง PARTIAL/NOT_RUN: เตรียมรอบ unlink/relink ด้วยบัญชี Owner เดิมและรอคำตอบเฉพาะการยกเลิกชั่วคราว; รหัสกลุ่มในกลุ่มที่ผูกแล้วแยก expiry/reuse จาก overwrite guard ไม่ได้. ไม่เปลี่ยน binding จริงหรือขยาย allowlistเพื่อให้ผลผ่าน. C2/Daily Backup ยังเลื่อนตาม Owner; ไม่ Merge/M2/Production.


## 26 กันยายน 2026 — ตรวจ Staging health แบบอ่านอย่างเดียว

16:17 UTC Web Staging `HEAD /` = HTTP 200; `GET /api/health` = `status=ok, database=ready`. ระบบตอบ ณ เวลาตรวจ แต่ C1 TECH Web และ UAT LINE ยังไม่ผ่านจาก health check นี้. ไม่ login/แก้ข้อมูล/deploy; ตรวจซ้ำก่อน UAT รอบรวม.

## 26 กันยายน 2026 — เพิ่ม positive synthetic Admin → TECH LINE flow

เพิ่ม `tests/m1-admin-line-flow.test.ts` ด้วยฐาน memory/fake transport: Admin สร้าง Project ไม่มี Site/Job, assign TECH, ตรวจ actor ใน audit และ LINE worker ตอบเฉพาะ Project ที่มอบหมายใน fixture เดียว. Targeted 1/1 PASS, typecheck PASS. สถานะ `TESTED_LOCAL_SYNTHETIC`; ไม่แทน live LINE UAT หรือปิดข้อจำกัด Admin Web กับ Pilot A ที่เป็นคนละ fixture. ไม่แตะ Staging, LINE provider หรือข้อมูลจริง.

## 26 กันยายน 2026 — ตรวจ Owner UI ของ Job เดิมผ่านแล้ว

เวลา 15:59 UTC Web Staging session OWNER เปิด `PRJ-3511fa71` แบบอ่านอย่างเดียว: Job 1 รายการแสดงทั้งในรายละเอียดโครงการและรายการงานย่อย; reload แล้วเปิดโครงการใหม่ยังแสดงเหมือนเดิม. สถานะ `CURRENT_OWNER_UI_DISPLAY_VERIFIED_BY_CODEX` สอดคล้องกับ jobs/audit 1/1; ไม่ใช่ Owner UAT รอบใหม่และยังไม่รู้สาเหตุการกดครั้งแรกที่ไม่บันทึก. ไม่แก้ข้อมูลจริงหรือสร้าง Job ซ้ำ. ปรับ [ชุดหลักฐานรับ M1](M1_OWNER_ACCEPTANCE_PACKET.md) ไม่ให้ขอ Owner ทำขั้นดูรายการซ้ำโดยไม่มีเหตุผล.

## 26 กันยายน 2026 — Project Job ที่เคยไม่แสดงมีแถวในฐานแล้ว

SELECT read-only บน Railway Postgres เวลา 15:52 UTC ของ `PRJ-3511fa71` คืน `jobs=1` และ `JOB_CREATED audit=1`, เทียบการตรวจครั้งก่อน 0/0. มีหลักฐาน backend persistence อย่างน้อยหนึ่งครั้งแล้ว แต่ยังไม่ได้เห็นหน้าจอ Owner หลัง refresh จึงไม่อ้างว่า UI display ผ่านหรือทราบสาเหตุการกดครั้งแรก. เพิ่มขั้นดูอย่างเดียวใน [ชุดหลักฐานรับ M1](M1_OWNER_ACCEPTANCE_PACKET.md); ไม่สร้าง Job ซ้ำ ไม่แก้ข้อมูลจริง.

## 26 กันยายน 2026 — เตรียมชุดหลักฐานรับ M1

จัด [M1_OWNER_ACCEPTANCE_PACKET](M1_OWNER_ACCEPTANCE_PACKET.md) เทียบข้อใน Master กับหลักฐาน Web/LINE/Staging/CI และข้อจำกัดที่ต้องให้ Owner เห็นในรอบเดียว. ไม่ใช้ผล CI ของ head แทน release บน Staging; C1 Web TECH ยัง NOT_RUN, flow Admin→TECH LINE ใน Project เดียวไม่พิสูจน์, C3–C5 live security ยัง PARTIAL/NOT_RUN, C2 เลื่อนตาม D-037 และ Daily Backup เลื่อนตามคำสั่ง Owner. PR #2 ยัง Draft/ไม่ Merge; ไม่มี deployment หรือข้อมูลจริงเปลี่ยนจากการจัดชุดนี้.

## 26 กันยายน 2026 — Owner เลื่อน C2 ไปหลัง M3

ตาม D-037 Owner ให้ทดสอบ provider browser recovery หลังจบ M3 และก่อน Pilot (M8); อนุญาตให้พิจารณา Railway environment ใหม่เมื่อจำเป็นในรอบนั้น. C2 = `DEFERRED_BY_OWNER / NOT_RUN`, ไม่ใช่ PASS และไม่อยู่ใน UAT M1 รอบนี้. ก่อนรอบหลัง M3 ต้องตรวจ Trial limit/topology/ค่าใช้จ่ายและข้อมูลสมมติแยก; ไม่สร้าง environment/service ตอนนี้ ไม่คัดลอกข้อมูลจริงหรือเปลี่ยน Staging. การรับ M1 ต้องระบุข้อยกเว้นนี้ให้ Owner ทราบ และ PR #2 ยัง Draft/ไม่ Merge. งาน M1 ที่เหลือดำเนินต่อโดยเน้น Web TECH staging scope กับ LINE/security live checks ตามขอบเขตที่ได้รับอนุญาต.

ตรวจหลักฐาน Gate M1 ร่วมกับ subagent: Admin Web สร้าง/มอบหมาย Project A ไม่มี Site/Job และสร้าง Job B ผ่าน; TECH เห็น PILOT LINE A ไม่มี Site/Job ผ่านจริง แต่เป็นคนละ fixture/date. SELECT แบบอ่านอย่างเดียวเวลา 15:38 UTC ยืนยัน PILOT LINE A ผู้สร้างและผู้มอบหมายมี role OWNER จึง **ไม่ใช่** flow Admin-create/assign → TECH-LINE ใน Project เดียว; รายละเอียดจำกัดอยู่ใน [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md). ให้ Owner เห็นข้อจำกัดนี้ในการรับ M1 รอบรวม ไม่ขยาย LINE allowlist หรือเปลี่ยน assignment เพื่อเติมหลักฐานเอง.

## 26 กันยายน 2026 — ทบทวนขอบเขตการทดสอบ M1

ตรวจ `MASTER_PROMPT.md` อีกครั้ง: Gate M1 ระบุ ADMIN สร้าง Project/Job และ Assign Team, TECH เห็นงานจริงใน LINE, และ Project ที่ไม่มี Site/Job ทำ flow ได้ครบ. Provider Restore อยู่ใน Testing Strategy รวม และ Backup/Restore ปรากฏชัดใน Gate Pilot (M8). จัด [แผน UAT รอบรวม](M1_CONSOLIDATED_OWNER_UAT.md) กับ [รายการค้าง](M1_REMAINING_ACCEPTANCE_GATES.md) ให้แยกข้อความ Gate นี้ออกจากการตรวจความมั่นใจเพิ่ม. ณ ตอนทบทวน Owner ยังไม่ได้ตอบเรื่องการเลื่อน; คำตอบต่อมาบันทึกใน D-037 ข้างบน.

## 26 กันยายน 2026 — ปิด Local browser recovery drill

Local browser บนฐาน Restore สมมติผ่าน: session เดิมถูกปฏิเสธ, Login ใหม่ได้, TECH เห็นเฉพาะ Project/Job ที่มอบหมาย และ Logout ผ่าน. หลักฐานอยู่ใน [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md). สคริปต์และ [แผน UAT รอบรวม](M1_CONSOLIDATED_OWNER_UAT.md) เตรียมแล้ว. Staging browser recovery และ Web TECH บน Staging ยัง NOT_RUN; ไม่ใช้ Local PASS แทนสอง gate นี้. งานนี้ไม่เปลี่ยนแอป, schema, Staging, LINE หรือ Daily Backup.

Commit `926f840` push ไป Draft PR #2 แล้ว; [CI run 36249633023](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36249633023) verify SUCCESS. Local typecheck PASS และ regression 51 PASS / 2 native-only SKIP / 0 FAIL. PR ยัง Draft ไม่ Merge; deployment ล่าสุดยัง `dc289ee`.

ประวัติ ณ เวลาตรวจ resource ก่อน D-037: มี environment `staging` เดียว, Web/API/worker/Postgres ออนไลน์; ไม่มี Web/API recovery แยก. ฐาน recovery เดิมมีสำเนาข้อมูลจริง ไม่ใช้ทดสอบสมมติ. Trial เหลือประมาณ USD 4.54 / 26 วัน ณ เวลาตรวจ. จัด [ข้อเสนอปลายทาง recovery](M1_PROVIDER_RECOVERY_PROPOSAL.md); C2 ขณะนั้น `NOT_READY / NOT_RUN` และไม่ได้สร้างบริการหรือแก้ข้อมูล. สถานะปัจจุบันอยู่หัว D-037 ด้านบน.

เมนูสร้าง Railway environment ค่าเริ่มต้นเป็น Duplicate ซึ่งคัดลอกบริการและ variables ของ staging; ตรวจพบตัวเลือก Empty แล้วปิด dialog โดยไม่ได้สร้าง. ต่อมา Owner ปฏิเสธการสร้าง environment เพิ่ม จึงไม่ดำเนินเส้นทางนี้.

Owner ตอบว่า **ไม่สร้าง environment เพิ่ม** จึงหยุดทางเลือกนั้นตาม D-036. Trial จำกัด 5 services/project โดย staging ใช้ 4; เสนอทางเลือก service ทดสอบตัวเดียวพร้อมฐานสมมติแยกใน Postgres เดิมตาม [M1_PROVIDER_RECOVERY_PROPOSAL](M1_PROVIDER_RECOVERY_PROPOSAL.md), ยังไม่ provision/ใช้เครดิต. C2 ยัง NOT_RUN.

ประวัติ ณ ตอนเตรียม runtime: `Dockerfile.recovery` และ `recovery-server.mjs` แบบ fail-closed สำหรับ Web+API ใน service เดียว; test guard local 1PASS และ typecheck PASS. ขณะนั้น `CODED/TESTED_LOCAL`, `NOT_DEPLOYED` และ CI ยังรอผล; ผล CI ที่ผ่านแล้วบันทึกด้านล่าง. ตาม D-037 ไม่ใช้ resource นี้ใน M1.

Review พบและแก้ launcher exit code กับเพิ่มการตรวจ private host/role/date ของฐานสมมติ; CI guard ต้องยืนยันข้อความปฏิเสธก่อน DB access. ACL ของ role และ positive startup/shutdown บน provider ยัง NOT_RUN; ไม่อ้างว่าเพียงชื่อฐานทำให้แยกจาก Pilot ได้.

Commit `94d1815` local full regression 52PASS/2NativeSKIP/0FAIL, typecheck PASS; [CI36251281768](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36251281768) verify SUCCESS รวม recovery container build/guard. สถานะ runtime `TESTED_CI / NOT_DEPLOYED`; C2 ยัง NOT_RUN.

## 26 กันยายน 2026 — Owner เลื่อนการเปิด Daily Backup

Ownerสั่งยังไม่ตั้งDailyBackupตอนนี้ ให้ตั้งเมื่องานใกล้เสร็จ. สถานะ DAILY_BACKUP = DEFERRED_BY_OWNER / NOT_ENABLED ไม่ใช่PASSหรือการยกเลิกrequirement. ไม่เปิดschedule ไม่เพิ่มstorage/service/ค่าใช้จ่าย และไม่ขออนุมัติเปิดซ้ำระหว่างพัฒนา. เมื่อเตรียมปิดงานให้เสนอค่าใช้จ่าย/retention/สิทธิ์แล้วรอOwnerยืนยันเปิดจริง. ข้อกำหนดRestoreเฉพาะOWNERตามD-035ยังคงเดิม; ไม่อ้างว่าบังคับCLI/providerroleแล้ว

การเลื่อนนี้ไม่เลื่อนการทดสอบRestoreด้วยข้อมูลสมมติหรืออนุญาตให้Restoreทับข้อมูลจริง. งานM1อื่นทำต่อได้ตามscopeเดิม


## นโยบาย Backup ล่าสุด

26กันยายน — D-035 รับrequirementBackupทุกวัน/RestoreเฉพาะOWNERแล้ว. Dailybackupยังไม่เปิด: เสนอRailway24ชั่วโมงเก็บ6วัน มีstorageusageรอOwnerยืนยันใช้Trialcredit ไม่อัปเกรด/เสียเงินเพิ่ม. CoreApproleยังไม่บังคับoperatorCLIหรือproviderpermission; บันทึกแยกDESIGNED/NOT_DEPLOYED. ตรวจเอกสาร45checksและdiffcheck ไม่มีapp/schema/deploy


อัปเดต 26 กันยายน 2026 · ผู้ดูแล M1: Codex · branch codex/milestone-1-foundation · PR #2 Draft / ห้าม Merge

## ตอนนี้ถึงไหน

Foundation และ M1 Alignment เปิดใช้งานบน Staging แล้ว LINE Pilot จำกัด Owner/Admin/TECH รวมสามคน หนึ่งกลุ่ม และสองโครงการสมมติ. ยังไม่รับ Milestone 1 ทั้งหมด ไม่เริ่ม M2/M3 และไม่ Deploy Production

| รายการ | สถานะจริง |
| --- | --- |
| CODED | PASS — Foundation/Alignment และ D-033 link privacy/queue retention |
| TESTED_LOCAL / CI | PASS ตามหลักฐานเดิม: [CI36242156339](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36242156339) commit e9700b6: NativePostgreSQL53PASS/0SKIP/0FAIL, embedded51PASS/2NativeSKIP, typecheck/productionbuild/API+Webcontainer/smoke/เอกสาร PASS, typecheck/build/container/smoke; ไม่ใช่ผล LINE UAT |
| DEPLOYED_STAGING | dc289ee3088cd84639cc828b49a6f5c50a665f55 ตามหลักฐาน deployment เดิม; รอบ26ก.ย.ไม่ได้ deploy ใหม่ |
| Web Owner / Project / Job / Mobile | UAT_PASSED ตามผล Owner รอบก่อน |
| LINE Owner/Admin งานของฉัน | UAT_PASSED — เห็น A/B ตามสิทธิ์ |
| LINE TECH งานของฉัน | UAT_PASSED — ก่อนถอนเห็น A; หลังถอน A ไม่พบโครงการ; หลังมอบหมาย Job B เห็นเฉพาะ B |
| Assignment/Audit | PASS — มอบหมายระดับ Job B มี audit; assignment นอก Pilot ไม่เปลี่ยน |
| Web TECH เฉพาะ Job ที่มอบหมาย | TESTED_STAGING โดย Codex — TECH สมมติ, B/assigned Job เท่านั้น, refresh/session rejection ผ่าน; direct browser API tool-blocked |
| กลุ่มผูกโครงการ | PASS — กลุ่มทดสอบผูก A, audit การผูกสำเร็จ1 |
| R2-05 ส่งคำสั่งเดิมซ้ำ | PASS เฉพาะไม่เปลี่ยน mapping/audit; ไม่แยกพิสูจน์ single-use จาก expiry |
| R2-07 รหัสหมดอายุ | PARTIAL — Ownerแจ้งส่งซ้ำแล้ว; ตรวจ26ก.ย.พบรหัส B หมดอายุ กลุ่มยังA/audit1. ไม่มีหลักฐานระบุเวลา event ของคำสั่งนั้น จึงยังไม่อ้าง isolated expiry UAT PASS |
| Queue retention24h | PASS ณ26ก.ย.: overdue inbox/outbox0, inboxDONE33, outboxSENT28/DEAD1เดิม; ไม่มี pending. ไม่ได้อ่าน payload |
| Backup/Restore | manual encrypted backup/isolated recovery PASS เดิม; synthetic NativeCI และ Local browser restore-login PASS; Staging browser restore-login ยัง NOT_RUN |
| Owner acceptance ทั้ง M1 / Merge | NOT_AUTHORIZED |

## ผลตรวจล่าสุด

26ก.ย.เวลา12:22:13Z ตรวจแบบอ่านอย่างเดียว: รหัส B ที่เตรียมไว้ expires_at25ก.ย.14:40:07.715Z, expired=true; กลุ่มยังชี้ PILOT LINE A เพียงรายการเดียว และ LINE_GROUP_BOUND auditรวมA/Bคง1. การตรวจครั้งก่อนถูกระบบอนุมัติอัตโนมัติระงับเพราะ usage limit; ครั้งนี้ตรวจได้แล้ว ไม่ต้องให้ Owner ส่งคำสั่งเดิมซ้ำตอนนี้

กลุ่มที่ผูกอยู่แล้วมีการป้องกันเขียนทับอีกชั้น จึงไม่ใช้ผล mapping คงเดิมพิสูจน์ expiry เพียงอย่างเดียว. ไม่อ่านรหัสหรือข้อความย้อนหลังเพื่อสร้างหลักฐานเพิ่ม. แยก automated security tests ที่ผ่านออกจาก live provider UAT ที่ยังไม่ครบ

## งานรอบต่อเนื่อง 26 กันยายน

เพิ่ม automated Restore/Job isolation ผ่าน HTTP loopback ด้วยข้อมูลสมมติ: targeted test/typecheck PASS; full regression 51PASS/2NativeSKIP/0FAIL; [CI36242156339](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36242156339) commit e9700b6: NativePostgreSQL53PASS/0SKIP/0FAIL, embedded51PASS/2NativeSKIP, typecheck/productionbuild/API+Webcontainer/smoke/เอกสาร PASS. ไม่แทน browser Staging UAT. ขั้นตอน browser recovery อยู่ [checklist](M1_BROWSER_RECOVERY_CHECKLIST.md); ต่อมา Local browser PASS แต่ provider ยัง NOT_RUN. ฝากคำถามเรื่องผู้รับผิดชอบ backup ประจำวันไว้ ยังไม่เปิดบริการหรือเพิ่มค่าใช้จ่าย

รายการที่ยังต้องพิสูจน์และขอบเขตอยู่ใน [Remaining acceptance gates](M1_REMAINING_ACCEPTANCE_GATES.md). ไม่ให้ Owner ทำขั้นที่ผ่านแล้วซ้ำโดยไม่มีเหตุผล

## งานถัดไปของ Codex

1. ตรวจ Web TECH เห็นเฉพาะ Job ที่ได้รับมอบหมาย โดยใช้บัญชีสมมติและไม่แก้บัญชีจริง
2. Provider browser recovery (C2) เลื่อนไปหลัง M3/ก่อน Pilot ตาม D-037; M1 ไม่สร้างปลายทางเพิ่ม. Local browser ผ่านแล้ว แต่ยังไม่อ้าง provider PASS
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
## สถานะแวดล้อมที่ตรวจ 26 กันยายน

- Fetch origin แล้ว branch ไม่ตกหลัง main (main-only0 / branch-only70 ณ commit e9700b6)
- Railway read-only: Trial=true เครดิตประมาณ USD4.5588 เหลือ26วัน ไม่เปลี่ยนแผน/บริการ
- Browser Staging ปัจจุบันเป็นหน้า Login จึงยังไม่ยืนยัน Web TECH Job scope ผ่านหน้าจอ ไม่อ่านหรือเปลี่ยนรหัสบัญชีจริง
- [CI36242156339](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36242156339) commit e9700b6: NativePostgreSQL53PASS/0SKIP/0FAIL, embedded51PASS/2NativeSKIP, typecheck/productionbuild/API+Webcontainer/smoke/เอกสาร PASS; local regression51PASS/2NativeSKIP/typecheck/เอกสาร45checksผ่าน

26กันยายน: CIล่าสุดผ่านครบตามลิงก์ข้างต้น ไม่Deploy; browserStagingยังNOT_RUN และคำถามผู้รับผิดชอบbackupยังรอคำตอบ
