# ASAS Job Cost & Workforce Core — Master Prompt v2.5

วันที่จัดทำ: 21 กันยายน 2026  
เจ้าของผลิตภัณฑ์: โอ๋ / ASAS IT Co., Ltd.  
ผู้พัฒนา: Codex และ Work ผ่าน Repository กลาง

สถานะเอกสาร: Canonical product specification — ใช้ฉบับนี้เป็นข้อกำหนดกลางเพียงฉบับเดียว

## 0. คำตอบ Owner รอบ 4 — 21 กันยายน 2026

ข้อกำหนด v2.5 ตาม [ADR-008](adr/008-admin-review-ot-retention.md): Admin ตรวจ แก้ไข และอนุมัติค่าใช้จ่ายรายรายการได้ รวมจำนวน รายละเอียด เงิน และรูป แต่ไม่เห็นยอดรวมต้นทุน/ยอดใช้ไปของโครงการ อัตราค่าแรงหรือ Payroll; PM ไม่เห็นเงินหรือรูปบิลของผู้อื่น ยกเว้นรายการที่ตนส่ง รองรับ Owner หลายบัญชีสำหรับหุ้นส่วน3คน มี audit แยกผู้ทำ ไม่บังคับอนุมัติร่วม3คน วัน/OT ที่ Admin อนุมัติผ่านทันที ไม่ส่ง Owner ตรวจเวลาอีก ระบบคำนวณเมื่อปิดเวลา Owner ตรวจเฉพาะยอดจ่าย OT ต้องเป็นจำนวนบวกเพิ่มทีละ0.5ชั่วโมง เช่น2.5 ไม่รับเศษนาที

OT ใช้วันที่เลือกและจำนวนชั่วโมง ลงย้อนหลังได้ แม้คาบเกี่ยววันที่ถัดไปก็ไม่แยกคิดเพิ่ม; ใช้ rate/calendar ของวันที่เลือกทั้งรายการ การลงหลังปิดข้อมูลยังใช้ late adjustment ทำสอง Project ในวันเดียวแบ่งครึ่งวันต่อ Project รวม1วัน/ค่ากิน120ตาม baseline Project ไม่มี Job เป็น flow ปกติ เพิ่ม Job ได้ภายหลัง

Owner ต้องการดูค่าใช้จ่ายรายเดือนและ ZIP ที่แตกเป็น folder ของรูปบิล/ใบเสร็จ/สลิปค่าใช้จ่ายทั้งเดือน ใช้ SMEMOVE แยก ไม่เชื่อม API ใน M0; Owner ยืนยันเก็บหลักฐาน2ปี; ใน M0 ปรับเอกสารเท่านั้น ไม่ลบไฟล์จริง

ตาม [ADR-009](adr/009-delegated-entry-and-expense-review.md): PM/Admin/Owner ลงวันทำงานและ OT แทนพนักงานใน Project ที่มีสิทธิ์ได้ โดยเก็บผู้กรอกแยกจากพนักงาน ทุกบทบาทส่งค่าใช้จ่ายได้ PM เห็นยอดและรูปเฉพาะรายการที่ตนส่ง LINE expense ทุกบทบาทต้องรอ Admin หรือ Owner กดอนุมัติแยกทุกครั้งก่อนเป็น Actual; Web คงขั้นรอตรวจเดิม ไม่มี auto-approve

## 1. คำสั่งหลัก

สร้างแอปใหม่ตั้งแต่ต้นสำหรับบริหารต้นทุนงานและคำนวณค่าจ้างของ ASAS IT โดยเริ่มจากขอบเขตเล็กที่นำไปทดลองใช้จริงได้ ระบบต้องเชื่อม Opportunity, Project, Job, Budget, วันทำงาน, OT, ค่าใช้จ่าย, หลักฐาน และ Payroll โดยมีแหล่งข้อมูลที่ตรวจสอบย้อนกลับได้ ช่างใช้งานผ่าน LINE เป็นหลัก ส่วน Owner, Admin และ PM ใช้เว็บ

ห้ามนำ source code หรือฐานข้อมูลของแอปเดิมมาเป็นฐานโดยอัตโนมัติ ใช้ requirement และบทเรียนเดิมเป็นข้อมูลอ้างอิงเท่านั้น สร้าง repository, database และ environment ใหม่ แยกจากระบบเดิมอย่างชัดเจน ระบบเดิมยังเป็นข้อมูลอ้างอิงระหว่าง pilot จนกว่าระบบใหม่จะผ่านการตรวจรับ

ผู้พัฒนาต้องทำหน้าที่พร้อมกันในมุม Business Analyst, Solution Architect, Database Architect, UX/UI Designer, Software Engineer, Integration Engineer และ QA/Test Engineer ต้องทักท้วง requirement ที่เสี่ยง ใช้จริงไม่ได้ ขัดกัน หรือทำให้ข้อมูลผิด ห้ามถือว่าความคิดของ Owner ถูกต้องเสมอ แต่ต้องอธิบายผลกระทบและเสนอทางเลือกที่แนะนำเป็นภาษาไทย

กติกาการสื่อสารกับ Owner:

- อธิบายเป็นภาษาไทยที่เข้าใจง่าย และอธิบายศัพท์ technical เมื่อจำเป็น
- ไม่ถามหลายคำถามพร้อมกัน; หากกำหนดค่าตั้งต้นที่ปลอดภัยได้ ให้เสนอ default พร้อมเหตุผลและเดินหน้าส่วนที่ไม่ติดคำตอบ
- เสนอทางเลือกไม่เกิน 2–3 ทางและระบุตัวเลือกที่แนะนำที่สุด
- ระบุ assumption ให้เห็นชัด ห้ามลด requirement สำคัญโดยไม่แจ้ง
- ห้ามรายงานว่า “เสร็จ” จากการมีหน้า เมนู หรือตาราง ต้องมี flow จริง, test evidence และสถานะ deployment/UAT แยกกัน

เป้าหมายของ Release แรกคือพิสูจน์ว่าเส้นทางนี้ใช้จริงได้ครบวงจร:

`Admin สร้าง Project → Owner ตั้ง Budget → เพิ่ม Site/Job เฉพาะเมื่อจำเป็น → มอบหมายช่าง → ช่างลงงาน/OT/ค่าใช้จ่ายผ่าน LINE → Admin ตรวจวัน/OT และค่าใช้จ่าย → ระบบลง Actual Cost ครั้งเดียว → Owner ดู Budget vs Actual → ปิดรอบและคำนวณ Payroll จากข้อมูลที่อนุมัติแล้ว`

## 2. ปัญหาที่ต้องแก้จากระบบเดิม

1. ขอบเขตใหญ่เกินไป ทำหลายโมดูลพร้อมกันจนเส้นทางหลักไม่จบจริง
2. หน้าจอและเมนูมากเกินความจำเป็น ผู้ใช้ไม่รู้ว่าต้องเริ่มตรงไหน
3. LINE webhook ตอบรับก่อนเก็บงานแบบถาวร ทำให้ข้อความหรือรูปสูญหายเมื่องาน background ถูกยุติ
4. การทำงานใน LINE group ไม่แยกผู้ส่ง กลุ่ม Job และ draft อย่างปลอดภัย
5. การอ่านบิลด้วย OCR/AI กลายเป็นเงื่อนไขบังคับ ทั้งที่ช่างพิมพ์ยอดเองได้เร็วและตรวจสอบง่ายกว่า
6. Automated test ผ่านแต่ไม่ได้พิสูจน์การใช้งานจริงบนมือถือ บัญชี LINE จริง และข้อมูล pilot
7. การเปลี่ยน source, migration, deployment และผล UAT ถูกรายงานปะปนกัน
8. ระบบพยายามทำบัญชี สต็อก เงินเดือน MA และ Renewal พร้อมกัน ทั้งที่ยังพิสูจน์ Job Cost ไม่สำเร็จ
9. ความรู้และสถานะงานกระจายอยู่ในแชท ทำให้ผู้พัฒนาหลายระบบเข้าใจไม่ตรงกัน
10. คำว่า coded, tested, deployed และพร้อมใช้งานจริงถูกใช้แทนกัน ทั้งที่เป็นคนละสถานะ

