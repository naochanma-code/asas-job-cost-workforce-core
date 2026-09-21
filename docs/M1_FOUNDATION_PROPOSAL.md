# ข้อเสนอ Milestone 1 Foundation — ยังไม่เริ่มงาน

สถานะ PROPOSED / NOT_STARTED; ไม่เปลี่ยนMASTERv2.5 ไม่ใช่คำอนุญาตdeployหรือเชื่อมLINEจริง ผู้รับผิดชอบimplementationยังไม่มอบหมาย

## ผลใช้งานที่เล็กที่สุดตามGateเดิม

Adminเข้าเว็บด้วยบัญชีจริง สร้างลูกค้าและProjectโดยไม่ต้องมีSite/Job มอบหมายพนักงาน พนักงานเชื่อมบัญชีLINEและกดงานของฉัน เห็นเฉพาะProjectของตน ข้อมูลคงอยู่หลังlogout/restart

## ขอบเขต

1. โครงWeb/API/PostgreSQL, migrationแรก, environmentsแยก, CI, healthcheck และนโยบายbackup; ทดสอบrestoreข้อมูลสมมติในสภาพแวดล้อมแยกหนึ่งครั้ง
2. Loginจริงและ4roles OWNER/ADMIN/PM/TECH; Ownerหลายบัญชี auditแยกuser; บังคับสิทธิ์ที่serverและปิดหน้าการเงินที่ยังไม่มี
3. Customer/Project + optionalSite/optionalJob + Assignment สร้าง/ดู/แก้ขั้นต่ำ รองรับAไม่มีSite/Job และBมีSite/Job; PMจำกัดProjectassigned TECHเห็นงานตน ไม่มีrequiredJobmodeซึ่งยังเป็นข้อเสนอ
4. บันทึกauditการสร้าง/แก้Projectและมอบหมาย/ถอนทีม; ป้องกันเข้าถึงProject/Jobข้ามscope
5. LINEเฉพาะaccountlinking, groupbindingรหัสใช้ครั้งเดียว และงานของฉันแบบอ่านอย่างเดียว ใช้OA/กลุ่มทดสอบที่Ownerอนุญาตเมื่อเริ่มช่วงเชื่อมต่อ

## เกณฑ์ผ่านที่ตรวจใช้งานได้จริง

- Adminสร้างAและมอบหมายT1ได้โดยไม่มีคำถามSite/Job; T1เห็นAในLINEจริง T2ที่ไม่ได้มอบหมายไม่เห็นและเดาAPI-IDไม่ได้
- BมีSite/Job แยกจากA; Joboptionalและข้อมูลไม่ปะปน; PMของBเข้าถึงAไม่ได้
- Loginด้วย4บทบาทจริงไม่สลับroleจำลอง; Owner3บัญชีแยกactor; sessionหมดอายุและถอนassignmentต้องตัดการเข้าถึง
- Restartบริการแล้วข้อมูลยังอยู่; migrationsจากฐานว่าง/CIผ่าน; healthcheckตรงสถานะDB; backuprestoreตัวอย่างผ่าน
- Bindingหมดอายุ/ใช้ซ้ำ/คนไม่มีสิทธิ์ต้องไม่ผ่าน และไม่มีข้อมูลเงินหรือข้อมูลส่วนตัวในกลุ่ม

เริ่มตรวจWeb+DB+rolesด้วยข้อมูลสมมติก่อนได้ แต่ยังห้ามเรียกM1ผ่านจนทำLINEจริงตามGate MASTERสำเร็จและมีหลักฐาน Ownerทดลองบนบัญชีจริง

## อยู่นอกM1

ลงวันทำงาน/OTและลงแทน, reviewเวลา, rate/payroll/ledger, expense/อัปโหลดบิล/อนุมัติเงิน/ZIP, dashboardsเงิน, OCR, SMEMOVE/Drive integration และย้ายข้อมูลจริง ทั้งหมดอยู่milestoneถัดไป ไม่ทำเมนูว่างชวนเข้าใจว่าพร้อมใช้

## ก่อนเริ่ม

Ownerอนุมัติขอบเขตและสั่งเริ่มM1แยกต่างหาก; ก่อนเปิดstagingหรือLINEจริงต้องระบุenvironment/OA/กลุ่มทดสอบ ผู้ทดสอบ และงบที่อนุญาต ไม่ต้องส่งsecretในแชท ไม่มีการสร้างenvironmentหรือเชื่อมบริการจากข้อเสนอฉบับนี้
