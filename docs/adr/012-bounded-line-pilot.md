# ADR-012 — Bounded LINE Pilot และ private enrollment

สถานะ: Accepted implementation under Owner pilot approval · 24 กันยายน 2026 · ไม่มี migration

Owner อนุมัติ OA/กลุ่มทดสอบกับ Owner/Admin/TECH 1 คน ภายใน Railway Trial และยืนยันให้เปลี่ยน Webhook เดิมของ OA ที่ระบุได้ ไม่ใช่ Production/Merge/M2 หรือค่าใช้จ่ายเพิ่ม

## เหตุผลและข้อกำหนด

Staging มีข้อมูลจริงปนอยู่ OWNER เห็นทุก Project ตามสิทธิ์ Web จึงต้องเพิ่ม LINE_TEST_PROJECT_IDS เป็น exact UUID allowlist ที่ API/worker ใช้ร่วมกัน เป็น intersection กับสิทธิ์ปกติ ไม่มี wildcard/ค่าเริ่มต้นเปิดทั้งหมด บังคับทั้งสร้าง binding code, consume code และอ่าน Project ตอนส่งข้อความ ช่องว่างปิดทุก Project บน LINE โดยไม่กระทบสิทธิ์ Web

ตรวจ source รูปแบบ user/group และ allowlist ซ้ำก่อน process queued event ป้องกันบัญชีที่ถอนสิทธิ์แล้วเชื่อมบัญชีหรือผูกกลุ่มจากข้อความค้าง; ยกเลิก outbox ก่อนส่งหาก recipient ถูกถอน Worker ต้องมี HTTPS origin ที่ไม่มี credentials/query/path, allowlists ครบ และ key32bytes; error ใช้ข้อความคงที่ไม่พิมพ์ exception/connection details SIGTERM หยุดรับงานใหม่ก่อนส่งรอบถัดไป ต้องทดสอบ lifecycle บน Staging เพิ่ม

## Enrollment โดยไม่เปิด business LINE

- ใช้ LINE_ENROLLMENT_ENABLED=true และ LINE_ENABLED=false เท่านั้น เปิดทั้งสองพร้อมกัน webhook503/workerไม่ทำงาน
- OWNER ที่มี session เริ่มรอบจาก /line-pilot (POST /api/line/enrollment/start) รับรหัสสุ่ม192bit 3รหัสส่วนตัว+1รหัสกลุ่ม ใช้ครั้งเดียว อายุ15นาที เก็บเฉพาะ hash ใน process memory ไม่บันทึกรหัสหรือข้อความดิบลงฐาน/Log
- webhook ต้องผ่าน raw-body HMAC-SHA256 และ destination เดิมก่อนรับเฉพาะคำสั่งลงทะเบียนที่ตรงรหัส ปฏิเสธชนิด source ที่ไม่ตรงและสมาชิกซ้ำ ผู้ส่งรหัสกลุ่มต้องลงทะเบียนส่วนตัวในรอบแล้ว
- เก็บเฉพาะ user/group IDs สูงสุด3คน/1กลุ่มใน memory ไม่มี inbox/outbox, account linking, binding หรือ reply จากระบบ ขั้นนี้จึงไม่เป็นการเปิดดูงานจริง
- เฉพาะ OWNER ผู้เริ่มรอบอ่านผลได้ผ่าน GET /api/line/enrollment; Cache-Control:no-store; restart/expiryล้างผลและต้องเริ่มใหม่ จำกัด1รอบต่อprocess ไม่รองรับหลายreplicaในpilotนี้
- ผู้ดูแลตรวจ counts/ขอบเขตแล้วนำ IDs ไป Railway Variables โดยตรง ไม่ส่งเข้าChat/Git/Log ไม่อนุมัติสิทธิ์อัตโนมัติจากการรับข้อความ ปิด enrollment ก่อนเริ่ม business LINE
- audit LINE_PILOT_ENROLLMENT_STARTED เก็บ actor/time โดยไม่มี codes/IDs/rawข้อความ การกรอกตัวแปรและเปิด mode บันทึกเฉพาะชื่อ/สถานะในหลักฐาน

## ข้อจำกัด

การถือรหัสเป็นหลักฐานการเข้าร่วมทดลอง ไม่ใช่การยืนยันตัวบุคคลหรือแอปบัญชี; ต้องตรวจผู้ทดลอง3คนและเชื่อมบัญชีตาม nonce flow เดิมภายหลัง ไม่ใช่ public onboarding. หมดอายุ/restartต้องเริ่มใหม่ ไม่แก้ปัญหาด้วยlog raw eventsหรือเปิดwildcard. LINE provider auto-reply/greeting เดิมอาจตอบเอง ต้องตรวจแยกจาก worker

อ้างอิงทางการ: [LINE signature](https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/), [User IDs](https://developers.line.biz/en/docs/messaging-api/getting-user-ids/), [Group source](https://developers.line.biz/en/docs/messaging-api/group-chats/). Verification/ID collection ไม่ได้ถือว่า account linking/UAT ผ่าน
