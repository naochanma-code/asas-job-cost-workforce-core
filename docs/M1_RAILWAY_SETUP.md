# Railway Trial — ขั้นตอนเปิด Staging

2026-09-22 · Owner โอ๋ / ผู้ดำเนินการ Codex · D-017

อนุญาตเฉพาะ Trial credits ไม่กรอกบัตร ไม่สมัคร Hobby ไม่เพิ่มขนาดเอง หากเครดิต/ข้อจำกัดไม่พอ แจ้ง Owner ก่อน ยังไม่ Merge PR #2, Production หรือ M2

## ล่าสุด — Phase A ก่อนเปิด Web/API

สร้าง runtime/migrator roles บน PostgreSQL แล้วและตรวจสิทธิ์ผ่าน โดย migrator ยัง NOLOGIN; Owner ตั้งรหัส runtime สำเร็จและเปิด runtime LOGIN แล้ว. รอ Owner ใส่รหัสเดิมในช่อง PGPASSWORD ของ API โดยไม่ส่งในแชท. Public CA ถูกเพิ่มใน API Variables เป็น staged change ยังไม่ deploy. API guard บังคับ verified TLS และสิทธิ์จำกัดก่อนเปิด HTTP ดู [ขั้นตอนฐานข้อมูล](M1_DATABASE_SECURITY.md). LINE คงปิดแม้ A–E ผ่านตามคำสั่งล่าสุด; ขั้นตอน LINE ด้านล่างใช้ได้เมื่อ Owner อนุมัติรอบใหม่เท่านั้น.

## อัปเดตหลัง Owner กรอกตัวแปร

Bootstrap deployment 13df75fd-935d-4f60-b3c0-c82f67a3b96b จาก f12f66c จบ Completed มีข้อความ Owner created; password not logged. ไม่เปิดดูค่า secret. Owner ยืนยันถอน BOOTSTRAP_USERNAME/BOOTSTRAP_PASSWORD และยืนยัน DATABASE_URL ในapiเฉพาะรายการหลังapproval reviewปฏิเสธแล้ว ลบและapplyสำเร็จใน e49929ec Completed; APIไม่มี3ตัวแปรนี้แล้ว ปิดAuto deploy ใช้คำสั่งจบทันทีไม่เปิดHTTP ไม่ต่อDB. บัญชีและpassword hashในDBคงอยู่. ยังไม่มีWeb/HTTPS/LINEจริง/UAT

## ประวัติก่อนส่งต่อ Owner

GitHub เชื่อมแล้วและจำกัด1repo; PostgreSQL18/volume Online. APIยังOfflineหลังfirst buildจากmain/M0ล้มเหลวก่อนruntime. มี9 staged changes แก้branch M1/Dockerfile และเตรียม pnpm bootstrap แบบNever restart รอ Ownerตั้งBOOTSTRAP_USERNAME/BOOTSTRAP_PASSWORDผ่านVariables. DATABASE_URLอ้างcredentialผู้ดูแลชั่วคราวสำหรับbootstrapเท่านั้น ก่อนเปิดHTTPต้องเปลี่ยนruntime roleและลบbootstrap secret. Web/workerยังไม่สร้าง. CI0d68bbaผ่านทั้งDocker buildและsmoke. รายละเอียดสถานะจริงในM1_TEST_EVIDENCE

## สิ่งที่สร้างก่อนหน้า

