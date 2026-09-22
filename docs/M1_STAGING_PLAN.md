# Milestone 1 — แผนเปิดระบบทดลองออนไลน์

วันที่ตรวจ 2026-09-22 · ผู้รับผิดชอบเทคนิค Codex · ผู้ตัดสินใจ Owner โอ๋

สถานะ TRIAL_AUTHORIZED / NOT_DEPLOYED: Owner เลือก Railway Trial แล้วตาม D-017 ใช้เครดิตทดลองเท่านั้น ห้ามอัปเกรดหรือเพิ่มค่าใช้จ่ายเอง ดู [คู่มือ Railway](M1_RAILWAY_SETUP.md) ยังไม่ส่ง LINE จริงและไม่ Merge PR #2

ตารางและคำแนะนำ Render ด้านล่างเป็นข้อเสนอเดิมก่อน Owner เลือก Railway ไม่ใช่งบที่อนุมัติ

Staging หมายถึงระบบทดลองออนไลน์แยกจากงานจริง ผู้ทดลองใช้ผ่านลิงก์ HTTPS ได้แม้เครื่องของโอ๋ปิดอยู่ รอบนี้ทดลองเฉพาะเข้าสู่ระบบ โครงการ ทีม และ LINE “งานของฉัน” ไม่รวมวันทำงาน OT ค่าใช้จ่ายหรือ Payroll งาน M2 ที่ค้างในเครื่องถูกพักและไม่รวมใน PR นี้

## เลือก Hosting เพียง 2 ทาง

ราคา USD ตรวจจากหน้าเจ้าของบริการวันที่ 22 กันยายน 2026 ต้องตรวจยอดหน้า checkout อีกครั้งก่อนอนุมัติ ตัวเลขเงินบาทใช้อัตราสมมติเพื่อวางงบ 35 บาท/USD ไม่ใช่อัตราแลกเปลี่ยนปัจจุบัน ไม่รวมภาษี ค่าบัตร โดเมนใหม่ และค่าใช้งานเกินแผน

| เรื่อง | Railway Trial → Hobby | Render แบบจ่ายรายเดือน — แนะนำสำหรับ Real Pilot |
| --- | --- | --- |
| ค่าเริ่มต้น | Trial ให้เครดิตครั้งเดียว $5; ต้องตรวจ eligibility/วันหมดอายุ/ข้อจำกัด network ในบัญชี ไม่ใช่ฟรีถาวร | Web $7 + private API $7 + worker $7 + PostgreSQL $6 = compute ตั้งต้น $27/เดือน เพิ่ม disk/traffic/backup และ workspace หากเลือกแผนเสียเงิน |
| งบประมาณทั้งชุด | ประเมิน $15–30/เดือน (525–1,050 บาท) สำหรับ 3 Node processes + DB ขนาดเล็ก ขึ้นกับ RAM/CPU จริง ไม่ใช่ราคาเหมา $5 | เผื่องบ $30–40/เดือน (1,050–1,400 บาท) รวมพื้นที่และการสร้าง DB กู้คืนชั่วคราว หาก RAM ไม่พอต้องขอเพิ่มงบก่อนขยาย |
| คิดเงิน | Hobby ขั้นต่ำ $5 รวม usage credit $5; จ่ายส่วนใช้เกิน ไม่บวก $5 ซ้ำกับยอด usage ที่ครอบคลุมแล้ว | ขนาด compute กำหนดล่วงหน้า คุมงบง่ายกว่า แต่มีหลาย service และค่าเพิ่มเติม |
| HTTPS | public domain + TLS ของ provider; API/DB อยู่ private network | onrender.com + TLS อัตโนมัติ และ HTTP redirect; private API/DB |
| PostgreSQL | PostgreSQL service บน persistent volume ต้องดูแล backup/versions และ recovery ให้ครบ | Managed PostgreSQL; paid DB มี PITR ตาม workspace plan |
| Secret | Service Variables / sealed variables เฉพาะ backend/worker | Environment variables / secret files / environment group เฉพาะบริการที่จำเป็น |
| Backup/Restore | logical export แยกผู้ให้บริการทุกวัน; volume backup มีเงื่อนไขตามแผน ต้องยืนยันสิทธิ์ใน dashboard ก่อนนับเป็นความคุ้มครอง ไม่สมมติ Hobby มีครบ | Paid DB มี PITR: Hobby workspace ย้อน 3 วัน, Pro ขึ้นไป 7 วัน; logical exports เก็บ 7 วัน เสริม off-provider copy และซ้อมกู้จริง |
| ข้อดี | เริ่มด้วยเครดิตได้ ใช้ UI เดียว วัดต้นทุนจริงก่อนจ่ายยาว | ค่า compute เห็นชัด จัดการ DB/backup ง่ายกว่า เหมาะกับผู้ใช้ที่ไม่ดูแล server เอง |
| ข้อจำกัด | เครดิตอาจหมดเร็ว; hard usage limit ทำระบบหยุด; งาน backup เพิ่มและ trial network อาจใช้ LINE ไม่ได้ | แพงกว่า trial; 512 MB/process และ DB 256 MB เป็นขนาดเริ่มต้นต้องวัดจริง; Free service หลับหลังไม่มี traffic 15 นาทีและ Free DB หมดอายุ 30 วัน จึงไม่ใช้ Free สำหรับ pilot นี้ |
| หยุด/ย้าย | ปิด LINE/worker, export+restore ทดสอบปลายทางก่อน ยกเลิก compute/plan ตาม dashboard; volume/bucket อาจยังมีค่าเก็บ อย่าถือว่าปิด process = หยุดบิลทั้งหมด | suspend/stop ตามชนิด service, export ก่อนยกเลิกฐาน; storage/DB อาจยังคิดเงิน ต้องตรวจ billing สุดท้าย ย้ายด้วย pg_dump/pg_restore หรือ logical tool ของแอป |