ทุก milestone ต้องตอบให้ได้ว่า “ผู้ใช้ทำงานจริงอะไรได้เพิ่ม” และต้องมีหลักฐานจาก flow ครบวงจร ไม่ใช้จำนวนหน้า เมนู หรือตารางเป็นตัวชี้วัดความสำเร็จ

### 2.1 Business background

ASAS IT เป็น IT System Integrator / Project Contractor ทำงาน Server, Storage, Network, Switch, Firewall, Wireless, CCTV, UPS, Computer, Notebook, IT Hardware, Software/License, Network Cabling, Solar, Installation, Configuration, Migration, Upgrade, Service, Support, POC และ Site Survey

ต้นทุนงานอาจประกอบด้วย Hardware, Material, Labour, OT, Meal Allowance, Fuel, Transportation, Accommodation, Subcontractor, Equipment และ Other Expense

ปัญหาธุรกิจปัจจุบันคือ Owner ต้องรวบรวม Excel เอง บิลอยู่กับช่าง ค่าใช้จ่ายเข้าไม่ครบ ไม่เห็นกำไรขาดทุนระหว่างงาน ไม่รู้ว่า Material หรือ Man-day เกินประมาณการ ข้อมูลวันทำงาน/OT กระจาย และต้องคำนวณค่าแรงสิ้นเดือนเอง

### 2.2 หลักการ Product และ UX ที่ห้ามลด

- ใช้งานง่าย ภาษาไทย Mobile Friendly และ Responsive
- หน้าแรกของแต่ละ role แสดงสิ่งที่ต้องจัดการ ไม่แสดงข้อมูลทุกอย่าง
- ลด field และจำนวนขั้นตอน ไม่ถามข้อมูลที่ระบบรู้อยู่แล้ว ใช้ default ที่แก้ไขได้
- ป้องกันข้อมูลผิดก่อนบันทึก และแสดงสรุปให้ยืนยันก่อนสร้างรายการสำคัญ
- ผู้ใช้เห็นเฉพาะข้อมูลตามหน้าที่และขอบเขตงาน
- ความสามารถขั้นสูงอยู่ใน `เพิ่มเติม` และไม่รบกวนงานประจำ
- เมนูที่ยังใช้งานจริงไม่ได้ต้องไม่แสดงเป็นเมนูปกติ

### 2.3 Job Type แบบตั้งค่าได้

สร้าง `Job Type` เป็น master data ห้าม hard-code ในหน้าจอหรือ business logic โดยมีค่าเริ่มต้น:

- Installation
- Service Support
- PM Visit
- Site Survey
- POC
- Office Work
- Other

Owner/Admin เพิ่ม แก้ชื่อ เรียงลำดับ และ disable ได้ ค่า code ที่ถูกใช้งานแล้วห้ามเปลี่ยนความหมายหรือลบย้อนหลัง Job ต้องเก็บ snapshot ชื่อที่ใช้ในรายงานเพื่อป้องกันประวัติเปลี่ยนตาม master data

### 2.4 Sales Opportunity และ Pre-Sales Cost

ระบบเป้าหมายต้องรองรับ flow:

`Opportunity → Site Survey → POC → Demo → BOM → Cost Estimate → Quotation → Won / Lost`

กิจกรรม Pre-Sales แต่ละรายการสร้างเป็น Job ภายใต้ Opportunity และเก็บ Man-day/ค่าใช้จ่ายได้ หาก Won ให้สร้าง Project ใหม่โดยมี `source_opportunity_id` และเก็บ Opportunity/Pre-Sales History เดิมไว้ ห้ามย้ายหรือเปลี่ยน Job เดิมให้เป็น Project Job เพราะจะทำให้ต้นทุนก่อนขายปะปนกับต้นทุนส่งมอบ สามารถคัดลอก Cost Estimate ที่อนุมัติเป็น Budget ฉบับร่างของ Project พร้อมเก็บที่มาได้

รายงานในอนาคตต้องตอบได้ว่า Opportunity หนึ่งใช้ Man-day และต้นทุนเท่าใด แยก Survey/POC/Proposal และวิเคราะห์ Conversion ได้ ความสามารถนี้อยู่ใน Target Architecture แต่เริ่มพัฒนาหลัง Core Job Cost และ Payroll ผ่าน pilot เพื่อไม่ให้เส้นทางหลักล่าช้า ทั้งนี้ schema และ ID ต้องรองรับตั้งแต่ต้นโดยไม่สร้างหน้าว่าง

## 3. ขอบเขต Release แรกที่ต้องมี

### 3.1 Web สำหรับ Owner / Admin / PM

- Login และกำหนดสิทธิ์ OWNER, ADMIN, PM, TECH
- Customer และ Site โดย Site เป็น optional; Project สร้างได้โดยไม่เลือก Site และเพิ่ม/เปลี่ยน Site ภายหลังได้โดยมีประวัติ
- Project เป็นหน่วยหลักสำหรับ Assignment, Budget, Time, OT, Expense และ Cost เสมอ
- Job เป็นงานย่อยแบบ optional; Project อาจไม่มี Job หรือมีหลาย Job ได้ ห้ามสร้าง Job ปลอมเพียงเพื่อให้ schema ทำงาน
- รหัสอ่านง่ายและไม่เปลี่ยนตามชื่อ เช่น `PRJ-2609-001`, `JOB-2609-001-01`
- มอบหมายช่างระดับ Project เป็น default และระบุ Job เพิ่มได้เมื่อมีงานย่อย
- ตั้ง Budget ระดับ Project และหมวดต้นทุนเป็น default; แยก Job ได้เมื่อ Project ใช้ Job จริง
- ตรวจและอนุมัติวันทำงาน, OT และค่าใช้จ่าย
- Dashboard Project/Job แสดง Budget, Actual, Variance และสัดส่วนที่ใช้ไป
- ดูประวัติการแก้ไขและผู้ทำรายการ
- เชื่อม LINE group กับ Project ด้วยรหัสใช้ครั้งเดียวที่หมดอายุ
- เปิด/ปิด Job และ Project โดยเก็บประวัติ
- ศูนย์หลักฐานบัญชี แยกเดือน ค้นหา ดาวน์โหลด และส่งออกชุดหลักฐานพร้อมทะเบียนรายการ
- รอบค่าจ้าง: ตรวจวันทำงาน/OT, คำนวณ, แก้รายการเพิ่ม/หักที่มีเหตุผล, อนุมัติ, lock และออกสรุปพนักงาน

### 3.2 LINE สำหรับผู้ใช้ทุกบทบาท

เมนูหลักมี 5 รายการเท่านั้น:

1. งานของฉัน
2. ลงวันทำงาน
3. ลง OT
4. ส่งค่าใช้จ่าย
5. ตรวจสถานะของฉัน

รองรับทั้ง private chat และ Project group ตามกติกาสิทธิ์ ผู้ใช้ต้องเชื่อม LINE กับบัญชีพนักงานก่อนทำรายการ ระบบต้องรองรับภาษาไทยและใช้ปุ่ม/ตัวเลือกเพื่อลดการพิมพ์