[Project asas-m1-staging](https://railway.com/project/66cbe8a4-60eb-4188-a918-7a6b5759afdf?environmentId=bead0ee5-d1e2-4430-8060-39aef4306b5b) มี environment staging; ตอนเริ่มเป็นพื้นที่เปล่า ปัจจุบันมีPostgresตามอัปเดตด้านบน ไม่มีข้อมูลผู้ทดลอง Dashboard แสดง Limited Trial $5/สูงสุด30วัน ไม่ใช่ Full Trial

[เอกสาร Trial](https://docs.railway.com/pricing/free-trial) ระบุ Limited Trial จำกัด outbound network/ports ต้องพิสูจน์ก่อน LINE; การเชื่อม GitHub อาจช่วยตรวจ eligibility แต่ไม่รับประกัน Full Trial ไม่มีการซื้อเพื่อเลี่ยงข้อจำกัด Trial volume อาจถูกลบ30วันหลังเครดิตหมด จึงต้อง export สำรองนอก provider ก่อนหมดอายุ ไม่ถือ Free plan ที่ตามมาว่าเพียงพอใช้งานจริง

## โอ๋ทำก่อน — ให้สิทธิ์เฉพาะ Repository นี้

1. ใน project เลือก GitHub Repository → Configure GitHub App ระบบตรวจอนุมัติอัตโนมัติหยุด Codex ตรงนี้เพราะเป็นการเพิ่มสิทธิ์ GitHub
2. ตรวจว่าเป็น Railway app บน GitHub เลือกบัญชีเจ้าของ repo และ **Only select repositories** แล้วเลือก **asas-job-cost-workforce-core** เท่านั้น อ่านสิทธิ์ที่หน้าติดตั้งแสดงก่อนยืนยัน ไม่เลือก All repositories
3. Owner ยืนยันติดตั้งเอง หรืออนุมัติให้ Codex ไปถึงหน้าตรวจสิทธิ์แล้วกลับมารายงานสิทธิ์จริงก่อนยืนยัน ถ้าหน้าร้องขอเกิน repository นี้ให้หยุด
4. กลับ Railway แล้ว Refresh แจ้งเพียงว่าเชื่อมแล้ว ไม่ส่งรหัสผ่าน/OTP/token ในแชท

การให้สิทธิ์นี้ทำให้ Railway อ่าน source และรับการเปลี่ยนแปลงของ repo เพื่อ build ไม่เปลี่ยน PR #2 เป็น merged ต้องเลือก branch ที่ถูกต้องก่อน deploy

## Codex ดำเนินการต่อเมื่อเข้าถึง Repo และ CI ผ่าน

1. ใช้ source branch `codex/milestone-1-foundation` และ commit ที่ CI ผ่าน ปิด automatic deploy/PR environments ก่อนเชื่อม source ถ้า UI เชื่อมแล้ว deploy ทันทีให้ใช้ Empty Service ตั้งค่าก่อน ไม่ deploy main หรือ root working tree ที่มี M2
2. สร้าง PostgreSQL ใหม่บน private network/volume ทดสอบ TLS และสิทธิ์ ห้ามชี้ local DB หรือใช้ seed-local บน staging
3. ใช้ operator job จาก API image รัน `pnpm migrate` และ `pnpm bootstrap` ด้วย migration credential; Owner กรอก BOOTSTRAP_USERNAME/BOOTSTRAP_PASSWORD ใน Variables เอง ลบตัวแปร bootstrap และ credential ผู้ดูแลออกจาก runtime หลังใช้
4. เตรียม runtime role ให้เข้าถึงตาราง/sequence ที่จำเป็นและ SELECT schema_migrations โดยไม่มี CREATE/ALTER/superuser ทดสอบสิทธิ์จริงก่อนเปิดให้ผู้ทดลอง API เริ่มแล้วตรวจ migration names/checksums เท่านั้น; ฐานว่างหรือมี migration M2 ต้องเปิดไม่ได้
5. ตั้งบริการตามตาราง แล้ว deploy API ก่อน Web; Web เท่านั้นมี public HTTPS API/DB ไม่เปิด public port การสร้าง HTTPS endpoint ยังต้องตรวจค่า cookie/proxy/logging จริง
6. ซ้อม backup ลง encrypted storage นอก provider และ restore ฐานใหม่ ตรวจสิทธิ์หลัง restart/restore ก่อนใส่ข้อมูลผู้ทดลอง
7. Owner login สร้างบัญชีฟ้า/T1 แล้วทำ fixture Project A ไม่มี Site/Job และ B มี Site/Job ตาม UAT
8. เปิด worker/LINE เฉพาะหลังปิด network/logging/allowlist/cleanup gates และ Owner ใส่ secrets ผ่าน Variables ไม่เก็บ secret ใน Git/Chat

| Service | Build | Variables ไม่มีค่าลับในเอกสาร |
| --- | --- | --- |
| API | `RAILWAY_DOCKERFILE_PATH=deploy/Dockerfile.api` | `NODE_ENV=production`, `HOST=::`, `PORT=3001`, `WEB_ORIGIN` เป็น HTTPS Web จริง, `DATABASE_URL` ของ runtime role แบบไม่มีรหัส, `PGPASSWORD` ช่องลับที่ Owner กรอก, `DATABASE_SSL_CA` ใบรับรองสาธารณะ, `LINE_ENABLED=false` |
| Web | `RAILWAY_DOCKERFILE_PATH=deploy/Dockerfile.web` | `PORT=3000`, build arg `API_URL` เป็น private API hostname/port ที่ Railway แสดง ต้องตั้งก่อน build เพราะ Next compile rewrites |
| LINE worker (ยังไม่สร้าง) | API image/start `pnpm worker` | DB runtime credential, HTTPS origin, secret/key/allowlists ตาม M1_LINE_PILOT_CHECKLIST |

Dockerfiles ใช้ Node24/pnpm11.19.0, ทำงานด้วย user node, ไม่นำ .env/.local/backups เข้า build context. Docker image ไม่ได้ตั้ง DB role/backup ให้เอง CI build และ smoke เป็นเพียง gate ก่อน deploy

## ค่าใช้จ่ายและการหยุด

ตรวจเครดิตคงเหลือ/การใช้ RAM/volume ใน Dashboard ก่อนเพิ่ม service และหลังทดสอบแต่ละครั้ง จำกัด initial services เป็น Web/API/DB; ไม่สร้าง worker ก่อนใช้จริง ไม่รับประกันว่า $5 พอครบ pilot ไม่มี monitoring อัตโนมัติในรอบนี้ ไม่สัญญาว่าจะเตือนเมื่อ task ไม่ทำงาน

หากระบบแนะนำ Upgrade, เครดิตใกล้หมด หรือจำเป็นต้องเพิ่มขนาด ให้หยุดขั้นตอนนั้นและแจ้งเหตุผล/ราคาก่อน Owner ตัดสินใจ ทำ backup ก่อน Trial หมด หยุด worker/LINE/compute ตาม runbook โดยไม่ลบ volume หรือข้อมูลถาวรเอง การย้าย provider ใช้ source commit เดิม + PostgreSQL export/restore + secrets ใหม่ แล้วทดสอบก่อนเปลี่ยน URL

## Gate ที่ยังไม่ผ่าน

GitHub access และ CI ของ c4cb5df ผ่านแล้ว. DB role restrictions และ TLS จาก Postgres console ผ่านบางส่วนของ Phase A; ยังต้อง credential/runtime API TLS และตรวจ log. HTTPS/Secure Cookie, proxy rate limit, Web/UAT และ Railway backup/restore ยัง NOT_RUN. LINE ปิด. ตรวจ commit/CI ล่าสุดใน M1_TEST_EVIDENCE ก่อนทุก deployment.