แนะนำ **Render paid ขนาดเล็ก** สำหรับรอบที่คนจริงทดสอบ LINE เพราะมี managed DB และวิธีกู้คืนชัดเจน ลดงานดูแลของโอ๋ หากต้องการจ่ายศูนย์ก่อน ให้เลือก Railway Trial เฉพาะ technical rehearsal และหยุดเมื่อเครดิตหมด ไม่อัปเกรดอัตโนมัติ ไม่ใช้ trial แทน backup ที่ยังไม่พิสูจน์

ข้อเสนอขออนุมัติ: Render staging 1 เดือน เพดานงบ $40 ก่อนภาษี (ประมาณ 1,400 บาทตามอัตราสมมติ) รวมการสร้าง restore DB ชั่วคราวและพื้นที่เล็กน้อย ตั้งเตือนที่ $30; การเตือนไม่ใช่ hard cap Codex ตรวจยอดรายวันระหว่าง pilot และขออนุมัติก่อนเพิ่มขนาด/บริการ ไม่ต้องย้ายเว็บ Wix หรือซื้อโดเมน ใช้ subdomain ฟรีของ provider ก่อน

## โอ๋ทำอะไรบ้าง — ไม่ต้องเขียนโปรแกรม

1. เลือก provider กับงบและช่วงเวลาทดลอง ยังไม่ต้องสมัครหรือกรอกบัตรก่อนอนุมัติแผน
2. เมื่ออนุมัติแล้ว โอ๋เป็นเจ้าของบัญชี Hosting/ผู้ชำระเงิน เปิด MFA และเก็บ recovery code ในที่ส่วนตัว Codex ช่วยตั้งค่าทางเทคนิค ไม่ใช้บัญชีส่วนตัวนักพัฒนาเป็นเจ้าของระบบ
3. เตรียม OA และกลุ่มทดสอบที่มีอยู่ เชิญเฉพาะโอ๋ ฟ้า และช่างที่ตกลงทดลอง ไม่ใช้กลุ่มลูกค้า
4. โอ๋กรอก secret ในหน้า Environment/Variables ของ provider เอง ตามตารางด้านล่าง ไม่ส่งค่าในแชท GitHub รูปหน้าจอ หรือเอกสาร
5. รับลิงก์ Staging และบัญชีเฉพาะของแต่ละคนผ่านวิธีส่งรหัสที่บริษัทอนุมัติ แล้วทดลองตาม [M1_OWNER_UAT](M1_OWNER_UAT.md) Codex ช่วยตรวจหลังบ้าน
6. บันทึก PASS/FAIL/ข้อสังเกต ถ้ายังไม่ผ่านให้แก้ใน M1 ไม่ถือว่าอนุญาต Merge/M2 จากการอนุมัติค่า Hosting