### 3.3 การส่งค่าใช้จ่ายแบบง่าย

ไม่ใช้ OCR, AI อ่านบิล หรือ slip verification เป็นเงื่อนไขของ Release แรก ผู้ใช้ทุกบทบาทเลือก Project แล้วพิมพ์ข้อความ เช่น:

```text
ค่าน้ำมัน 500 เติมรถไปหน้างาน
```

หรือ

```text
ซื้อของหน้างาน 1300 สาย LAN และอุปกรณ์เข้าหัว
```

ระบบต้องแยกอย่างน้อย:

- วันที่ค่าใช้จ่าย (ค่าเริ่มต้นคือวันที่ส่งตามเวลาไทย แก้ได้)
- Project
- Job (optional และไม่ถามเมื่อ Project ไม่มีงานย่อย)
- ประเภทรายจ่าย
- จำนวนเงิน
- รายละเอียด
- ผู้ส่ง
- รูปหลักฐาน 1–5 รูป

Bot ต้องสรุปข้อมูลกลับมาให้ผู้ส่งตรวจ:

```text
โครงการ: PRJ-2609-001 — ติดตั้งระบบ IHI
งานย่อย: ไม่ได้ระบุ
วันที่: 21/09/2026
ประเภท: ค่าน้ำมัน
ยอด: 500.00 บาท
รายละเอียด: เติมรถไปหน้างาน
หลักฐาน: 1 รูป
```

มีปุ่ม `ยืนยันส่งตรวจ`, `แก้ไข`, `ยกเลิก` หลังยืนยัน สถานะเป็น `รอตรวจ` และยังไม่เป็น Actual Cost จน Admin หรือ Owner อนุมัติ ผู้ตรวจแก้ประเภท วันที่ จำนวน/หน่วย ยอด รายละเอียด และรูปได้ โดยระบบเก็บค่าก่อนแก้ ผู้แก้ เวลา และเหตุผล

การอนุมัติค่าใช้จ่ายของ Admin/Owner ต้องสร้าง Cost Ledger เพียงครั้งเดียว การกดซ้ำ webhook ซ้ำ worker retry หรือเปิดหน้าซ้ำต้องไม่สร้างต้นทุนซ้ำ

### 3.4 LINE group ต่อ Project

- Bot หนึ่งตัวเข้าร่วมหลายกลุ่มได้
- Admin สร้างรหัสเชื่อมกลุ่มจากหน้า Project รหัสหมดอายุและใช้ได้ครั้งเดียว
- ผู้มีสิทธิ์ส่งคำสั่งเชื่อมในกลุ่ม ระบบบันทึก `group_id → project_id`
- หนึ่งกลุ่มมี Project ที่ active ได้หนึ่งรายการ; Project หนึ่งรายการอาจมีหลายกลุ่มได้เมื่อ Admin ตั้งใจเพิ่ม
- หาก Project ไม่มี Job ให้บันทึกระดับ Project โดยตรงและห้ามถาม Job
- หากมี Job แต่ไม่ได้บังคับใช้ ให้ซ่อนการเลือกไว้ใน `ระบุงานย่อย` และบันทึกระดับ Project เป็น default
- หาก Project ตั้งค่าให้ต้องระบุ Job และมีหนึ่ง Job ที่ active ให้เลือกอัตโนมัติ; หากมีหลาย Job จึงให้เลือกด้วย quick reply
- Draft ต้องผูกกับ `channel + group/private + sender + project + optional_job + flow_id` เสมอ ห้ามใช้ “รูปล่าสุดของกลุ่ม” หรือ draft ล่าสุดของกลุ่ม
- สมาชิกภายนอกในกลุ่มเห็นข้อความยืนยันระดับรายการได้ แต่ Bot ห้ามแสดง Budget, Actual รวม, Profit, Margin, ค่าแรง หรือข้อมูลส่วนบุคคลในกลุ่ม
- Bot รับคำสั่งธุรกิจจากพนักงานที่เชื่อมบัญชีและมีสิทธิ์ใน Project เท่านั้น

## 4. สิทธิ์

| บทบาท | ความสามารถ |
| --- | --- |
| OWNER | เห็นและจัดการทุก Opportunity/Project/Job, Budget, Actual, Profit/Margin, อัตราค่าจ้าง, Payroll, การตั้งค่า และ Audit; เป็นผู้อนุมัติ/lock รอบค่าจ้าง |
| ADMIN | จัดการ master data, Project/Job, ทีม และตรวจวัน/OT; ตรวจ แก้ไข อนุมัติจำนวน รายละเอียด เงิน และรูปค่าใช้จ่ายรายรายการได้ ไม่เห็น Budget, Actual/ยอดใช้ไปรวม, ค่าแรงหรือ Payroll |
| PM | เห็นและจัดการ Project/Job ที่ได้รับมอบหมาย ดูจำนวนคน วันและชั่วโมง OT; ตรวจเวลาเมื่อ Owner เปิด policy ไม่เห็นยอดรวมหรือบิลผู้อื่น; ลงค่าใช้จ่ายและเห็นเงิน/รูปของตนได้ |
| TECH | เห็น Project และ optional Job ที่ได้รับมอบหมาย ส่งและดูสถานะรายการของตน ไม่มีสิทธิ์ดู Budget/Actual รวม ค่าแรง หรือกำไร |

การซ่อนเมนูไม่ถือเป็นการป้องกันข้อมูล ทุก API, export, notification และ LINE response ต้องตรวจสิทธิ์ที่ server

สิทธิ์ข้อมูลเงินเดือนแยกเป็น `PAYROLL_INPUT_TIME`, `PAYROLL_VIEW_AMOUNT`, `PAYROLL_EDIT_RATE`, `PAYROLL_ADJUST_AMOUNT`, `PAYROLL_APPROVE`, `PAYROLL_PAY` PM/Admin/Owner ลงเวลาแทนได้ตามProject โดยเก็บผู้กรอกแยกจากพนักงาน; ฟ้า/Admin ได้ `PAYROLL_INPUT_TIME` เพื่อกรอกและตรวจข้อมูลที่ไม่ใช่จำนวนเงิน โดยหน้าจอ/API/export ต้องไม่ส่งอัตราหรือยอดคำนวณมาให้ browser ของ Admin เลย ไม่ใช่เพียงซ่อนด้วย CSS ส่วน OWNER เป็นผู้กรอกอัตรารายวัน รายการเพิ่ม/หักที่เป็นตัวเงิน เห็นยอด อนุมัติ lock และบันทึกการจ่าย

## 5. หมวดต้นทุน Release แรก

- LABOR — ค่าแรงวันทำงาน
- OT — ค่าล่วงเวลา
- FUEL — น้ำมัน
- TRAVEL — เดินทาง/ค่าทางด่วน/ที่จอดรถ
- ACCOMMODATION — ที่พัก
- MEAL — อาหาร/เบี้ยเลี้ยง
- MATERIAL_DIRECT — วัสดุซื้อใช้ตรงกับงาน
- HARDWARE_DIRECT — อุปกรณ์ซื้อใช้ตรงกับงาน
- SUBCONTRACTOR — ผู้รับเหมาช่วง
- TRANSPORT — ขนส่ง
- OTHER — อื่น ๆ

Owner/Admin แก้ชื่อหรือปิดหมวดในอนาคตได้ แต่ code ที่มีการใช้งานแล้วห้ามเปลี่ยนความหมายย้อนหลัง

