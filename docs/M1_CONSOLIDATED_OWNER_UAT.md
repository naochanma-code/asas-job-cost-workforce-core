# M1 — แผน UAT รอบรวมครั้งเดียว

26 กันยายน 2026 · ผู้เตรียม: Codex · สถานะ PREPARED / NOT_RUN สำหรับรายการรอบนี้

Owner ต้องการทดลองเป็นรอบใหญ่ครั้งเดียว ให้ Codex เตรียม technical gates และวิธีเก็บหลักฐานให้พร้อมก่อนนัด ไม่ส่งคำขอทดลองทีละขั้นระหว่างพัฒนา เอกสารนี้ไม่ใช่การรับ M1 หรืออนุญาต Merge/Deploy/ขยาย LINE scope

## ผลเดิมที่ไม่ต้องทำซ้ำ

- Owner/Admin เห็น A/B ใน LINE; TECH เห็น A ก่อนถอน ไม่พบโครงการหลังถอน และเห็นเฉพาะ B หลังมอบหมาย Job B ผ่านแล้วตามหลักฐานเดิม ไม่สร้าง/ถอน assignment ชุดนี้ซ้ำ เว้นแต่มี regression ที่ระบุผลกระทบชัดเจน
- กลุ่มเดิมผูก A แล้ว; replay เดิมไม่เปลี่ยน mapping/audit ผ่านเฉพาะพฤติกรรม ไม่ใช่ isolated single-use PASS
- Local browser บนฐาน restore สมมติ: TECH login เห็น B/เฉพาะ Job ที่มอบหมาย refresh และ logout ผ่าน; บันทึกหลักฐานแล้วใน [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md) แยกจาก provider และยังไม่แทน Staging browser recovery
- ไม่ขอส่งรหัส B เดิมซ้ำอีก: expiry ยัง PARTIAL เพราะไม่มีเวลา event ที่ผูกกับคำสั่งนั้น และกลุ่มมี overwrite guard

## Codex ต้องเตรียมก่อนนัด Owner

| รายการ | เกณฑ์พร้อม และสิ่งที่ยังห้ามอ้าง |
| --- | --- |
| Release/ระบบ | ระบุ SHA ของ Web/API/worker และ CI ที่รองรับจริง ตรวจ health, flags/allowlists, queue/overdue payload และ Trial ตามขอบเขตเดิม ไม่ deploy/เพิ่มบริการเพื่อเตรียมรอบโดยอัตโนมัติ |
| Staging Web TECH | เตรียมบัญชีและ Project/Job สมมติที่อนุมัติไว้ มี Job ที่รับผิดชอบและ sibling ที่ไม่รับผิดชอบ ตรวจ browser scope โดย Codex ก่อน ไม่ใช้ session ของ Owner แทน TECH |
| Provider browser recovery | ระบุฐานสมมติว่างแยก + วิธีเปิด Web/API แยกที่อนุมัติแล้วจริง ตรวจ schema/สิทธิ์/TLS และ Login fixture ได้ ทำตาม [recovery checklist](M1_BROWSER_RECOVERY_CHECKLIST.md) ห้ามชี้ Pilot ไปฐานอื่นหรือ restore ทับฐานหลัก; ถ้ายังไม่มี environment ให้คง NOT_RUN |
| LINE identity lifecycle | เตรียมแผนใช้บัญชีผู้ทดลองคนเดิมและวิธีกู้การเชื่อมกลับ ขอบเขต unlink/relink ของบัญชีจริงต้องได้รับความยินยอมเฉพาะรายการก่อนทำ ไม่สลับ role/บัญชีหรือขอรหัสผ่าน |
| วิธีพิสูจน์ nonce/code | ตรวจว่าหน้าจอ provider เปิดทางให้ทดลอง expiry/reuse ได้จริง และเก็บเฉพาะเวลา/status/audit โดยไม่เก็บ token/payload การรอก่อนกดยืนยันบน Core อาจยังไม่ได้สร้าง nonce จึงไม่ถือเป็นการรอ nonce หมดอายุ |
| กรณีแยกสาเหตุไม่ได้ | กลุ่มที่ผูก A อยู่แล้วมี overwrite guard; TECH มีคนเดียว จัดรายการ wrong actor/single-use/expiry/T1–T2 ที่พิสูจน์แยกไม่ได้ให้ Owner ตัดสินขอบเขตครั้งเดียวก่อนนัด ห้ามลบ binding หรือเพิ่มกลุ่ม/allowlistเอง |

ถ้าต้องเปลี่ยนขอบเขต ให้เสนอชื่อกรณี ผลกระทบ วิธีคืนสถานะ และค่าใช้จ่ายรวมครั้งเดียวก่อนรอบจริง การยินยอมทำ UAT โดยทั่วไปไม่เท่ากับอนุญาต unlink บัญชีจริง เพิ่มผู้ทดลอง/กลุ่ม หรือเปิดบริการใหม่ รายการที่ยังไม่ได้อนุญาตคง BLOCKED/NOT_RUN และไม่รวมเป็นขั้นที่ให้ Owner กดทันที

## ใบทดลองของ Owner/ผู้ทดลองในรอบเดียว