## Codex ทำหลังอนุมัติ Staging เท่านั้น

1. ตรวจ head ของ PR #2, CI และ main อีกครั้ง ระบุ commit SHA ที่นำขึ้นจริง ปิด auto-deploy จาก push ใช้ manual deployment ของ commit ที่ตรวจแล้ว PR ยังคง Draft
2. สร้าง environment ชื่อ `asas-m1-staging` ใน region เดียวกัน ประกอบด้วย Web (public), API (private), worker (private ไม่มี public port), PostgreSQL 17+ (private) ไม่ใช้ PGlite หรือฐาน local ที่มี migration M2
3. ใช้ root repository, Node 24, pnpm 11.19.0, install แบบ frozen lockfile; ไม่ตัด devDependencies ก่อน run เพราะคำสั่ง tsx ปัจจุบันอยู่ใน devDependencies
4. Build Web ด้วย `pnpm build` โดยตั้ง API_URL เป็น internal API origin ก่อน build เนื่องจาก Next rewrites ถูกสร้างตอน build Start ด้วย `pnpm exec next start apps/web --hostname 0.0.0.0 --port $PORT` บน Linux ของ provider
5. API start `pnpm exec tsx apps/api/src/main.ts`, HOST=0.0.0.0, PORT ของ provider; Web ใช้ internal host/port นี้ ไม่เปิด API ต่อ internet ตั้ง health `/api/health` ผ่าน Web และ API
6. Migrate/Bootstrap ผ่านงาน operator ครั้งเดียวด้วย DB migration role แล้วลบ BOOTSTRAP_PASSWORD จาก environment ตั้งชื่อบัญชี staging ใหม่ ไม่ใช้ demo passwords จาก local
7. ตั้ง DB role runtime แยก migration role: D-017 แยก production-mode runtime ให้ตรวจ schema โดยไม่ migrate แล้วและผ่าน CI; ยังต้อง provision/test least-privilege role บน Railway จริง ห้ามแก้โดยให้ app เป็น DB superuser แล้วเรียกว่าปลอดภัย
8. Web ไม่มี DATABASE_URL/LINE secret; API มี DB + signature secret + payload key; worker มี DB + access token + payload key; ใช้ NODE_ENV=production ใน staging เพื่อเปิด HTTPS/DB guard ไม่ได้หมายถึง deploy production
9. เปิด Web ก่อนโดย LINE_ENABLED=false ตรวจข้อทดสอบ HTTPS/cookie/สิทธิ์ สำรองและกู้คืนก่อนให้คนเริ่มใช้งาน จากนั้นได้รับอนุมัติวันและขอบเขต LINE pilot จึงตั้ง LINE_ENABLED=true เปิด worker ด้วย `pnpm worker`
10. ตรวจ monitoring: health ทุก 1 นาที, DEAD/retry backlog ระหว่างทดลอง, RAM/CPU/DB disk และค่าใช้จ่าย แจ้งโอ๋เมื่อมีเหตุ ไม่บันทึก URL query/body/secret ใน access log รวมของ provider

## กรอกค่า Environment อย่างปลอดภัย

Railway: เปิด project → service → Variables; Render: service → Environment → Add Environment Variable/Secret File กรอกค่าใน value แล้ว save ตามคู่มือ provider การ save/redeploy ต้องเกิดหลังอนุมัติเท่านั้น ห้ามใช้ชื่อตัวแปร `NEXT_PUBLIC_` สำหรับค่าลับ

