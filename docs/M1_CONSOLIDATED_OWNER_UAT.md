# M1 — แผน UAT รอบรวมครั้งเดียว

## 26 กันยายน 2026 — ดำเนิน C4 ต่อหลัง C3 ผ่าน

C3 unlink/relink = UAT_PASSED พร้อม audit ของ Owner เดิม. เริ่ม C4 provider link-token checks: เปิดลิงก์ที่เคยใช้แล้ว และขอลิงก์ใหม่เก็บไว้เกิน10นาทีก่อนเปิด โดยไม่ unlink อีก. รอผล Owner; ยัง NOT_RUN/PARTIAL ไม่เปลี่ยนเป็น PASS จากการส่งขั้นตอน.

ตรวจ [LINE account linking documentation](https://developers.line.biz/en/docs/messaging-api/linking-accounts/): link token ใช้ครั้งเดียว/อายุ10นาที; token ใช้แล้วหรือหมดอายุจะ error ที่ LINE และไม่ส่ง webhook. การเปิดลิงก์ Core ใหม่สร้าง nonce ใหม่ จึงทดสอบ provider token reuse ไม่ใช่ Core nonce reuse. Core nonce expiry/reuse มี automated proof เดิม แต่ live isolated proof ยังไม่ครบ. ถ้าลิงก์ใช้แล้วเกิน10นาทีด้วย ให้บันทึก invalid old token ไม่แยก single-use จาก expiry. ไม่ต้องส่ง secret/link ให้ Codex.


## 26 กันยายน 2026 — C3 Owner unlink/relink ผ่านรอบจริง

Owner กดยกเลิกการเชื่อมด้วยตนเอง แล้วรายงานว่าส่ง “งานของฉัน” และระบบให้เชื่อมบัญชีก่อน ไม่แสดงงาน. หลังเปิดลิงก์ใหม่ เชื่อมกลับบัญชี Owner เดิม และส่ง “งานของฉัน” Owner ยืนยันเห็น PILOT LINE A/B ถูกต้อง. สถานะ C3 = UAT_PASSED เฉพาะ lifecycle รอบนี้ ตามรายงาน Owner.

Codex ตรวจฐานแบบอ่านอย่างเดียว: LINE_UNLINKED เวลา 2026-09-26T16:50:56.073Z และ LINE_LINKED เวลา 16:52:41.260Z มี actor เดียวกันซึ่งเป็น OWNER; currently_linked=true. ไม่อ่านหรือบันทึก LINE ID/token/payload. ยืนยันกลับ Core account เดิมจาก audit; ตัวตน LINE เดิมยึดตามรายงาน Owner ไม่อ้าง raw-ID comparison.

C4 nonce expiry/reuse และ C5 isolated group-code wrong actor/expiry/replay ยัง PARTIAL/NOT_RUN ตามข้อจำกัดเดิม ไม่ใช้ C3 แทนผลเหล่านี้. ไม่ต้องทำ unlink/relink ซ้ำ. ยังไม่รับ M1 ทั้งหมด ไม่ Merge/M2/Production; ไม่มี app/schema/deployment เปลี่ยนจากการบันทึกนี้.


## ใบทดสอบสำหรับโอ๋ — ใช้ LINE บนมือถือได้

Owner ให้พักรอบ LINE ไว้ก่อนวันที่ 26 กันยายน เพราะเข้า LINE ผ่านเว็บไม่ได้. ไม่จำเป็นต้องใช้ LINE Web: ใช้แอป LINE บนมือถือคุยกับ @ASAS-WORK และเปิด CoreApp ผ่านเบราว์เซอร์มือถือได้. คำอนุญาต unlink/relink เดิมยังอยู่ แต่ยังไม่ยกเลิกบัญชีจน Owner พร้อมเชื่อมกลับ.

เมื่อพร้อม ให้ทำรอบนี้ร่วมกับ Codex เพื่อเก็บผลตามเวลา ไม่ต้องทำตอนนี้:

1. เปิด https://web-staging-cb6f.up.railway.app/ แล้ว Login ด้วยบัญชี Owner ของโอ๋ที่เชื่อม LINE อยู่ (นี่คือเว็บ CoreApp ไม่ใช่ LINE Web). แจ้งว่า Login แล้วโดยไม่ส่งรหัสผ่าน.
2. หลัง Codex ตรวจบัญชีและยกเลิกการเชื่อมตามที่อนุญาต ให้ส่ง **งานของฉัน** ในแชทส่วนตัว @ASAS-WORK. ต้องไม่แสดงโครงการและให้เชื่อมบัญชีใหม่. แจ้งข้อความตอบกลับและเวลาโดยไม่แนบลิงก์/รหัส.
3. ส่ง **เชื่อมบัญชี** แล้วเปิดลิงก์ใหม่บนมือถือ เข้าบัญชี CoreApp Owner เดิมและกดยืนยันเชื่อมด้วยตนเอง. ส่ง **งานของฉัน** อีกครั้ง ต้องกลับมาเห็น A/B ตามขอบเขต Pilot เดิม. Codex ตรวจ audit unlink/link และ mapping กลับบัญชีเดิม.
4. รอ Codex เตรียมกรณีลิงก์หมดอายุ/ใช้ซ้ำก่อนทดลองเพิ่ม. ไม่เก็บหรือส่งลิงก์ให้ Codex. หาก LINE ปฏิเสธก่อนถึง Core จะบันทึกเฉพาะ provider rejection; ไม่อ้าง Core nonce PASS.

กลุ่มผูกโครงการ: **ยังไม่ให้ส่งรหัสเพิ่ม** เพราะกลุ่มเดิมผูก A แล้ว ทำให้แยกสาเหตุ wrong actor/expiry/replay ไม่ได้ครบ. ห้ามลบ binding หรือเพิ่มกลุ่มเพื่อเติมผล PASS โดยไม่มีแผนและขอบเขตที่อนุมัติ. กรณีนี้คง PARTIAL/NOT_RUN และให้ Owner เห็นในการรับงาน.

ไม่ต้องทดสอบ C1 หน้าเว็บของช่างซ้ำ. ไม่ต้องสมัคร LINE ใหม่ ติดตั้ง LINE Web หรือส่ง password/token ในแชท.


## ผล C1 ล่าสุด — 26 กันยายน 2026

C1 ทดสอบโดย Codex บน Web Staging แล้ว: บัญชี TECH สมมติเห็นเฉพาะ B/Job ที่มอบหมาย ไม่เห็น A/sibling/ปุ่มจัดการ; refresh ผ่าน และหลังปิดบัญชี/expire session กลับหน้า Login. Injected deployed API ให้ A404/B200/users403. Browser direct API URL ถูกเครื่องมือบล็อก จึงไม่ใช้ผล injected API อ้างเป็น browser HTTP. หลักฐานใน M1_TEST_EVIDENCE.md; ไม่ขอ Owner ทำ C1 ซ้ำ. ข้อความ C1 NOT_RUN ด้านล่างเป็นแผนก่อนผลนี้ ส่วน C3–C5 ยังต้องใช้ LINE ผู้ทดลองจริง.


26 กันยายน 2026 · ผู้เตรียม: Codex · สถานะ PREPARED / NOT_RUN สำหรับรายการรอบนี้

Owner ต้องการทดลองเป็นรอบใหญ่ครั้งเดียว ให้ Codex เตรียม technical gates และวิธีเก็บหลักฐานให้พร้อมก่อนนัด ไม่ส่งคำขอทดลองทีละขั้นระหว่างพัฒนา เอกสารนี้ไม่ใช่การรับ M1 หรืออนุญาต Merge/Deploy/ขยาย LINE scope

## ขอบเขตตาม Master และคำตัดสินที่รออยู่

เกณฑ์ M1 ใน `MASTER_PROMPT.md` ระบุ Foundation และ Gate ว่า ADMIN สร้าง Project/Job กับมอบหมายทีมได้, TECH เห็นงานจริงใน LINE และ Project ที่ไม่มี Site/Job ทำ flow ได้ครบ. หลักฐานของ Gate นี้ต้องตรวจแยกจากรายการทดสอบความทนทานใน Testing Strategy รวม และจาก Backup/Restore ของ Pilot (M8). C1 เป็นการยืนยันขอบเขต Web TECH เพิ่มเติมก่อนรับงาน; ไม่ใช้ผล LINE หรือ local แทนผลหน้าจอ Staging.

หลักฐาน Admin สร้าง Project A ไม่มี Site/Job มอบหมาย TECH และสร้าง Job ใน B บน Web Staging (23 ก.ย.) กับ TECH เห็น PILOT LINE A ไม่มี Site/Job ใน LINE จริง (25 ก.ย.) ใช้ **คนละ fixture**. SELECT แบบอ่านอย่างเดียววันที่ 26 ก.ย. ยืนยัน PILOT LINE A ถูกสร้างและมอบหมายโดย role OWNER. จึงยืนยันความสามารถแต่ละส่วนได้ แต่ยังไม่อ้าง flow Admin-create/assign → TECH-LINE ใน Project เดียว. ระบุข้อจำกัดนี้ในรายงานรับ M1; หาก Owner ต้องการหลักฐาน flow เดียวเพิ่มเติม ให้เสนอขั้นทดสอบภายใน scope ที่อนุมัติในรอบ UAT รวม ไม่เพิ่ม Project allowlist เอง.

C2 เป็นการทดสอบ provider browser recovery เพิ่มจาก local/CI ที่ผ่านแล้ว. Owner เลื่อนไป **หลัง M3 และก่อน Pilot (M8)** ตาม D-037; สถานะ `DEFERRED_BY_OWNER / NOT_RUN` และไม่อยู่ในรอบ UAT M1 นี้. การรับ M1 ต้องระบุข้อยกเว้น ไม่ย้าย C2 เป็น PASS. หากจำเป็นในรอบหลัง M3 Owner อนุญาตให้พิจารณา environment เพิ่มภายใต้ข้อจำกัดด้าน Trial/ข้อมูลสมมติใน D-037; ตอนนี้ไม่สร้าง. C3–C5 เป็น live security checks ที่ต้องตกลงขอบเขตผู้ทดลองและหลักฐานก่อนรัน; ผล automated ที่ผ่านแล้วไม่เปลี่ยนเป็น provider UAT PASS.

## ผลเดิมที่ไม่ต้องทำซ้ำ

- Codex ตรวจ Web Staging ใน session OWNER ที่มีอยู่: `PRJ-3511fa71` แสดง Job 1 รายการในรายละเอียดโครงการและรายการงานย่อย ทั้งก่อนและหลัง reload/เปิดโครงการใหม่. ไม่ขอ Owner สร้าง Job ซ้ำเพื่อพิสูจน์ display; สาเหตุการกดครั้งแรกยังไม่ทราบและผลนี้ไม่ใช่ Owner UAT รอบใหม่

- Owner/Admin เห็น A/B ใน LINE; TECH เห็น A ก่อนถอน ไม่พบโครงการหลังถอน และเห็นเฉพาะ B หลังมอบหมาย Job B ผ่านแล้วตามหลักฐานเดิม ไม่สร้าง/ถอน assignment ชุดนี้ซ้ำ เว้นแต่มี regression ที่ระบุผลกระทบชัดเจน
- กลุ่มเดิมผูก A แล้ว; replay เดิมไม่เปลี่ยน mapping/audit ผ่านเฉพาะพฤติกรรม ไม่ใช่ isolated single-use PASS
- Local browser บนฐาน restore สมมติ: TECH login เห็น B/เฉพาะ Job ที่มอบหมาย refresh และ logout ผ่าน; บันทึกหลักฐานแล้วใน [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md) แยกจาก provider และยังไม่แทน Staging browser recovery
- ไม่ขอส่งรหัส B เดิมซ้ำอีก: expiry ยัง PARTIAL เพราะไม่มีเวลา event ที่ผูกกับคำสั่งนั้น และกลุ่มมี overwrite guard

## Codex ต้องเตรียมก่อนนัด Owner

Health snapshot 26 ก.ย. 16:17 UTC: Web Staging `HEAD /` HTTP 200 และ `GET /api/health` ตอบ `status=ok, database=ready`. ตรวจซ้ำใกล้รอบ UAT เพราะผลนี้เป็นสถานะชั่วขณะ ไม่พิสูจน์ release SHA หรือ TECH/LINE flow.

| รายการ | เกณฑ์พร้อม และสิ่งที่ยังห้ามอ้าง |
| --- | --- |
| Release/ระบบ | ระบุ SHA ของ Web/API/worker และ CI ที่รองรับจริง ตรวจ health, flags/allowlists, queue/overdue payload และ Trial ตามขอบเขตเดิม ไม่ deploy/เพิ่มบริการเพื่อเตรียมรอบโดยอัตโนมัติ |
| Staging Web TECH | เตรียมบัญชีและ Project/Job สมมติที่อนุมัติไว้ มี Job ที่รับผิดชอบและ sibling ที่ไม่รับผิดชอบ ตรวจ browser scope โดย Codex ก่อน ไม่ใช้ session ของ Owner แทน TECH |
| Provider browser recovery หลัง M3 | ไม่ใช่เงื่อนไขนัด UAT M1 ตาม D-037; ก่อนรอบหลัง M3 ต้องระบุฐานสมมติว่างแยก + วิธีเปิด Web/API แยก ตรวจ schema/สิทธิ์/TLS และ Login fixture ตาม [recovery checklist](M1_BROWSER_RECOVERY_CHECKLIST.md). ห้ามชี้ Pilot ไปฐานอื่นหรือ restore ทับฐานหลัก |
| LINE identity lifecycle | เตรียมแผนใช้บัญชีผู้ทดลองคนเดิมและวิธีกู้การเชื่อมกลับ ขอบเขต unlink/relink ของบัญชีจริงต้องได้รับความยินยอมเฉพาะรายการก่อนทำ ไม่สลับ role/บัญชีหรือขอรหัสผ่าน |
| วิธีพิสูจน์ nonce/code | ตรวจว่าหน้าจอ provider เปิดทางให้ทดลอง expiry/reuse ได้จริง และเก็บเฉพาะเวลา/status/audit โดยไม่เก็บ token/payload การรอก่อนกดยืนยันบน Core อาจยังไม่ได้สร้าง nonce จึงไม่ถือเป็นการรอ nonce หมดอายุ |
| กรณีแยกสาเหตุไม่ได้ | กลุ่มที่ผูก A อยู่แล้วมี overwrite guard; TECH มีคนเดียว จัดรายการ wrong actor/single-use/expiry/T1–T2 ที่พิสูจน์แยกไม่ได้ให้ Owner ตัดสินขอบเขตครั้งเดียวก่อนนัด ห้ามลบ binding หรือเพิ่มกลุ่ม/allowlistเอง |

ถ้าต้องเปลี่ยนขอบเขต ให้เสนอชื่อกรณี ผลกระทบ วิธีคืนสถานะ และค่าใช้จ่ายรวมครั้งเดียวก่อนรอบจริง การยินยอมทำ UAT โดยทั่วไปไม่เท่ากับอนุญาต unlink บัญชีจริง เพิ่มผู้ทดลอง/กลุ่ม หรือเปิดบริการใหม่ รายการที่ยังไม่ได้อนุญาตคง BLOCKED/NOT_RUN และไม่รวมเป็นขั้นที่ให้ Owner กดทันที

ผลตรวจ resource วันที่ 26 กันยายน: มี Railway environment `staging` เพียงชุดเดียว; ยังไม่มี Web/API recovery แยก. ฐาน recovery เดิมมีสำเนาข้อมูลจริงจึงใช้เป็น fixture ไม่ได้. D-037 เลื่อน C2 ไปหลัง M3 และเปิดทางเลือก environment ใหม่เมื่อจำเป็น; [ข้อเสนอปลายทาง provider](M1_PROVIDER_RECOVERY_PROPOSAL.md) เป็นข้อมูลเตรียมรอบหลัง. C2 คง `DEFERRED_BY_OWNER / NOT_RUN`.

## ใบทดลองของ Owner/ผู้ทดลองในรอบเดียว

ใช้เฉพาะแถวที่ prerequisites พร้อมและได้รับอนุญาตแล้ว Codex เป็นผู้จับเวลา/ตรวจ backend; แต่ละคนใช้บัญชีของตนเอง ไม่ส่ง password/link/token ให้ Codex ระหว่างรอ expiry สามารถทำ Web ได้ แล้วสรุปผลทุกแถวครั้งเดียวหลังจบรอบ

| ลำดับ | ผู้ทำและขั้นตอน | ผลที่ต้องเห็น / หลักฐานที่ Codex เก็บ |
| --- | --- | --- |
| C1 Web TECH บน Staging — ตรวจแล้ว | Codex ใช้ TECH สมมติ ไม่ต้องให้ Owner ทำซ้ำ | UI scope/refresh/session rejection ผ่าน; injected API A404/B200/users403; direct browser API tool-blocked แยก NOT_RUN |
| C2 Browser หลัง recovery — เลื่อนหลัง M3 | ไม่รันใน UAT M1; เมื่อถึงรอบหลัง M3 และมี isolated provider recovery ที่ตรวจแล้ว ผู้ทดลองใช้บัญชีสมมติใน URL ที่แยกชัดเจน | session ก่อน restore ใช้ไม่ได้; login ใหม่ได้ ข้อมูล/scope ตรง fixture; refresh/logout ผ่าน แยกจากผล local และไม่ทดลองด้วยบัญชีจริง |
| C3 Unlink/relink | เฉพาะบัญชีที่เจ้าของยินยอมในแผน: ยกเลิกเชื่อมจาก Web ตรวจคำขอ LINE ใหม่ แล้วเชื่อมบัญชีเดิมกลับ | หลัง unlink ไม่มีสิทธิ์เรียกงานผ่านตัวตนเดิม; กลับมาเชื่อมกับบัญชีเดิมได้ มี audit และไม่มีการสวมบัญชีอื่น การเรียกงานหลัง relink ใช้ตรวจ lifecycle เฉพาะจุด ไม่ทำ A/revoke/B ซ้ำ |
| C4 Nonce expiry/reuse | ใช้ลิงก์ทดสอบใหม่ตามวิธีที่ตรวจว่า provider รองรับแล้ว รอเกิน expiry จริงหรือใช้รายการสำเร็จซ้ำตามกรณีที่เตรียมไว้ | ต้องยืนยันว่าคำขอถึงระบบในช่วงที่ต้องการ และไม่เกิดการเชื่อมใหม่ผิดเงื่อนไข; ถ้า provider ปฏิเสธก่อนถึง Core บันทึกได้เฉพาะ provider rejection ไม่อ้าง Core nonce PASS |
| C5 Group code security | เฉพาะกรณีที่แยก wrong actor/replay/expiry ได้ใน scope ที่อนุมัติ ใช้รหัสใหม่และเวลาที่บันทึกไว้; ไม่ใช้รหัสเก่าซ้ำเพื่อเติมหลักฐาน | รหัสของผู้สร้างผิดคน/ใช้แล้ว/หมดอายุไม่สร้าง binding หรือ successful audit เพิ่ม หลักฐานต้องแยกจาก overwrite guard; ถ้ายังแยกไม่ได้คง PARTIAL/NOT_RUN |

การทดสอบ T1/T2 บน provider ต้องมี TECH คนที่สองในขอบเขตที่อนุมัติก่อน ปัจจุบันขอบเขตมี TECH คนเดียว จึงไม่มีขั้นให้ Owner เพิ่มคนเองในรอบนี้ Automated สอง TECH ผ่านไม่แทน provider UAT

## สรุปครั้งเดียวหลังจบรอบ

Codex บันทึก C1 และ C3–C5 ที่รันจริงแยก PASS/FAIL/PARTIAL/NOT_RUN พร้อม SHA, เวลา, environment, หลักฐาน UI/status/count/audit และข้อจำกัด; C2 ระบุ `DEFERRED_BY_OWNER / NOT_RUN` ตาม D-037. ห้ามแนบภาพที่มีรหัส ลิงก์เชื่อม cookie, HAR หรือข้อมูลส่วนบุคคล ใช้รายงาน Owner แยกจากภาพที่ Codex ตรวจเอง ทดสอบซ้ำเฉพาะข้อที่ผิดหรือได้รับผลกระทบจริง

ส่งผลรวมและ blocker ให้ Owner พิจารณารับ M1 ครั้งเดียว รายการที่ยังไม่ครบห้ามเปลี่ยนเป็น PASS จากการรับทราบข้อจำกัด; หากจะปรับเกณฑ์ acceptance ต้องบันทึกการตัดสินใจชัดเจน การรับ M1 กับการอนุญาต Merge เป็นคนละรายการ

Daily Backup ยังคง DEFERRED_BY_OWNER / NOT_ENABLED จนงานใกล้ปิดตามคำสั่งล่าสุด ไม่ขอเปิดซ้ำระหว่างพัฒนา และไม่ถือว่าผ่านแล้ว Restore เฉพาะ OWNER ตาม D-035 ยังต้องพิสูจน์การบังคับสิทธิ์ในเส้นทางที่จะใช้จริง; บทบาท CoreApp ไม่ได้ควบคุม provider/CLI โดยอัตโนมัติ PITR/production resilience แยกจากผลรอบนี้ ไม่มีการเปิดบริการหรือเสียเงินเพิ่ม
