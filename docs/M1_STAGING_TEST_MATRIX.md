# M1 — Security / Staging verification

แยกผล local/CI ออกจาก provider จริงทุกครั้ง หลักฐานผลอยู่ [M1_TEST_EVIDENCE](M1_TEST_EVIDENCE.md) เอกสารนี้ระบุวิธีรันและเกณฑ์ ไม่ใช่ผล PASS

| ID | Automated coverage | สิ่งที่ Codex ต้องตรวจ Staging หลังอนุมัติ | ผล Staging |
| --- | --- | --- | --- |
| S01 HTTPS/cookie | staging-security: NODE_ENV=production ปฏิเสธ HTTP/PGlite; HTTPS origin ออก Secure/HttpOnly/SameSite=Strict/8h; Origin อื่น logout ไม่ได้ | เปิด URL จริง certificate chain/hostname/expiry ถูกต้อง; HTTP→HTTPS; DevTools ตรวจ cookie flags โดยไม่คัดลอกค่า, HTTP ไม่ส่ง session; log ต้องไม่เก็บ linkToken/query; ไม่มี mixed content | ดูผลแยกด้านล่าง |
| S02 Rate limit | login ครั้งที่11/IP/min →429 แม้ปลอม X-Forwarded-For; ผิด5ครั้ง/บัญชีล็อก15นาทีแม้สลับIP; หมดเวลาปลดล็อก | นัดช่วงสั้นใช้บัญชีทดสอบ ส่ง11คำขอ ดู429+Retry-After; ทดสอบ3ผู้ใช้ผ่าน edge และ global120/min; บันทึกว่า shared proxy bucket หรือ per-client; ห้ามยิง load ใส่ OA/ผู้ใช้จริง | ดูผลแยกด้านล่าง |
| S03 Signature | foundation + staging-security: bad/missing signature, raw bytes เปลี่ยน, destinationผิด, empty Verify, duplicate event | OA Verify; signed event จริง commitก่อน200; body/signatureไม่ถูกproxyเปลี่ยน; invalid signature→401/inboxไม่เพิ่ม; ตรวจ logs ไม่เผย payload | ดูผลแยกด้านล่าง |
| S04 Token/code | foundation: sessionหมดอายุ, nonce10นาที/ใช้ครั้งเดียว, group codeหมดอายุ/ใช้ซ้ำ/ผู้สร้างผิด | ลิงก์LINEใหม่รอเกิน10นาที/ใช้ซ้ำต้องปฏิเสธ; group codeกรณีเดียวกันและไม่เปลี่ยนbinding; sessionหมดอายุ/ถอนบัญชี logoutจริง | ดูผลแยกด้านล่าง |
| S05 Backup/restore | persistence: disk reopen/checksum/nonempty reject; native-restore: PG source/target schemasแยก รวมSite/Job/assignment/bindings/audit ไม่คืนsessions/nonces | Provider DB restart, daily backup trigger, restoreฐานใหม่ว่างและlogin; counts/IDs/checksum/revocationตรง; ทดสอบPITRแยกจากlogical export; วัดRPO/RTO | ดูผลแยกด้านล่าง |
| S06 Cross Project | foundation:TECH2/PMไม่เห็นscopeอื่น, Siteต่างcustomer/Jobต่างProjectปฏิเสธ,ถอน assignmentตรวจก่อนส่ง | ใช้T1รับAไม่รับB, directURL/API/LINEต้องไม่เห็นB; กลุ่มไม่grantสิทธิ์; ถอนAและเพิ่มBใหม่; บัญชีสมมติTECH-unassignedปฏิเสธ | ดูผลแยกด้านล่าง |
| S07 Infrastructure | ไม่มี provider proof จาก unit test | API/DB private, DB TLSตรวจpg_stat_ssl, runtime roleไม่ใช่superuser, backupนอกproviderเข้ารหัส,ไม่มีsecretในweb bundle/log/CI; workerstop/DEAD handling | ดูผลแยกด้านล่าง |

คำสั่ง local/CI: `pnpm typecheck`, `pnpm test`, `pnpm build`; CI รันซ้ำโดย TEST_DATABASE_URL ชี้ PostgreSQL17 service ที่ทิ้งได้เท่านั้น `tests/native-restore.test.ts` สร้าง/ลบเฉพาะ schemaสุ่มของตัวเอง ไม่รับ DATABASE_URL แทน ห้ามชี้ TEST_DATABASE_URL ไปฐาน Staging/Production

อายุ Channel Access Token ไม่ใช่กติกา nonce10นาที: ขึ้นกับชนิด token ที่ LINE ออก ตรวจ/rotateตามชนิดใน console ขณะ tokenเสีย/หมดอายุ worker ต้องไม่ log token ไม่ fallbackส่งบุคคลอื่น ให้แก้secretและให้ผู้ใช้เริ่มคำขอใหม่ reply token ที่เก่าห้าม replayเอง

เก็บหลักฐานแต่ละรอบ: ID / releaseSHA / เวลาAsia/Bangkok / ผู้ตรวจ / PASS-FAIL-NOT_RUN / actualstatusหรือcount / referenceหลักฐานprivateที่ปิดข้อมูล / blockerและretest วันที่ ห้ามแนบHAR/cookie/connectionstring/rawwebhookในGit

## ผล Staging แยกส่วน ณ24กันยายน2026

S01 PARTIAL: HTTPShealthและSecure/HttpOnly/SameSite cookie/CSRFผ่านlivefixture; HTTPredirect/mixedcontent/edge-querylogครบวงจรยังไม่ยืนยัน
S02 NOT_RUN live: local/CI429/forwarded spoofผ่าน ไม่ยิงloadบริการที่มีผู้ใช้จริงโดยไม่กำหนดรอบ
S03 NOT_RUN live: LINEปิด; signedrawbytes/destination/replayผ่านCI
S04 PARTIAL: logout/forced expiryของsyntheticsessionผ่านHTTPS; realLINEtoken/codeยังไม่ทดสอบ
S05 PARTIAL: manualencryptedbackup/isolatedrestore/digest/restartผ่าน; scheduledbackup/PITR/restoreWebLoginยังไม่ทำ
S06 PARTIAL: Web/APIcrossproject/joblevel/revokeผ่านfixtures; LINEscopeยังไม่ทดสอบ
S07 PARTIAL: runtime/TLS/privateAPI/backupนอกprovider/logsampleผ่าน; workerยังไม่deploy/stopdrillยังไม่ทำ

อ้าง M1_ALIGNMENT_STAGING_EVIDENCE.md และ M1_TEST_EVIDENCE.md ไม่ให้ผลPASSของบางส่วนแทนทั้งแถว