ใช้เฉพาะแถวที่ prerequisites พร้อมและได้รับอนุญาตแล้ว Codex เป็นผู้จับเวลา/ตรวจ backend; แต่ละคนใช้บัญชีของตนเอง ไม่ส่ง password/link/token ให้ Codex ระหว่างรอ expiry สามารถทำ Web ได้ แล้วสรุปผลทุกแถวครั้งเดียวหลังจบรอบ

| ลำดับ | ผู้ทำและขั้นตอน | ผลที่ต้องเห็น / หลักฐานที่ Codex เก็บ |
| --- | --- | --- |
| C1 Web TECH บน Staging | TECH เปิด Project B ปัจจุบันจาก Web แล้วดู Jobs/refresh/logout ไม่เปลี่ยน assignment | เห็นเฉพาะ Job ที่ได้รับมอบหมาย; sibling และ direct URL นอกสิทธิ์เข้าไม่ได้; logout แล้ว session ใช้ต่อไม่ได้ บันทึก UI และ HTTP status โดยไม่เก็บ cookie |
| C2 Browser หลัง recovery | เมื่อ Codex เตรียม isolated provider recovery แล้ว ผู้ทดลองใช้บัญชีสมมติใน URL ที่แยกชัดเจน | session ก่อน restore ใช้ไม่ได้; login ใหม่ได้ ข้อมูล/scope ตรง fixture; refresh/logout ผ่าน แยกจากผล local และไม่ทดลองด้วยบัญชีจริง |
| C3 Unlink/relink | เฉพาะบัญชีที่เจ้าของยินยอมในแผน: ยกเลิกเชื่อมจาก Web ตรวจคำขอ LINE ใหม่ แล้วเชื่อมบัญชีเดิมกลับ | หลัง unlink ไม่มีสิทธิ์เรียกงานผ่านตัวตนเดิม; กลับมาเชื่อมกับบัญชีเดิมได้ มี audit และไม่มีการสวมบัญชีอื่น การเรียกงานหลัง relink ใช้ตรวจ lifecycle เฉพาะจุด ไม่ทำ A/revoke/B ซ้ำ |
| C4 Nonce expiry/reuse | ใช้ลิงก์ทดสอบใหม่ตามวิธีที่ตรวจว่า provider รองรับแล้ว รอเกิน expiry จริงหรือใช้รายการสำเร็จซ้ำตามกรณีที่เตรียมไว้ | ต้องยืนยันว่าคำขอถึงระบบในช่วงที่ต้องการ และไม่เกิดการเชื่อมใหม่ผิดเงื่อนไข; ถ้า provider ปฏิเสธก่อนถึง Core บันทึกได้เฉพาะ provider rejection ไม่อ้าง Core nonce PASS |
| C5 Group code security | เฉพาะกรณีที่แยก wrong actor/replay/expiry ได้ใน scope ที่อนุมัติ ใช้รหัสใหม่และเวลาที่บันทึกไว้; ไม่ใช้รหัสเก่าซ้ำเพื่อเติมหลักฐาน | รหัสของผู้สร้างผิดคน/ใช้แล้ว/หมดอายุไม่สร้าง binding หรือ successful audit เพิ่ม หลักฐานต้องแยกจาก overwrite guard; ถ้ายังแยกไม่ได้คง PARTIAL/NOT_RUN |

การทดสอบ T1/T2 บน provider ต้องมี TECH คนที่สองในขอบเขตที่อนุมัติก่อน ปัจจุบันขอบเขตมี TECH คนเดียว จึงไม่มีขั้นให้ Owner เพิ่มคนเองในรอบนี้ Automated สอง TECH ผ่านไม่แทน provider UAT

## สรุปครั้งเดียวหลังจบรอบ

Codex บันทึก C1–C5 แยก PASS/FAIL/PARTIAL/NOT_RUN พร้อม SHA, เวลา, environment, หลักฐาน UI/status/count/audit และข้อจำกัด ห้ามแนบภาพที่มีรหัส ลิงก์เชื่อม cookie, HAR หรือข้อมูลส่วนบุคคล ใช้รายงาน Owner แยกจากภาพที่ Codex ตรวจเอง ทดสอบซ้ำเฉพาะข้อที่ผิดหรือได้รับผลกระทบจริง

ส่งผลรวมและ blocker ให้ Owner พิจารณารับ M1 ครั้งเดียว รายการที่ยังไม่ครบห้ามเปลี่ยนเป็น PASS จากการรับทราบข้อจำกัด; หากจะปรับเกณฑ์ acceptance ต้องบันทึกการตัดสินใจชัดเจน การรับ M1 กับการอนุญาต Merge เป็นคนละรายการ

Daily Backup ยังคง DEFERRED_BY_OWNER / NOT_ENABLED จนงานใกล้ปิดตามคำสั่งล่าสุด ไม่ขอเปิดซ้ำระหว่างพัฒนา และไม่ถือว่าผ่านแล้ว Restore เฉพาะ OWNER ตาม D-035 ยังต้องพิสูจน์การบังคับสิทธิ์ในเส้นทางที่จะใช้จริง; บทบาท CoreApp ไม่ได้ควบคุม provider/CLI โดยอัตโนมัติ PITR/production resilience แยกจากผลรอบนี้ ไม่มีการเปิดบริการหรือเสียเงินเพิ่ม