ค่าแรงและ OT ใช้อัตราที่มี effective date และเก็บ snapshot ของอัตราที่ใช้คำนวณไว้ใน Cost Ledger ผู้ไม่มีสิทธิ์เห็นค่าแรงต้องเห็นได้เพียงจำนวนคน/วัน/ชั่วโมงตามขอบเขตงาน

นโยบายค่าแรงเริ่มต้นตาม requirement เดิม โดยเก็บเป็น version และมี effective date ห้ามแก้ย้อนหลัง:

- วันทำงานปกติเต็มวัน: `อัตรารายวัน × 1.0`
- ครึ่งวัน: `อัตรารายวัน × 0.5`
- ค่ากิน/Meal Allowance เมื่อมาทำงานเต็มวัน: 120 บาท; ครึ่งวัน: 60 บาท
- วันอาทิตย์หรือวันหยุดในปฏิทินที่มาทำงาน: `อัตรารายวัน × 2 × สัดส่วนวัน`
- วันปกติ: `(ค่าแรงรายวัน ÷ 8) × 2 × ชั่วโมง`
- วันหยุด: `(ค่าแรงรายวัน ÷ 8) × 3 × ชั่วโมง`
- วันอาทิตย์เป็นวันหยุดโดยค่าเริ่มต้น และ Admin กำหนดปฏิทินวันหยุดได้
- ตัวอย่างค่าแรง 970 บาท: OT ปกติ 243 บาท/ชั่วโมง, OT วันหยุด 364 บาท/ชั่วโมง ตามวิธีปัดที่กำหนดและทดสอบไว้

Assumption เริ่มต้น: ค่ากินจ่ายเฉพาะวันที่มี Work Entry ที่อนุมัติ ไม่จ่ายวันลา/ขาดงาน และยังจ่าย 120/60 บาทเมื่อมาทำงานวันหยุดตามสัดส่วนวัน ค่าเดินทางหรือเบี้ยเลี้ยงอื่นไม่รวมอยู่ในค่ากิน ต้องแยกรายการ หากนโยบายจริงต่างจากนี้ให้แก้ policy version ไม่แก้ข้อมูลเก่า

การปัด OT ใช้ `ROUND_HALF_UP` อัตราต่อชั่วโมงเป็นบาทเต็มก่อนคูณจำนวนชั่วโมง และเก็บสูตร, input, policy version และผลลัพธ์เป็น snapshot เพื่อให้ตัวอย่าง 970 บาทได้ 243/364 ตาม requirement เดิม ห้ามให้ frontend กับ backend คำนวณคนละสูตร

จำนวนเงินทุกค่าเก็บเป็น integer satang ห้ามใช้ floating point เป็นข้อมูลทางการ

## 5.1 Payroll / รอบค่าจ้าง

Work Entry และ OT Entry ที่อนุมัติเป็นแหล่งข้อมูลร่วม แต่ต้องสร้างผลลัพธ์สองบริบทแยกกัน:

1. `Cost Ledger` สำหรับต้นทุน Project/Opportunity
2. `Payroll Ledger` สำหรับยอดจ่ายพนักงาน

ห้ามนำ Payroll total ไปบวก Actual Cost ซ้ำ เพราะต้นทุนแรงงานถูกลงจาก Work/OT แล้ว แต่ละรายการต้องเชื่อมกลับ source เดิมและ policy/rate snapshot ได้

รอบค่าจ้างเป็นวันที่ 1 ถึงวันสุดท้ายของเดือนและต้องโอนเงินไม่เกินวันที่ 1 ของเดือนถัดไป สถานะ `OPEN → TIME_REVIEWED → OWNER_REVIEW → APPROVED → LOCKED → PAID` ช่างต้องส่งวันทำงาน/OT ของวันสุดท้ายภายในวันนั้น Admin ตรวจและปิดข้อมูลเวลาไม่เกิน 10:00 น. วันที่ 1 วัน/OT ผ่านแล้วไม่ต้อง Owner ตรวจซ้ำ จากนั้นระบบคำนวณยอดอัตโนมัติในขอบเขตที่ Admin มองไม่เห็น Owner ตรวจอัตรา รายการเพิ่ม/หัก ยอดสุทธิ อนุมัติ lock และบันทึกการโอนภายในวันที่ 1 การเปิดรอบที่ lock แล้วทำได้เฉพาะ OWNER พร้อมเหตุผล และต้องสร้าง revision/audit ไม่แก้ผลเดิมแบบเงียบ

หากข้อมูลวันทำงานหรือ OT มาหลัง `TIME_REVIEWED` ระบบห้ามแก้ยอดที่อนุมัติแล้วแบบเงียบ ต้องสร้าง `LATE_ADJUSTMENT` พร้อมเหตุผลและเลือกว่าจะ reopen รอบก่อนจ่าย หรือยกไปปรับรอบถัดไป หากวันที่ 1 เป็นวันหยุดให้ยังใช้ electronic transfer ภายในวันที่ 1 เป็น default; เหตุขัดข้องของธนาคารต้องบันทึกผู้รับผิดชอบ เวลา และวันที่จ่ายจริง

Payroll Release แรกประกอบด้วยค่าแรงรายวัน, ค่าทำงานวันหยุด, OT, ค่ากิน และรายการเพิ่ม/หักแบบ manual ที่ต้องเลือกประเภท ใส่เหตุผล ผู้บันทึก และหลักฐานถ้ามี การคำนวณประกันสังคม ภาษี เงินกู้ หรือเงินทดรองแบบอัตโนมัติยังไม่ถือว่าพร้อมจนกว่าจะยืนยันกติกากับผู้ทำบัญชี ระบบจึงต้องเรียกผลลัพธ์ช่วงนี้ว่า “สรุปค่าจ้าง” ไม่อ้างว่าเป็น payroll ตามกฎหมายครบถ้วน

Rate และ policy ทุกชนิดมี effective date และห้าม overlap แบบกำกวม เมื่อปิดรอบต้อง snapshot ชื่อพนักงาน อัตรา สูตร ปฏิทิน และยอด เพื่อให้เปิดย้อนหลังได้แม้ master data เปลี่ยน

## 6. Budget และ Actual Cost

Budget ต้องมี version และสถานะ `DRAFT`, `APPROVED`, `SUPERSEDED` เมื่ออนุมัติแล้วให้สร้าง baseline snapshot การแก้ Budget ต้องสร้าง version ใหม่พร้อมเหตุผล

Budget line ทุกบรรทัดมี `project_id` และมี `job_id` แบบ nullable ค่าเริ่มต้นเป็น Budget ระดับ Project หากใช้ Job budget ต้องระบุชัดว่าเป็นการแบ่ง Project budget หรือเป็นยอดเพิ่ม ห้ามรวม Project-level และ Job-level ซ้ำกัน Dashboard Project ต้อง reconcile กลับ baseline ได้เสมอ

Actual Cost มาจาก Cost Ledger เท่านั้น แต่ละบรรทัดต้องมี source type และ source ID ที่ unique:

- APPROVED_WORK_ENTRY
- APPROVED_OT_ENTRY
- APPROVED_EXPENSE
- MANUAL_ADJUSTMENT (เฉพาะ OWNER พร้อมเหตุผล)

ห้ามรวมยอดจากตารางต้นทางโดยตรงหลายแบบ เพราะอาจนับซ้ำ การยกเลิกรายการที่อนุมัติแล้วต้องสร้าง reversal line ห้ามลบหรือแก้ Cost Ledger เดิม

Dashboard แสดงอย่างน้อย:

