# M1 LINE — รอบทดสอบ Admin / ช่าง / กลุ่ม

## 25 กันยายน 2026 — มอบหมาย Job B หลังถอน A

Owner อนุญาตทดสอบต่อ หลังยืนยันคำขอ LINE หลังถอน A ไม่พบโครงการแล้ว. มอบหมายเฉพาะ Job สมมติใน PILOT LINE B (PRJ-2609-015) ให้ TECH ผู้ทดลองผ่าน deployed Application สำเร็จ ไม่เพิ่ม assignment ระดับ Project. ตรวจ project/job scope ตรงกัน, domain projection เห็นเฉพาะ B ไม่เห็น A, ASSIGNED audit 1 ครั้ง และ assignment นอก Pilot ไม่เปลี่ยน. ปิด operator สมมติและหมดอายุ session หลังตรวจ เก็บ audit ไว้

**R2-06 Job B: backend PASS / phone WAITING_USER.** ให้ TECH ส่ง “งานของฉัน” ใหม่ ควรเห็นเฉพาะ PILOT LINE B. ผลนี้ยังไม่แทนการตรวจหน้ารายละเอียด Job บน Web หรือการตอบจริงบนโทรศัพท์. ไม่ต้องลงทะเบียน LINE ใหม่. ขั้นถอน A บนโทรศัพท์ UAT_PASSED แล้ว; replay/expiry และ Staging browser restore ยังไม่ครบ

ไม่มี code/schema/deploy/merge/บริการเพิ่ม. Release เดิม dc289ee; CI เดิม 36109173357 Native PostgreSQL 52/52 PASS. รอบนี้ตรวจเอกสาร 45 checks และ git diff --check ผ่าน ไม่รัน application tests ซ้ำ


## 25 กันยายน 2026 — ยืนยันผลถอนสิทธิ์บน LINE

Owner รายงานคำตอบใหม่ว่า “ไม่มีโครงการที่รับมอบหมาย” หลังถอน assignment สมมติ A. R2-06 REVOKE = UAT_PASSED จากรายงานบนโทรศัพท์ร่วมกับหลักฐาน backend รอบก่อน: visible Pilot projects 0, assignment นอก Pilot ไม่เปลี่ยน และมี ASSIGNMENT_REVOKED audit. ไม่ได้ตรวจภาพโทรศัพท์โดยตรง

ขั้นต่อไปคือมอบหมาย Job ใน Project B ให้ TECH แล้วตรวจคำขอใหม่เห็นเฉพาะ B; ยังไม่ได้มอบหมายในรอบบันทึกนี้. Replay/expiry และ Staging browser restore ยังไม่ครบ ไม่ถือ M1 accepted. ไม่มีการเปลี่ยน code/schema/deployment/ข้อมูลในรอบนี้


## 25 กันยายน 2026 — Admin/TECH เห็นงานแล้ว และเริ่มตรวจถอนสิทธิ์

Owner ยืนยัน TECH เห็นงานและ ADMIN เห็น A/B; runtime ตรวจบัญชี active/เชื่อม LINE/อยู่ใน allowlist ตรงกัน โดย TECH เห็นเฉพาะ PRJ-2609-014 และ ADMIN เห็น PRJ-2609-014/015 ก่อนถอนสิทธิ์. ADMIN_ACCOUNT_LINK / ADMIN_LINE_JOBS และ TECH_LINE_JOBS ก่อนถอน = UAT_PASSED จากรายงาน Owner ร่วมกับ runtime ไม่ใช่ภาพโทรศัพท์ที่ระบบตรวจเอง. A/B เป็น Project ทดสอบ ไม่ใช่ Job สองรายการ. สถานะนี้แทนการพัก Admin ก่อนหน้า

R2-06 ถอนเฉพาะ assignment ระดับ Project ของ TECH ใน PILOT LINE A ผ่าน deployed Application แล้ว: backend PASS, เหลือ Pilot project ที่มองเห็น 0, assignment นอก Pilot ไม่เปลี่ยน, audit ASSIGNED 1 / ASSIGNMENT_REVOKED 1. ปิด operator สมมติและ session หลังตรวจ เก็บ audit ไว้ ไม่แก้ข้อมูลจริง ไม่เก็บชื่อบัญชีหรือรหัสลับในเอกสาร

