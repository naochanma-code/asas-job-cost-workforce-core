# M1 LINE Pilot Checklist

สถานะ PREPARED / NOT_READY_TO_ENABLE / REAL_LINE_NOT_RUN · 24 กันยายน2026

OwnerยืนยันJobสร้างได้แล้ว; Web/APIและmanualBackupRestoreมีหลักฐานผ่านตาม [สถานะปัจจุบัน](PROJECT_STATUS.md) แต่ยังไม่ใช่M1accepted. Read-only preflightพบLINE=false, LINEconfigยังไม่ตั้งและworkerยังไม่deploy. ปิดtechnicalgatesและยืนยันขอบเขตทดลองตาม [Readiness](M1_LINE_PILOT_READINESS.md) ก่อนเปิดจริง

LINE ใน M1 ทดลองได้เฉพาะเชื่อมบัญชี, เรียกงานของฉัน, ผูกกลุ่มกับ Project และถอนสิทธิ์ ยังไม่มีลงวันทำงาน/OT/ค่าใช้จ่าย/รูปบิลผ่าน LINE

## ก่อนนัดผู้ทดลอง

- [x] โอ๋อนุมัติ Railway Trial และ deployment **Staging** เท่านั้น ห้ามอัปเกรด/เพิ่มบริการเสียเงิน ไม่รวม production หรือ Merge
- [ ] Codex บันทึก release SHA, CI PASS และปิด blockers ใน Staging plan
- [ ] HTTPS, DB TLS, cookie, private API/DB, log redaction และ restore ผ่านตาม [security matrix](M1_STAGING_TEST_MATRIX.md)
- [ ] เปิด LINE เฉพาะเมื่อโอ๋ยืนยัน OA/กลุ่ม/ผู้ร่วมทดลองและวันทดลอง ห้ามส่งข้อความทดสอบก่อนอนุมัติ
- [ ] ใช้ข้อมูลสมมติ [fixture manifest](fixtures/m1-pilot.json); ไม่มีบิล ค่าแรง รายชื่อลูกค้าจริง

## Owner โอ๋

- [ ] เป็นเจ้าของบัญชี Hosting และมีสิทธิ์ดู billing/recovery; เปิด MFA ของ provider
- [ ] มีบัญชี OWNER แยกจาก Admin ไม่ใช้ demo-owner หรือรหัส local ที่เคยเผยในแชท
- [ ] เลือกช่าง 1 คนที่ยินดีทดลอง เตรียมโทรศัพท์ของตนเอง ฟ้า และช่าง
- [ ] กรอก Channel Secret/Access Token ใน Environment/Secret Manager ด้วยตนเอง ไม่ส่งให้ Codex ผ่านแชท/GitHub ไม่แนบภาพ secret
- [ ] ยืนยันนโยบายสำรอง Foundation ที่เสนอ: ทุกวัน เก็บ 7 วัน encrypted/private; แยกจากบิล 2 ปี
- [ ] เตรียมเวลา 45–60 นาที และบันทึกผล UAT ทุกข้อ; M0 acceptance เดิมไม่ใช่ acceptance ของ M1

## Admin ฟ้า

- [ ] Login ด้วยบัญชี ADMIN ของตน สร้างลูกค้าทดสอบและ Project A ไม่เลือก Site/Job
- [ ] สร้าง Site B, Project B และ Job B ตาม manifest
- [ ] มอบหมายช่าง T1 ให้ A เท่านั้นในรอบแรก ตรวจว่า B ยังไม่ปรากฏแก่ T1
- [ ] เพิ่ม OA ทดสอบเป็นเพื่อน พิมพ์ “เชื่อมบัญชี” ในแชทส่วนตัว เปิดลิงก์ login บัญชีฟ้าและยืนยัน
- [ ] สร้างรหัสผูกกลุ่มจากหน้า A และใช้ LINE ของฟ้าเองส่งคำสั่งในกลุ่มทดสอบภายใน 10 นาที
- [ ] ถอน assignment T1 ของ A แล้วตรวจผลกับช่างทันที จากนั้นรอบที่สองมอบหมาย T1 ให้ Job B และตรวจเห็น B เพียงโครงการเดียว

## Technician T1 (ผู้ทดลองจริง 1 คน)