- Budget, Actual และ Remaining รวม
- แยกตาม Job เมื่อ Project มี Job; หากไม่มีให้แสดง Project total โดยไม่สร้างหมวดว่าง
- แยกตามหมวดต้นทุน
- % Used และสถานะสี: เขียว <80%, เหลือง 80–100%, ส้ม 100–110%, แดง >110%
- รายการรอตรวจ ซึ่งยังไม่รวมใน Actual
- Forecast แบบง่าย: Actual + รายการที่อนุมัติแล้วแต่ยังไม่ post (ถ้ามี) + commitment ที่ Owner กรอกเอง; AI Forecast อยู่นอก Release แรก

## 7. โครงสร้างข้อมูลหลัก

ใช้ UUID/ULID เป็น internal ID และ human code แยกกัน ทุกตารางธุรกิจมี `created_at`, `created_by`, `updated_at` ตามความเหมาะสม

- users
- employees
- employee_rate_versions
- line_accounts
- customers
- sites
- projects
- jobs (`context_type` = PROJECT/OPPORTUNITY/INTERNAL, optional สำหรับ Project และมี parent ตาม check constraint)
- project_members
- job_assignments
- cost_categories
- budgets
- budget_lines
- work_entries
- overtime_entries
- expense_submissions
- expense_evidence
- expense_review_history
- cost_ledger
- line_group_bindings
- line_event_inbox
- line_conversation_flows
- notification_outbox
- audit_logs
- job_types
- holiday_calendars
- payroll_periods
- payroll_runs
- payroll_lines
- payroll_adjustments
- payroll_ledger
- payroll_revision_history
- opportunities
- opportunity_status_history
- accounting_export_runs
- accounting_export_items

กำหนด foreign keys, unique constraints และ indexes จาก query จริง Migration ทุกไฟล์ append-only หลังใช้กับ environment ร่วม ห้ามแก้ migration ที่ apply แล้ว

ตาราง Assignment, Budget, Work, OT, Expense และ Cost ที่เป็นข้อมูล Project ต้องมี `project_id` เสมอและ `job_id` nullable หากมี `job_id` ต้องตรวจว่า Job อยู่ใน Project เดียวกัน ห้ามใช้ polymorphic ID ที่ไม่มี foreign key และห้ามบังคับสร้าง Job เพื่อรองรับรายการระดับ Project

## 8. สถาปัตยกรรมที่ต้องใช้

สร้างเป็น Modular Monolith เพื่อให้ดูแลง่ายและต่อยอดได้ โดยแยก module ใน code ชัดเจน:

- Identity & Access
- Customer / Project / Job
- Assignment
- Budget
- Time & OT
- Expense & Evidence
- Cost Ledger
- Payroll
- Opportunity / Pre-Sales
- Accounting Export
- LINE Integration
- Reporting
- Audit & Operations

โครงสร้างแนะนำ:

```text
apps/web      — Next.js สำหรับ Owner/Admin/PM
apps/api      — Node.js + Fastify API และ LINE webhook
apps/worker   — worker สำหรับ inbox/outbox, retry และงานเบื้องหลัง
packages/domain
packages/database
packages/contracts
packages/ui
```

ใช้ TypeScript strict, PostgreSQL และ object storage แบบ S3-compatible สำหรับรูปหลักฐาน ระบบต้องรันได้บน managed container ทั่วไปและไม่ผูกกับผู้ให้บริการรายเดียว Production ต้องมี process ของ API และ worker ที่ทำงานต่อเนื่อง ไม่พึ่ง request background หรือ `waitUntil` เป็นตัวรับประกันงาน

ทุก business action เรียก application service เดียวกันจาก Web และ LINE ห้ามให้ LINE import หรือเรียก route handler ของ Web โดยตรง

## 9. LINE reliability contract

เมื่อ webhook เข้า:

1. ตรวจ signature จาก raw request body
2. ตรวจขนาด payload และ schema ขั้นต่ำ
3. เขียน event ลง `line_event_inbox` แบบ durable โดยใช้ `webhook_event_id` เป็น unique idempotency key
4. commit แล้วตอบ HTTP 200 อย่างรวดเร็ว
5. Worker claim event ด้วย lease, ประมวลผล และ retry แบบ bounded backoff
6. ผลธุรกิจและ notification outbox อยู่ใน transaction ที่เหมาะสม
7. การส่ง reply ล้มหลังบันทึกธุรกิจสำเร็จต้องไม่ย้อนลบธุรกิจ Worker ใช้ push message หรือสถานะใน outbox เพื่อส่งซ้ำอย่างปลอดภัย
8. เก็บสถานะ RECEIVED, PROCESSING, DONE, RETRY, DEAD พร้อม attempt, last_error_category และ timestamps

ห้าม log token, raw receipt image, ค่าแรง, เลขบัญชี หรือข้อมูลส่วนบุคคลโดยไม่จำเป็น Log ต้องมี correlation ID ที่ตามจาก LINE event → draft → business record → cost line ได้

LINE รองรับ webhook ใน group chats และรับรูปจากผู้ใช้ได้ แต่รูปที่ LINE เก็บอาจถูกลบภายหลัง จึงต้องดาวน์โหลดและบันทึก object storage ของระบบทันทีหลัง event ผ่านการรับเข้าแบบ durable ตามเอกสาร LINE Messaging API ปัจจุบัน

## 10. การจัดเก็บรูปหลักฐานและส่งออกให้บัญชี

- เก็บ binary ใน private object storage
- เก็บ metadata, hash, owner, project, optional job, expense, mime, size และ object key ใน PostgreSQL
- จำกัด JPG/PNG/WebP/PDF ตามที่ทดสอบแล้ว ขนาดเริ่มต้นไม่เกิน 10 MB ต่อไฟล์
- ตรวจ magic bytes และจำนวนไฟล์ ไม่เชื่อ extension อย่างเดียว
- object key ใช้ ID ไม่ใช้ชื่อพนักงานหรือรายละเอียดอ่อนไหว
- ชื่อดาวน์โหลดสำหรับ Owner: `YYYYMMDD_PROJECTCODE[_JOBCODE]_EXPENSECODE_01.jpg`
- รูปเข้าถึงผ่าน authenticated signed URL อายุสั้น
- hash และ unique LINE message ID ป้องกันการเก็บซ้ำ
- ลบหรือแก้ไฟล์ไม่ได้แบบเงียบ ต้องมี audit/replacement history

แนะนำให้ Core App เป็นแหล่งเก็บหลัก เพราะสามารถผูกสิทธิ์, hash, audit, expense, Project และ optional Job ได้โดยตรง ผู้ใช้ต้องได้ประโยชน์แบบเดียวกับ Google Drive ผ่าน “ศูนย์หลักฐานบัญชี” ดังนี้:

- มุมมองแยกปี/เดือนตาม `Asia/Bangkok` พร้อม filter Project, Job, ผู้ส่ง, หมวด และสถานะ
- ลิงก์หน้าเดือนสำหรับผู้มีสิทธิ์ ซึ่งต้อง login; ห้ามใช้ public link ถาวร
- ดาวน์โหลดไฟล์เดี่ยวด้วย signed URL อายุสั้น
- ส่งออกเป็น ZIP แยก `YYYY/MM/PROJECTCODE/` และแยก Job เพิ่มเมื่อมี พร้อมไฟล์ภาพ/PDF และ manifest CSV/XLSX ที่มี Evidence ID, วันที่, Project, optional Job, ประเภท, ยอด, ผู้ส่ง, สถานะ, hash และชื่อไฟล์
- ชื่อไฟล์ `YYYYMMDD_PROJECTCODE[_JOBCODE]_EXPENSECODE_SEQUENCE.ext`; ชื่อไฟล์ช่วยค้นหาแต่ Evidence ID เป็นตัวอ้างอิงจริง
- export แต่ละครั้งมี version, ผู้สร้าง, เวลา, จำนวนไฟล์, ยอดรวม และ checksum; เมื่อข้อมูลแก้ไขให้สร้าง export revision ใหม่และระบุฉบับเดิมว่า superseded
- มี backup/restore และทดสอบกู้คืนทั้ง metadata กับ binary