**ขั้นต่อไป:** ให้ TECH ส่ง “งานของฉัน” ใหม่ ต้องไม่แสดงโครงการที่ได้รับมอบหมายใน Pilot; ข้อความเก่าในแชทไม่ถูกลบ. ผลหลังถอนบนโทรศัพท์ = WAITING_USER. ยังไม่มอบหมาย Job B จนตรวจขั้นนี้ผ่าน. ADMIN ยังคงเห็น A/B. Replay/expiry และ Staging browser restore ยังไม่ผ่านครบ จึงยังไม่รับ M1 ทั้งหมด

ไม่มี code/schema/deploy/merge หรือค่าใช้จ่ายเพิ่ม. CI เดิม 36109173357: Native PostgreSQL 52/52 PASS; รอบนี้ตรวจเอกสารและ diff เท่านั้น

## ประวัติก่อนผลล่าสุด (ไม่ใช่คำสั่งปัจจุบัน)

## R2-04 ล่าสุด — กลุ่มผูก A แล้ว

Ownerส่งคำสั่งแล้ว ตรวจmappingกลุ่มที่อนุมัติชี้PRJ-2609-014และaudit1ครั้ง: PASSด้านruntime. R2-05 replay / R2-06 revoke / R2-07 expiry ยังNOT_RUNจริง ไม่ถือว่าPASSตามR2-04. รอTECHยืนยันเห็นAก่อนถอนassignment

## ผลล่าสุดหลังรับ Admin ใหม่

TECHเชื่อมสำเร็จและผลไม่มีโครงการก่อนมอบหมายตรงกับR2-02 (ไม่มีPilot assignment). R2-03มอบหมายAผ่านApplication/domainแล้ว รอTECHเรียกงานใหม่บนโทรศัพท์. AdminลงทะเบียนLINEใหม่ตามD-034แล้ว แต่R2-01ยังPARTIALจนAdminเชื่อมกับบัญชีแอปADMIN; R2-04–07ยังNOT_RUN. เปิดbusinessAPI/workerกลับแล้ว รหัสลงทะเบียนเก่าใช้ต่อไม่ได้ ดูPROJECT_STATUS

วันที่ 25 กันยายน 2026 · ผู้ดูแลรอบ: Codex · Railway Trial เดิม · ยังไม่รับ M1 ทั้งหมด

Owner ให้พัก Rich Menu จนส่วน LINE ของ Milestone ครบ ไม่สร้างหรือเปลี่ยนเมนูในรอบนี้ ใช้คำสั่งข้อความแทน ไม่มีการเริ่มลงวัน/OT/Expense/Payroll

## สถานะก่อนเริ่ม

- Owner เรียก “งานของฉัน” เห็น A/B แล้วตามรายงานบนโทรศัพท์; ตรวจฐานแบบอ่านอย่างเดียวพบ OWNER เชื่อมอยู่หนึ่งบัญชี
- Admin/TECH ยังไม่เชื่อม ณ เวลาตรวจ; กลุ่มที่อนุมัติยังไม่มี binding; ไม่มี assignment ของบัญชีที่เชื่อมให้โครงการ Pilot
- โครงการที่ใช้เท่านั้น: **PRJ-2609-014 — PILOT LINE A - no Site or Job** และ **PRJ-2609-015 — PILOT LINE B - Site and Job**
- ขอบเขตคงเดิม: ผู้ทดลองสามคน / กลุ่มทดสอบหนึ่งกลุ่ม / Project สมมติสองรายการ ห้ามเปลี่ยน assignment หรือบัญชีของพนักงานจริงเพื่อทำ negative test

## รอบบนโทรศัพท์ (ยัง NOT_RUN จนมีหลักฐาน)

