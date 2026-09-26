# M1 — Remaining acceptance gates

วันที่26กันยายน2026 · ผู้ดูแลCodex · ไม่ใช่การอนุมัติปิดMilestone

| Gate | มีหลักฐานอะไรแล้ว | ยังต้องพิสูจน์อะไร | ทางดำเนินการ |
| --- | --- | --- | --- |
| TECH Job scope | LINEเห็นเฉพาะB; restored HTTP/APIแสดงเฉพาะJobที่มอบหมาย ไม่แสดงsibling | หน้าจอWebด้วยTECHบนStaging | ใช้บัญชีสมมติที่ได้รับอนุญาต ไม่เปลี่ยนบัญชี/รหัสจริง; Sessionปัจจุบันเป็นLogin |
| Browser recovery | encrypted isolated recoveryเดิม, Native/API regression และ Local browser บนฐานสมมติ PASS | BrowserLoginหลังrestore, Sessionเก่าถูกปฏิเสธ, scope/logout บน provider recovery ที่แยก | ทำตามM1_BROWSER_RECOVERY_CHECKLIST; localไม่แทนprovider |
| LINE expiry | รหัสหมดอายุจริง, Ownerแจ้งส่ง, binding/auditไม่เปลี่ยน | เชื่อมโยงการลองหลังexpiryกับผลปฏิเสธโดยไม่สับสนกับoverwriteguard | คงPARTIAL; ไม่อ่านpayloadย้อนหลังหรือปลอมeventเพื่อเติมPASS |
| LINE replay | ส่งเดิมซ้ำไม่เปลี่ยนbinding/audit | แยกsingle-useจากexpiryในprovider | automatedแยกกรณีผ่าน; providerยังไม่อ้างisolatedPASS |
| LINE identity lifecycle | accountlink/jobsของสามroleผ่าน; automatedunlink/nonceผ่าน | providerunlink/relink, nonceซ้ำ/หมดอายุ, wrongactorตามrunbook | ต้องใช้LINEของผู้ทดลองจริงและวางรอบเดียวให้ชัด ไม่ขอpassword |
| Scope beyond bounded pilot | automatedสองTECH/หลายprojectผ่าน | providerT1/T2แยกกันภายใต้ผู้ทดลองที่อนุมัติ | ขอบเขตปัจจุบันTECHหนึ่งคน ห้ามเพิ่มallowlistเอง |
| Backup operations | manualbackup/restoreผ่าน | ผู้รับผิดชอบ ตารางสำรอง ระยะเก็บ ทดสอบกู้คืน และหลักฐานแจ้งเตือน | ฝากคำถามOwnerแล้ว; ตรวจค่าใช้จ่ายก่อนเสนอเปิดจริง |
| Production resilience | boundedtrialเท่านั้น | PITR/off-providerDR/scale/observabilityครบ | ยังนอกการDeployProduction ไม่ซื้อหรือเปิดโดยอัตโนมัติ |
| M1 acceptance | ผลUATบางflowผ่าน | Ownerรับข้อจำกัด/ผลครบตามDoDและยืนยันMerge | ยังไม่MergePR2หรือเริ่มM2 |

อย่าแก้ gate เป็นPASSจากการมีหน้า/API/testfileหรือจากคำตอบข้อความทั่วไปเพียงอย่างเดียว. สรุปแยก CODED / TESTED / DEPLOYED / UAT_PASSED เสมอ. ห้ามลบbindingจริง สลับroleจริง หรือกู้คืนทับStagingเพื่อทำให้testครบ

26กันยายน: DailyBackupถูกOwnerเลื่อนจนงานใกล้เสร็จ (DEFERRED_BY_OWNER/NOT_ENABLED) ไม่ถือPASSและไม่บล็อกงานพัฒนาปัจจุบัน; RestoreเฉพาะOWNERยังคงเดิม