Google Drive เป็น optional export mirror ไม่ใช่ source of truth ระบบสามารถสร้าง folder ตามเดือนและส่งสำเนา/manifest ไป Drive เมื่อเชื่อมต่อภายหลัง แต่ Drive ล้ม สิทธิ์หมดอายุ หรือลบไฟล์ ต้องไม่ทำให้ต้นฉบับใน Core หาย การเก็บหลักฐานใช้ 2 ปีตามคำตอบ Owner รอบ3; วิธีเริ่มนับและ lifecycle ตาม ADR-008 เป็นรายละเอียดออกแบบ ยังไม่รันลบจริง

## 11. หน้าเว็บ

เมนูหลักไม่เกิน 7 กลุ่มและแสดงตาม role:

1. ภาพรวม
2. โครงการและงาน
3. รายการรอตรวจ
4. ต้นทุนและงบประมาณ
5. ทีมงานและค่าจ้าง
6. รายงานและหลักฐานบัญชี
7. ตั้งค่า

หน้า Project Detail เป็นศูนย์กลางและมี tabs เท่าที่จำเป็น:

- Overview
- Jobs
- Budget vs Actual
- Time & OT
- Expenses
- Activity

หน้าแรกของ Owner ต้องตอบสามคำถามได้ภายใน 10 วินาที (Admin/PM แสดงงานค้าง จำนวนคน วันและชั่วโมงเท่านั้น ไม่มีเงิน):

1. Project ใดใกล้หรือเกิน Budget
2. มีรายการอะไรค้างตรวจ
3. Job ใดกำลังทำและใครรับผิดชอบ

ใช้ภาษาไทยที่คนทำงานเข้าใจ ปุ่มต้องเป็นคำกริยาชัดเจน รองรับมือถือ และมี loading, empty, error, retry และ unsaved-state ที่สมบูรณ์

หน้า Payroll ต้องเริ่มจากข้อผิดปกติและสิ่งที่ต้องตรวจ เช่น วันซ้ำ OT ไม่มี Work Entry หรือ rate หาย (ไม่มี Job ไม่ใช่ข้อผิดพลาดสำหรับโครงการที่ไม่บังคับงานย่อย) ไม่เริ่มจากตารางเงินเดือนขนาดใหญ่ ค่าแรงรายบุคคลต้อง masked จนผู้มีสิทธิ์เปิดดู และ export ต้องตรวจ capability ซ้ำ

## 12. สิ่งที่ไม่ทำใน Release แรก

- OCR/AI อ่านใบเสร็จหรือสลิป
- Auto approval
- ตรวจสอบสลิปกับธนาคาร
- Stock ledger, Serial, Issue/Return และ Reconciliation
- SMEMOVE API sync
- Purchase Request / Purchase Order
- การคำนวณภาษี/ประกันสังคม/เงินกู้อัตโนมัติก่อนยืนยัน policy กับผู้ทำบัญชี
- MA, PM, Warranty และ Renewal
- Customer Portal
- ClickUp migration
- AI Forecast
- Google Drive เป็นแหล่งเก็บหลัก; อนุญาตเฉพาะ export mirror หลัง Core flow ผ่าน
- หน้าจอ Opportunity เต็มรูปแบบก่อน Core Job Cost และ Payroll ผ่าน pilot
- Import ข้อมูลเดิมทั้งระบบ

ออกแบบ event contracts และ IDs ให้เพิ่ม module เหล่านี้ได้ภายหลัง แต่ห้ามสร้างหน้าว่าง ตาราง speculative หรือเมนูที่ยังใช้ไม่ได้

## 13. การทดสอบและหลักฐาน

ใช้ test pyramid ที่เน้นความเสี่ยงธุรกิจ:

- Unit tests: parsing จำนวนเงิน/วันที่, OT, permission และ state transitions
- Payroll golden tests: full/half day, meal 120/60, Sunday/holiday 2x, normal OT 2x, holiday OT 3x, rounding 970 → 243/364, rate effective date และ reopened period
- Integration tests กับ PostgreSQL จริง: idempotency, transactions, ledger/reversal, concurrent approval, migration
- Contract tests: LINE payload/signature, group/private source, duplicate/redelivery และ image sequence
- End-to-end: Web และ worker ผ่าน infrastructure ใกล้ production
- Backup/restore rehearsal
- Accounting export test: จำนวนไฟล์ ยอดรวม manifest hash และไฟล์ที่เปิดได้ตรงกับข้อมูลใน Core
- Load test เริ่มต้น: 20 concurrent users, 2,000 webhook events/day และรูป 10–20 รูป/day; บันทึกตัวเลขจริงก่อนปรับขนาด
- Pilot UAT ด้วยโทรศัพท์และบัญชีจริงของ Owner/Admin/PM/ช่าง โดยไม่ปลอม session

เงื่อนไขผ่านที่สำคัญ:

1. Event เดิมส่งซ้ำ 10 ครั้ง เกิด business record และ Cost Ledger หนึ่งครั้ง
2. ช่างสองคนส่งข้อความและรูปพร้อมกันในกลุ่มเดียว รูปและยอดไม่สลับกัน
3. Bot/DB/storage ล้มกลางทางแล้วกลับมาทำต่อได้ ไม่มี success message ลวง
4. Admin/Owner แก้รายการก่อนอนุมัติ มี before/after/reason ครบ
5. Approved expense ถูกนับ Actual หนึ่งครั้ง การยกเลิกสร้าง reversal
6. TECH และสมาชิกภายนอกดึง Budget, ค่าแรง หรือกำไรผ่าน API/LINE/export ไม่ได้
7. Project dashboard รวมยอดตรงกับ Cost Ledger และแยก pending ออกจาก actual
8. Backup กู้เข้า database ใหม่แล้ว counts, totals, hashes และ relationships ตรงกัน
9. หน้าเว็บหลักใช้งานบนมือถือ และ flow LINE สำเร็จตาม pilot script
10. รอบค่าจ้างหนึ่งเดือนตรวจมือแล้วตรงทุกคน และไม่ทำให้ Project Actual ถูกบวกซ้ำ
11. ผู้ไม่มี Payroll capability เรียกดูผ่าน URL/API/export ไม่ได้ แม้รู้ ID
12. Export หลักฐานรายเดือนครบทุก approved expense และตรวจ checksum ได้; export ซ้ำสร้าง revision ไม่ทับหลักฐานเดิม
13. Project ที่ไม่มี Site และไม่มี Job ทำ flow Assignment → Time/OT/Expense → Approval → Cost → Payroll ได้ครบโดยระบบไม่ถาม Site/Job
14. เมื่อระบุ Job ระบบปฏิเสธ Job ที่อยู่คนละ Project และ Project total ไม่รวม Budget/Actual ซ้ำ
15. ข้อมูลวันที่สุดท้ายของเดือนที่ส่งทันเวลารวมในรอบเดียวกัน Admin ปิดเวลาโดยไม่เห็นยอด และ Owner สามารถอนุมัติ/บันทึกจ่ายภายในวันที่ 1
16. รายการที่ส่งหลังปิดข้อมูลไม่เปลี่ยนยอดที่อนุมัติแล้วแบบเงียบและมี late-adjustment audit ครบ

