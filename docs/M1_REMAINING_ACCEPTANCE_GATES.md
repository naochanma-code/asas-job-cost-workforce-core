# M1 — Remaining acceptance gates

วันที่26กันยายน2026 · ผู้ดูแลCodex · ไม่ใช่การอนุมัติปิดMilestone

เกณฑ์ M1 ตาม `MASTER_PROMPT.md` อยู่ที่ Foundation, ADMIN สร้าง Project/Job และ Assign Team, TECH เห็นงานจริงใน LINE, และ Project ไม่มี Site/Job ทำ flow ได้ครบ. ตารางนี้รวมการตรวจความมั่นใจและรายการข้าม Milestone ด้วย ไม่ได้แปลว่าทุกแถวเป็นข้อความ Gate ของ M1. ตาม D-037 Owner เลื่อน provider browser recovery ไปหลัง M3/ก่อน Pilot; สถานะ `DEFERRED_BY_OWNER / NOT_RUN` ต้องแจ้งเป็นข้อยกเว้นเมื่อพิจารณารับ M1.

| Gate | มีหลักฐานอะไรแล้ว | ยังต้องพิสูจน์อะไร | ทางดำเนินการ |
| --- | --- | --- | --- |
| M1 flow correlation | Admin Web สร้าง/มอบหมาย A และสร้าง Job B ผ่าน; TECH LINE เห็น Pilot A ไม่มี Site/Job ผ่าน แต่เป็นคนละ fixture/date. SELECT read-only ยืนยัน Pilot A creator/assignment เป็น OWNER. Synthetic Admin→TECH fake-LINE ใน Project เดียวผ่าน | หลักฐาน Admin-create/assign → TECH-LINE จริงใน Project เดียว หากจะอ้าง live flow เดียวครบ | ระบุข้อจำกัดต่อ Owner ในรอบรับ M1; ไม่เพิ่ม allowlistหรือทำซ้ำเอง. หาก Owner ต้องการ proof เพิ่มให้วางขั้น UAT รวมภายใน scope ที่อนุมัติ |
| TECH Job scope | LINEเห็นเฉพาะB; restored HTTP/APIแสดงเฉพาะJobที่มอบหมาย ไม่แสดงsibling | หน้าจอWebด้วยTECHบนStaging | ใช้บัญชีสมมติที่ได้รับอนุญาต ไม่เปลี่ยนบัญชี/รหัสจริง; Sessionปัจจุบันเป็นLogin |
| Browser recovery (หลัง M3) | encrypted isolated recoveryเดิม, Native/API regression และ Local browser บนฐานสมมติ PASS | BrowserLoginหลังrestore, Sessionเก่าถูกปฏิเสธ, scope/logout บน provider recovery ที่แยก | D-037 เลื่อน C2 ก่อน Pilot; `DEFERRED_BY_OWNER / NOT_RUN`. ตรวจ Trial/topology/ข้อมูลสมมติใหม่เมื่อถึงเวลา; localไม่แทนprovider |
| LINE expiry | รหัสหมดอายุจริง, Ownerแจ้งส่ง, binding/auditไม่เปลี่ยน | เชื่อมโยงการลองหลังexpiryกับผลปฏิเสธโดยไม่สับสนกับoverwriteguard | คงPARTIAL; ไม่อ่านpayloadย้อนหลังหรือปลอมeventเพื่อเติมPASS |
| LINE replay | ส่งเดิมซ้ำไม่เปลี่ยนbinding/audit | แยกsingle-useจากexpiryในprovider | automatedแยกกรณีผ่าน; providerยังไม่อ้างisolatedPASS |
| LINE identity lifecycle | accountlink/jobsของสามroleผ่าน; automatedunlink/nonceผ่าน | providerunlink/relink, nonceซ้ำ/หมดอายุ, wrongactorตามrunbook | ต้องใช้LINEของผู้ทดลองจริงและวางรอบเดียวให้ชัด ไม่ขอpassword |
| Scope beyond bounded pilot | automatedสองTECH/หลายprojectผ่าน | providerT1/T2แยกกันภายใต้ผู้ทดลองที่อนุมัติ | ขอบเขตปัจจุบันTECHหนึ่งคน ห้ามเพิ่มallowlistเอง |
| Backup operations | manualbackup/restoreผ่าน | ผู้รับผิดชอบ ตารางสำรอง ระยะเก็บ ทดสอบกู้คืน และหลักฐานแจ้งเตือน | ฝากคำถามOwnerแล้ว; ตรวจค่าใช้จ่ายก่อนเสนอเปิดจริง |
| Production resilience | boundedtrialเท่านั้น | PITR/off-providerDR/scale/observabilityครบ | ยังนอกการDeployProduction ไม่ซื้อหรือเปิดโดยอัตโนมัติ |
| M1 acceptance | ผลUATบางflowผ่าน; C2 เลื่อนตาม D-037 | Ownerรับข้อจำกัด/ผลตามGate M1 และข้อยกเว้น C2 ชัดเจน; Merge เป็นคำตัดสินแยก | ยังไม่MergePR2หรือเริ่มM2 |

อย่าแก้ gate เป็นPASSจากการมีหน้า/API/testfileหรือจากคำตอบข้อความทั่วไปเพียงอย่างเดียว. สรุปแยก CODED / TESTED / DEPLOYED / UAT_PASSED เสมอ. ห้ามลบbindingจริง สลับroleจริง หรือกู้คืนทับStagingเพื่อทำให้testครบ

26กันยายน: DailyBackupถูกOwnerเลื่อนจนงานใกล้เสร็จ (DEFERRED_BY_OWNER/NOT_ENABLED) ไม่ถือPASSและไม่บล็อกงานพัฒนาปัจจุบัน; RestoreเฉพาะOWNERยังคงเดิม