| ขั้น | ผู้ทำและวิธี | ผลที่ต้องตรวจ |
| --- | --- | --- |
| R2-01 เชื่อม Admin/TECH (AdminพักตามOwner) | แต่ละคนส่ง “เชื่อมบัญชี” ส่วนตัวกับ OA เดิม เปิดลิงก์ Login ด้วยบัญชีแอปของตน และกดยืนยัน | Codex ตรวจเฉพาะจำนวนตาม role; ห้ามใช้บัญชี Owner ร่วมกัน ห้ามส่งรหัสผ่าน/ลิงก์ให้ Codex |
| R2-02 ไม่มี assignment | TECH ส่ง “งานของฉัน” ก่อนมอบหมาย | ไม่มีโครงการ; Admin เห็น A/B ตามสิทธิ์และ allowlist |
| R2-03 มอบหมาย A | Admin หรือ Codex ผ่าน API ในขอบเขตที่อนุมัติ มอบหมาย TECH ผู้ทดลองให้ A ระดับ Project โดยไม่ถาม Job; TECH ส่ง “งานของฉัน” | เห็น A เท่านั้น ไม่เห็น B; Codex ตรวจ Web/API ตาม role และ audit โดยไม่บันทึกข้อมูลบุคคล |
| R2-04 ผูกกลุ่ม | Owner เปิด A กด “สร้างรหัสผูกกลุ่ม LINE” แล้วส่งคำสั่งที่ได้ในกลุ่มทดสอบภายใน 10 นาที ด้วย LINE ของ Owner ผู้สร้างรหัส | กลุ่มตอบเพียงยืนยัน ไม่มีรายละเอียดโครงการ/บุคคล/เงิน; Codex ตรวจ binding ชี้ A และ audit หนึ่งครั้ง |
| R2-05 ใช้รหัสซ้ำ | Owner ส่งคำสั่งที่ใช้สำเร็จแล้วซ้ำในกลุ่มเดิม | binding และจำนวน audit การผูกสำเร็จไม่เปลี่ยน ไม่มีการเปลี่ยนเป็น B |
| R2-06 ถอน A / เพิ่ม Job B | ถอนเฉพาะ assignment สมมติที่สร้างใน R2-03; TECH เรียกงานใหม่ต้องไม่เห็น A จากนั้นมอบหมายเฉพาะ Job ทดสอบของ B | TECH เห็น B เท่านั้นหลังมอบหมาย; Web แสดงเฉพาะ Job ที่รับผิดชอบ; บันทึก audit assign/revoke แยก |
| R2-07 ลิงก์/รหัสหมดอายุ | สร้างรายการใหม่สำหรับการทดสอบ รอเกิน 10 นาทีจริงแล้วลองใช้ ห้ามปรับเวลา/expiry ของรายการจริงในฐาน | ไม่มีการเชื่อมหรือผูกใหม่จากรายการหมดอายุ; ตรวจฐานก่อน/หลัง การตอบข้อความทั่วไปอย่างเดียวไม่เพียงพอเป็นหลักฐาน |

สร้างรหัสผูกกลุ่มเมื่อ Owner ผู้สร้างพร้อมส่งเท่านั้น ไม่สร้างล่วงหน้าขณะรอ และไม่คัดลอกไป Chat/Git/เอกสาร ห้ามลบ binding เดิมหรือสลับบัญชีจริงเพื่อทดสอบ replay; กรณีผิดคน/ข้ามกลุ่มที่ทำไม่ได้ในขอบเขตหนึ่งกลุ่มให้คง NOT_RUN บน provider พร้อมอ้างผลจำลองแยก

## สิ่งที่ Codex ทดสอบอัตโนมัติได้

ชุด `tests/foundation.test.ts` ใช้บัญชี/รหัสผ่าน/LINE IDs สมมติและ transport จำลอง ไม่ส่ง LINE จริง: ลายเซ็นผิด/ข้อความซ้ำ, nonce ใช้ครั้งเดียว/หมดอายุ, assignment ตรวจซ้ำก่อนส่ง, group code ผิดผู้สร้าง/หมดอายุ/ใช้ซ้ำ, กลุ่มไม่ให้สิทธิ์โครงการ, ไม่เขียนทับ binding เดิม และผู้สร้างรหัสถูกปิดบัญชีขณะรอคิวไม่สามารถผูกกลุ่มได้

Local ใช้ฐานในหน่วยความจำ; CI ใช้ Native PostgreSQL ที่ทิ้งได้ ห้ามตั้ง TEST_DATABASE_URL ไปยัง Staging หรือสำเนาข้อมูลจริง ผลนี้ไม่แทน UAT บนโทรศัพท์

## ผล automated รอบนี้

Local50PASS/2NativeSKIP, typecheck และ M0เอกสาร45checksผ่าน. CI36105399785 NativePG52PASS/0SKIP พร้อม production build, containers และ smoke ผ่านบน commit07dab28. ไม่มีการ Deploy app/schema ในรอบนี้; R2-01–R2-07 ยัง NOT_RUN บนโทรศัพท์ ณ เวลาบันทึก

## จบรอบ

จด PASS/FAIL/NOT_RUN ต่อข้อใน M1_TEST_EVIDENCE และ PROJECT_STATUS พร้อม release SHA; ไม่แนบ payload/token หรือภาพลิงก์ กรณีมีปัญหาข้อมูล/secret/เครดิตให้หยุดตาม OPERATIONS_RUNBOOK เมื่อจบรอบปิดทั้ง API/worker LINE flags และยืนยัน worker หยุดจริง ไม่เพิ่มแผน/บริการ ไม่ Merge PR #2 หรือเริ่ม M2