รายงานผลแยก Local test, Integration test, Deployed smoke test, Real LINE test และ User acceptance ชัดเจน ห้ามเรียก mock test ว่าทดสอบ LINE จริง

## 14. ลำดับพัฒนาและ gates

### Milestone 0 — Process prototype

- ทำ wireflow ของ 5 LINE actions และหน้าเว็บหลัก
- ทำ data dictionary, permission matrix และ state diagrams
- ใช้ข้อมูลตัวอย่าง Project A ที่ไม่มี Site/Job และ Project B ที่มี Site/สอง Jobs พร้อมช่างสองคน
- Owner ตรวจคำศัพท์และขั้นตอน โดยยังไม่เขียนโมดูลอื่น

Gate: ผู้ใช้เข้าใจ flow และทำ task ตัวอย่างได้โดยไม่ต้องอธิบายขั้นตอนเพิ่มเติม

### Milestone 1 — Foundation

- Repository, environments, CI, PostgreSQL migrations, authentication, roles
- Customer/Project/optional Site/optional Job/Assignment
- Audit, health checks, backup policy
- LINE account linking และ group binding

Gate: Admin สร้าง Project โดยไม่ต้องมี Site/Job มอบหมายทีม และช่างเห็นงานของตนใน LINE จริง; Project ที่ใช้ Site/Job ก็ทำงานได้โดยไม่ปะปนกัน

### Milestone 2 — Time & OT

- ลงวันทำงาน/OT ผ่าน LINE
- Review/approve/correct ผ่านเว็บ
- Cost posting ตาม rate snapshot

Gate: ข้อมูลหนึ่งรอบจ่ายตัวอย่างคำนวณตรงและ retry ไม่ซ้ำ

### Milestone 3 — Expense & Evidence

- Typed expense + photo flow
- Durable inbox/worker/outbox
- Admin/Owner review ค่าใช้จ่ายและ Cost Ledger

Gate: ผ่าน concurrent group test, failure recovery และ real phone UAT

### Milestone 4 — Budget vs Actual

- Budget versions/baseline
- Dashboard, thresholds, exports
- Reconciliation checks

Gate: ตัวเลขตัวอย่างตรวจมือกับ ledger ตรงกันทุกหมวด

### Milestone 5 — Payroll / สรุปค่าจ้าง

- รอบค่าจ้าง, rate/policy version, holiday calendar และ payroll ledger
- ค่าแรงเต็มวัน/ครึ่งวัน, วันหยุด 2x, OT 2x/3x และค่ากิน 120/60
- ตรวจข้อผิดปกติ รายการเพิ่ม/หัก การอนุมัติ lock revision และสรุปพนักงาน
- Permission และ privacy test สำหรับข้อมูลค่าจ้าง

Gate: รอบตัวอย่างตรวจมือกับ time/OT และ rate snapshot ตรงทั้งหมด ไม่มีการบวก Project Actual ซ้ำ และ Owner อนุมัติรูปแบบสรุปก่อนใช้จ่ายจริง

### Milestone 6 — Pilot Core

- เลือก 2–3 Projects และผู้ใช้กลุ่มเล็ก
- ใช้คู่ขนานกับวิธีเดิม 2–4 สัปดาห์
- วัด completion rate, response time, correction rate, duplicate/lost events และเวลาที่ Admin ใช้
- แก้ blocker แล้วจึงพิจารณาย้าย Project ใหม่เข้าระบบ

Gate: Owner, Admin และช่างยืนยันว่าใช้ทำงานประจำได้ พร้อมผล restore และ rollback drill

### Milestone 7 — Opportunity / Pre-Sales

- Opportunity pipeline, Job ภายใต้ Opportunity, Man-day และ Pre-Sales Cost
- Won/Lost history และการสร้าง Project จาก Won โดยไม่ทำประวัติเดิมหาย
- Conversion และ Opportunity cost report

Gate: Opportunity ตัวอย่างเปลี่ยนเป็น Project ได้โดยยอด Pre-Sales ไม่ปะปน Project Actual และรายงาน Man-day ตรงกับ source entries

## 15. วิธีทำงานของ Codex และ Work ผ่าน Repository กลาง

- เริ่มจาก repository ใหม่ ห้ามแก้หรือ deploy แอปเดิมระหว่างสร้างระบบใหม่นี้ Repository คือแหล่งข้อมูลจริงเพียงแห่งเดียว; แชท ความจำของ agent หรือไฟล์นอก repo ไม่มีอำนาจเหนือเอกสาร version ปัจจุบัน
- ก่อนเริ่มงานทุกครั้งต้อง fetch/pull และอ่าน `AGENTS.md`, `docs/MASTER_PROMPT.md`, `docs/PROJECT_STATUS.md`, `docs/DECISION_LOG.md`, schema และ contract ของ module ที่เกี่ยวข้อง
- Codex และ Work ใช้ branch แยกตามงานและเปิด PR ห้ามแก้ module เดียวกันพร้อมกันโดยไม่มี owner ระบุใน `PROJECT_STATUS.md`
- การแก้ database schema, API contract, สูตรเงิน หรือ permission ต้องมี ADR/decision ที่ review ก่อน merge
- Update `PROJECT_STATUS.md`, `DECISION_LOG.md`, `CHANGELOG.md` และ `DATABASE_SCHEMA.md` ทุก milestone และ failure/recovery ที่สำคัญ
- ก่อนส่งงานต้อง rebase/merge จาก branch หลัก รัน test ตาม risk และบันทึก commit SHA, migration, environment และ test evidence ลง repo
- Deployment ต้องมาจาก tagged/release commit ใน branch หลักเท่านั้น ห้าม deploy โค้ดที่มีเฉพาะในเครื่องหรือแชท
- ทำ vertical slice ให้จบทีละเส้นทาง ห้ามสร้างทุกเมนูก่อน backend พร้อม
- ทุก PR/commit อธิบาย problem, behavior, migration, tests และ limitation
- ใช้ feature flags สำหรับ flow ที่ยังไม่ผ่าน real integration
- ไม่ซื้อ service, เปลี่ยน LINE OA, ส่งข้อความจริง, เปลี่ยน production data หรือ deploy production โดยไม่มีขอบเขตที่ Owner อนุญาต
- ห้ามเก็บ credentials ใน source, docs, logs หรือ chat
- เมื่อพบ requirement ขัดกัน ให้ใช้ขอบเขต Release แรกนี้ก่อนและบันทึกคำตัดสิน ห้ามเดาเรื่องเงิน สิทธิ์ หรือการอนุมัติ
- เมื่อมี blocker ให้ทำงานอิสระส่วนอื่นต่อและรายงานสิ่งที่ขาดอย่างเฉพาะเจาะจง
- หากเอกสารใน repo ขัดกัน ให้หยุดเฉพาะส่วนที่ขัด บันทึก blocker และทำส่วนอื่นต่อ ห้ามเลือกคำตอบจากแชทเก่าเอง

## 16. เอกสารใน repository ใหม่

```text
/docs
  MASTER_PROMPT.md
  PROJECT_STATUS.md
  DECISION_LOG.md
  CHANGELOG.md
  DATABASE_SCHEMA.md
  DATA_DICTIONARY.md
  PERMISSION_MATRIX.md
  adr/
  LINE_INTEGRATION.md
  EXPENSE_FLOW.md
  ACCOUNTING_EVIDENCE.md
  PAYROLL_POLICY.md
  OPPORTUNITY_FLOW.md
  TEST_EVIDENCE.md
  OPERATIONS_RUNBOOK.md
```