| ชื่อ | ใคร/บริการที่ใช้ | วิธีได้ค่า |
| --- | --- | --- |
| DATABASE_URL | API, worker, operator | connection ของ PostgreSQL ใหม่ กรอกผ่าน Secret Manager; ไม่วางใน command line/history |
| WEB_ORIGIN | API, worker | HTTPS URL ของ Web แบบไม่มี path/trailing slash |
| API_URL | Web build/runtime | private API URL ไม่มี credential ต้อง rebuild หากเปลี่ยน |
| NODE_ENV / HOST / PORT | ตามขั้นตอนข้างบน | production / 0.0.0.0 / port ของ provider |
| BOOTSTRAP_USERNAME / BOOTSTRAP_PASSWORD | operator เท่านั้น | username ใหม่ รหัสสุ่มอย่างน้อย 12 ตัว ลบหลัง bootstrap |
| LINE_CHANNEL_SECRET | API เท่านั้น | LINE Developers → Messaging API channel → Basic settings → Channel secret; โอ๋คัดลอกตรงเข้า secret field |
| LINE_CHANNEL_ACCESS_TOKEN | worker เท่านั้น | Messaging API tab → Channel access token; โอ๋ออก token ของ OA ทดสอบและกรอกตรง |
| LINE_BOT_ID | API | bot user ID จาก LINE bot info ไม่ใช่ @basicId/Channel ID; operatorตรวจใน private session |
| LINE_PAYLOAD_KEY | API+worker ค่าเดียวกัน | random 32 bytes base64 สร้างใน private operator session บันทึกที่ secret manager ไม่แสดง log |
| LINE_TEST_USER_IDS / LINE_TEST_GROUP_IDS | API+worker | IDs ของผู้ทดลองและกลุ่มที่ยืนยันแล้วเท่านั้น เก็บเป็น environment ไม่ commit |
| LINE_ENABLED | API+worker | false จน Web/restore ผ่านและอนุมัติ live pilot; เปิด true พร้อมกันเมื่อถึงรอบทดลอง |

DB TLS: ตรวจ certificate/hostname ตาม provider ใช้ CA ที่เชื่อถือได้และทดสอบ `pg_stat_ssl` ของ connection จริง ห้ามใช้ `NODE_TLS_REJECT_UNAUTHORIZED=0` หรือปิด certificate verification ให้เชื่อมสำเร็จเฉยๆ Internal private network ไม่ใช่หลักฐานว่า TLS เปิดแล้ว หาก provider configuration ไม่รองรับต้องบันทึก blocker ก่อน pilot

## Backup, Restart, Restore และการย้าย

ข้อเสนอสำหรับ Foundation pilot: backup ทุกวันและก่อนเปลี่ยน release เก็บ encrypted private copy 7 วัน แยกจาก provider โดย Owner/operator เท่านั้น; เป้าหมาย RPO ≤24 ชั่วโมง และ RTO ≤2 ชั่วโมง เป็นเป้าหมายที่ต้องวัด ไม่ใช่ SLA ที่พิสูจน์แล้ว นโยบายนี้ไม่ใช่นโยบายเก็บบิล 2 ปี

ซ้อมบนฐาน restore ใหม่ที่ว่าง ห้าม restore ทับ staging หลัก: บันทึก counts/IDs ของ Customer, A/B, Site, Job, Assignment, audit และ LINE bindings → `pnpm backup backup <private-path>` → ใช้ secret DATABASE_URL ของฐานกู้คืน → migrate → `pnpm backup restore <private-path>` → restart → login ใหม่ ตรวจ counts/สิทธิ์/ถอน assignment และ mapping เดิมตาม UAT เก็บเพียง checksum/เวลา/ผลตรวจใน Git ไม่เก็บไฟล์ backup

logical backup ของแอป **ไม่เข้ารหัสไฟล์เอง** ต้องเก็บบน encrypted storage และไม่แชร์ไฟล์ มี password hashes/LINE identifiers จึงห้ามแนบ GitHub sessions/nonces/codes/inbox/outbox ไม่อยู่ใน logical backup ต้อง login และเริ่มคำขอใหม่ ไม่มีการส่งข้อความเก่า