- [ ] เพิ่ม OA เป็นเพื่อน ใช้บัญชี TECH เฉพาะของตน ไม่ใช้บัญชีฟ้าหรือโอ๋
- [ ] พิมพ์ “เชื่อมบัญชี” ในแชทส่วนตัว เปิดลิงก์และ login กดยืนยัน แล้วกลับ LINE
- [ ] พิมพ์ “งานของฉัน” เห็นเฉพาะ A ตาม assignment ไม่เห็น B แม้อยู่ในกลุ่มที่ผูก A
- [ ] หลังถอน A พิมพ์ใหม่ ต้องไม่มี A และ URL เดิมเข้าถึงไม่ได้
- [ ] หลังมอบหมาย Job B พิมพ์ใหม่ ต้องเห็น B; Web แสดง Job B ภายใต้ B ไม่ปะปน A
- [ ] ทดลอง unlink แล้วเรียกงานอีกครั้ง ระบบให้เชื่อมใหม่ ไม่เผยชื่อ Project

## LINE OA และ LINE Group ทดสอบ

- [ ] ยืนยันเป็น OA แยกจากลูกค้าจริง และมี Messaging API channel ของ OA นี้
- [ ] ตั้ง Webhook URL เป็น `https://<staging-web>/api/line/webhook` หลังอนุมัติ; certificate ถูกต้อง ไม่ใช้ localhost/self-signed
- [ ] เปิด Use webhook และ Verify ผ่าน; ปิด auto-response ที่ซ้ำกับ bot ระหว่างทดสอบตามที่ Owner อนุญาต
- [ ] เปิด Allow bot to join group chats แล้วเพิ่ม OA ในกลุ่มทดสอบเดียวที่อนุมัติ
- [ ] API/worker มี user/group allowlist ตรงกัน ห้าม wildcard หรือปิด allowlist เพื่อให้ทดสอบผ่าน
- [ ] วิธีได้ IDs: ใช้ Your user ID ของ channel เมื่อมีสิทธิ์ หรือให้ operator ตรวจเฉพาะ `source.userId`/`source.groupId` จาก webhook ที่ตรวจ signature แล้วในเครื่องมือ private ที่ไม่ log body; บันทึกลง secret fields โดยตรง ไม่ส่ง IDs/ชื่อสมาชิกเข้า Git
- [ ] **ก่อนเริ่มจริงต้องเตรียมวิธีเก็บ IDs ให้เรียบร้อย:** API ปัจจุบัน discard event นอก allowlist และไม่มีหน้าจอ enrollment จึงไม่สามารถใช้ “ส่งแล้วรอดู log” เป็นขั้นตอนที่รับประกันได้ ห้ามเพิ่มระบบเก็บ raw webhook สาธารณะชั่วคราว; ถ้าไม่มี IDs ให้ operator เตรียม signed enrollment แบบ private และทดสอบก่อนนัดผู้ใช้
- [ ] กลุ่มต้องไม่แสดงรายชื่อคน รายละเอียดโครงการหรือยอดเงิน ตอบเพียงยืนยันการผูก/แนะนำไปแชทส่วนตัว
- [ ] กลุ่มผูกได้ครั้งเดียว ไม่มี silent rebind หากผิดโครงการหยุดทดลองให้ operator ตรวจ audit ไม่สร้างรหัสใหม่ทับเฉยๆ

LINE linkToken ของแพลตฟอร์มใช้ได้ครั้งเดียว อายุ 10 นาที; nonce และ group code ฝั่ง Core อายุ 10 นาทีเช่นกัน การทดสอบ mock พิสูจน์ได้เฉพาะฝั่ง Core; token ของ LINE ต้องตรวจจริงตาม [official linking contract](https://developers.line.biz/en/docs/messaging-api/linking-accounts/)

## ระหว่างและหลังทดลอง

- [ ] Codex จดเวลาแต่ละขั้น ผลจริง และ event correlation ที่ไม่เผยตัวบุคคล; screenshots ปิดชื่อจริง/IDs/token/query ก่อนเก็บในพื้นที่ private หลักฐาน Git มีเพียงสรุปและ reference ที่ไม่ลับ
- [ ] ตรวจ inbox/outbox DONE/SENT; ถ้า DEAD หยุดหาสาเหตุ ห้ามวนส่งซ้ำไม่จำกัดหรือ fallback push เอง
- [ ] จบแต่ละรอบ backup; ทดสอบ restart/restore ตาม UAT โดยปิด worker ของระบบ restore
- [ ] ถ้าเจอข้อมูลข้าม Project หรือหลุดถึงผู้ไม่ร่วมทดลอง ให้ปิด LINE/worker ทันที บันทึก FAIL และแก้ M1 ก่อนทดลองใหม่
- [ ] หลังจบ pilot ปิด LINE/worker ตามช่วงที่อนุมัติและตรวจบิล ไม่ลบหลักฐานหรือ DB จน Owner อนุมัติ
- [ ] Owner รับรองผล M1 แยกต่างหากก่อนพิจารณา Ready/Merge; ยังไม่เริ่ม M2