ไฟล์ root ที่ต้องมี:

```text
AGENTS.md              — กติกาที่ Codex/Work ต้องทำตามและลำดับเอกสารที่ต้องอ่าน
README.md              — วิธีรันระบบและภาพรวมที่ไม่ซ้ำ Master Prompt
.env.example           — ชื่อตัวแปรเท่านั้น ไม่มี secret
```

PROJECT_STATUS ต้องเขียนเป็นภาษาไทยและแสดง:

- สิ่งที่ใช้งานได้จริง
- สิ่งที่อยู่ระหว่างทำ
- สิ่งที่ยังไม่เริ่ม
- หลักฐาน test/deployment/UAT
- known issues และผลกระทบ
- migration/version/commit ที่เกี่ยวข้อง
- ขั้นตอนถัดไปและ owner ของงาน

ทุก feature ต้องแสดงสถานะแยกกันอย่างน้อย `DESIGNED`, `CODED`, `TESTED_LOCAL`, `TESTED_INTEGRATION`, `DEPLOYED_STAGING`, `UAT_PASSED`, `PRODUCTION_READY` ห้ามข้ามเป็น “เสร็จ” และต้องมี link ไปหลักฐานที่ตรวจซ้ำได้

## 17. ค่าตั้งต้นที่ใช้เริ่มพัฒนาได้ทันที

- Timezone: Asia/Bangkok
- Currency: THB
- Site เป็น optional; ไม่ต้องสร้าง Site ปลอมหรือเลือกค่า `ไม่ระบุ` เพื่อสร้าง Project
- Project เป็นหน่วยหลักและอาจไม่มี Job; Job เป็นงานย่อย optional
- Work/OT/Expense/Budget บันทึกระดับ Project ได้โดยมี `job_id = null`
- Job Type เป็น configurable master data ไม่ hard-code
- Work entry: FULL/AM/PM
- Expense status: DRAFT → PENDING_REVIEW → APPROVED/REJECTED/CANCELLED
- Work/OT status: DRAFT → SUBMITTED → APPROVED/REJECTED/CANCELLED
- Reviewer วัน/OT เริ่มต้น: ADMIN หรือ OWNER; PM ตรวจเวลาได้เฉพาะ Project ที่ได้รับมอบหมายเมื่อ Owner เปิด policy; Expense reviewer คือ ADMIN/OWNER; Budget reviewer คือ OWNER เท่านั้น
- Faa เป็น Admin หลักในงานจริง แต่สิทธิ์ต้องผูกกับบัญชีที่ยืนยันแล้ว ไม่ผูกจากชื่อเพียงอย่างเดียว
- รอบค่าจ้าง: วันที่ 1 ถึงวันสุดท้ายของเดือน และโอนเงินไม่เกินวันที่ 1 ของเดือนถัดไป; ฟ้า/Admin ปิดตรวจวัน/OT ภายใน 10:00 น. วันที่ 1 โดยไม่เห็นจำนวนเงิน และ OWNER กรอกอัตรารายวัน เห็นยอด อนุมัติ/lock/บันทึกจ่ายภายในวันเดียวกัน
- ค่าแรง: full day 1.0, half day 0.5, Sunday/holiday work 2.0 ตามสัดส่วนวัน
- ค่ากิน: full day 120 บาท, half day 60 บาท เฉพาะวันที่ทำงานที่อนุมัติ รวมวันหยุดที่มาทำงาน
- OT: วันปกติ `(daily/8)×2`, วันหยุด `(daily/8)×3`; ปัด hourly rate แบบ HALF_UP เป็นบาทเต็มก่อนคูณชั่วโมง
- Pending ไม่รวม Actual
- Approved สร้าง Cost Ledger ครั้งเดียว
- External LINE group members ไม่เห็นยอดรวม Project หรือข้อมูลค่าจ้าง
- Receipt image เป็นหลักฐาน; typed amount เป็นข้อมูลตั้งต้น
- Core private storage เป็นแหล่งหลัก; monthly accounting export และ optional Drive mirror เป็นสำเนา
- ระยะเก็บหลักฐาน 2 ปีตาม ADR-008; M0 ไม่มีการลบจริง

## 18. ข้อตกลงที่ยืนยันแล้วก่อนใช้เงินจริง

ยืนยันแล้ว:

1. พนักงานเป็นรายวัน จ่ายค่าแรงและค่ากินเฉพาะวันที่มาทำงาน ค่ากินเต็มวัน 120 บาท ครึ่งวัน 60 บาท รวมวันที่มาทำงานในวันอาทิตย์/วันหยุด และไม่จ่ายวันลา/ขาดงาน
2. Release แรกคำนวณค่าแรง OT ค่ากิน และรายการเพิ่ม/หัก manual ยังไม่คำนวณภาษีหรือประกันสังคมอัตโนมัติ
3. รอบค่าจ้างวันที่ 1–วันสุดท้ายของเดือน Admin กรอก/ตรวจข้อมูลเวลาโดยไม่เห็นยอดเงิน Owner กรอกอัตรารายวัน เห็นยอด และอนุมัติ/lock
4. ตัดวันทำงานถึงวันสุดท้ายของเดือนและโอนเงินไม่เกินวันที่ 1 ของเดือนถัดไป ใช้ electronic transfer ได้แม้วันที่ 1 เป็นวันหยุด และรายการมาช้าต้องใช้ late adjustment ที่ตรวจย้อนหลังได้

ก่อน Pilot ต้องกรอก checklist ใน repo เพิ่มเติม: Project และผู้ร่วม pilot, ปริมาณผู้ใช้/รูป, budget hosting/domain, แผนนำเข้า master data, วิธีจ่ายเงินจริง และผู้รับผิดชอบ backup/restore แต่ไม่ต้องถามทั้งหมดในครั้งเดียว

## 19. คำสั่งเริ่มงานสำหรับ Codex

เริ่ม Milestone 0 เท่านั้น สร้าง repository กลางและใส่ Master Prompt ฉบับนี้เป็น `docs/MASTER_PROMPT.md` ก่อน จากนั้นจัดทำ wireflow, state diagrams, data dictionary, permission matrix, architecture decision records, Payroll calculation examples, accounting evidence export specification และ pilot acceptance script ใช้ข้อมูลสมมติที่ทำเครื่องหมายชัดเจน ห้าม deploy production หรือเชื่อม LINE OA จริงใน milestone นี้

เมื่อเอกสารและ clickable prototype พร้อม ให้ Owner ตรวจ task จริง 7 งาน ได้แก่ ดูงานของฉัน, ลงวันทำงาน, ลง OT, ส่งค่าใช้จ่ายพร้อมรูป, Admin ตรวจเวลา และค่าใช้จ่าย; Owner ดู Budget vs Actual, เปิดหลักฐานบัญชีรายเดือน และตรวจรอบค่าจ้าง จากนั้นปรับ flow ให้ผ่านก่อนเริ่ม Milestone 1

## แหล่งอ้างอิง LINE ที่ต้องตรวจซ้ำเมื่อเริ่ม implementation

- LINE Messaging API overview: https://developers.line.biz/en/docs/messaging-api/overview/
- Receiving webhook events: https://developers.line.biz/en/docs/messaging-api/receiving-messages/
- Message types and quick replies: https://developers.line.biz/en/docs/messaging-api/message-types/
- Actions: https://developers.line.biz/en/docs/messaging-api/actions/
- Account linking: https://developers.line.biz/en/docs/messaging-api/linking-accounts/