Provider PITR/pg_dump เป็น full DB อาจนำ session/nonce/outbox เก่ากลับมา: ปิด LINE และ worker ตลอด restore drill กู้ลง isolated DB แล้วล้าง transient sessions/nonces/codes/inbox/outbox ผ่านคำสั่ง operator ที่ตรวจ target แล้วก่อนเปิด worker ห้ามถือว่ามีพฤติกรรมเหมือน logical restore อัตโนมัติ ตรวจ audit/checksum และสรุป lost-data window ก่อนอนุมัติ cutover

หยุดบริการ: ตั้ง LINE_ENABLED=false, หยุด worker, ปิด webhook OA, หยุดรับข้อมูล, ทำ backup สุดท้ายและทดสอบเปิดได้ แล้ว suspend compute ตาม provider อย่าลบ DB/volume ก่อน Owner ยืนยันเก็บหลักฐานครบ การยกเลิก plan กับการลบ storage เป็นคนละขั้น ตรวจบิลค้างและ retention ก่อนตัดสินใจ

ย้ายระบบ: export PostgreSQL แบบมาตรฐาน → restore ฐานใหม่ที่ว่าง → ย้าย source commit เดิม/ตั้ง secrets ใหม่ → ทดสอบ UAT → เปลี่ยน HTTPS webhook/URL → ปิดระบบเก่า ไม่มี provider-specific business schema ต้องกำหนดช่วงหยุดรับข้อมูลเพื่อไม่ให้สองระบบเขียนพร้อมกัน

## ผลตรวจและสิ่งที่ต้องปิดก่อน Real Pilot

- PR #2 head เริ่มตรวจ 5328b42; main 0d5da8a; behind 0 / ahead 2; GitHub draft=true, merged=false, mergeable=true; CI run 35610665915 SUCCESS เป็นหลักฐานก่อนเพิ่ม tests รอบนี้
- Rate limit ปัจจุบัน trustProxy=false: ป้องกันปลอม X-Forwarded-For ได้ แต่หลัง Next proxy ผู้ใช้หลายคนอาจใช้ bucket เดียวกัน (login 10/min, API 120/min) ต้องทดสอบ 3 ผู้ใช้จริงผ่าน edge; หากชนให้แก้ trusted proxy ตาม topology ที่ตรวจแล้ว ไม่ตั้ง trustProxy=true แบบเหมา
- ต้องปิดช่องว่าง runtime DB role/migration, TLS, edge logging ของ linkToken query, แผน backup scheduler และ DEAD payload cleanup ก่อนเปิด pilot ไม่รายงานว่า deploy-ready จาก CI อย่างเดียว
- ไม่มี automated cleanup ของ DEAD payload: operator ต้องกำหนด retention สำหรับข้อมูลทดลองและขั้นตอน purge ที่ไม่ลบ event dedupe IDs; รออนุมัติแนวทางและทดสอบก่อนรับข้อมูลจริง
- ไม่มี reset password/MFA ในแอป/group rebind UI; pilot ใช้บัญชีเฉพาะ ขอบเขตเล็ก ข้อมูลโครงการสมมติ ปัญหาบัญชีให้ Owner/operator แก้ตาม audit
- ยังไม่รัน Staging, real LINE, restart บน provider, provider restore หรือ Owner UAT ทั้งหมด NOT_RUN

## แหล่งตรวจ (official, 2026-09-22)

- [Railway ราคา](https://railway.com/pricing), [Trial](https://docs.railway.com/pricing/free-trial), [การคิดเงิน](https://docs.railway.com/pricing/understanding-your-bill), [Cost control](https://docs.railway.com/pricing/cost-control), [Backups](https://docs.railway.com/volumes/backups)
- [Render ราคา](https://render.com/pricing), [Free limitations](https://render.com/docs/free), [TLS](https://render.com/docs/tls), [Secret variables](https://render.com/docs/configure-environment-variables), [PITR/backup](https://render.com/docs/postgresql-backups)
- [LINE account linking](https://developers.line.biz/en/docs/messaging-api/linking-accounts/), [signature](https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/)

- [Railway HTTPS](https://docs.railway.com/networking/public-networking), [Railway sealed variables](https://docs.railway.com/variables)
