# M1 Alignment — Staging Evidence 24 September 2026

Owner อนุมัติปลายทาง encrypted backup/isolated restore และ migration003/grants/maintenance/deployment SHA โดยเฉพาะก่อนดำเนินการ (D-025) ไม่มีการเปลี่ยนแผนหรือเพิ่มบริการเสียเงิน

## Release และผลฐานข้อมูล

- API/Web source: cda461dd3ca540f91b5857e245304aa2c1fe41f7; [CI SUCCESS](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35887509129)
- API deployment: cb7a260d-b7b7-4708-a66b-4f21825413b5; Web: c20c1348-a03e-4273-a28e-9e387c622bea — SUCCESS
- Web: https://web-staging-cb6f.up.railway.app/ ; /api/health HTTP200 database ready หลัง deploy และ restart
- Migration003 canonical LF SHA256: f5cae6dac8b1f485ccef9cb084e3d576aa9ff468dcb402fa251ad276ec3b94ef
- MIGRATION_003_COMMITTED; LEGACY_BUSINESS_DATA_UNCHANGED_PASS; TYPE_COUNTS=5/10 ก่อนเพิ่ม PILOT; MIGRATIONS=3
- NEW_TABLES_MIGRATOR_OWNED=true; RUNTIME_CODE_REWRITE_DENIED=true; runtime verifier privileges/schema/verifiedTLS PASS ก่อน/หลัง restart
- LINE_ENABLED=false; API public domains ไม่มี ใช้ Web HTTPS เชื่อม private API

## Backup และ Recovery

Encrypted backup บน volume เดิม /var/lib/postgresql/data/asas-m1-backup-20260924 และดาวน์โหลดเฉพาะ ciphertext/กุญแจที่ห่อแล้ว/metadata ไป C:\Users\ghost\AppData\Local\ASAS-CoreApp\backups\m1-20260924\pre-alignment นอก OneDrive/Git

AES-256-CBC/PBKDF2-SHA256 200000 iterations + random salt16; random passphrase ห่อด้วย RSA3072 OAEP-SHA256 กุญแจ private ป้องกัน Windows CurrentUser DPAPI/ACL ไม่บันทึก plaintext dump หรือ passphrase; ถอดรหัสตรวจ checksum ใน memory เท่านั้น

Cipher SHA256: e112c47ef29fd206fe872c6c2272fa57db3a918d50c5fe8cc3a9980bc2791183

Restore native pg_dump ลงฐานใหม่ m1_recovery_20260924_alignment โดยไม่ overwrite Staging; runtime CONNECT=false ตรวจ counts/digests ของ 11 business tables ตรงกัน ไม่มีค่ารายบุคคลในหลักฐาน ไม่รวม transient session/login/LINE nonce/inbox/outbox data

ผล: ENCRYPTED_BACKUP_AND_ISOLATED_RECOVERY_PASS; RUNTIME_CANNOT_CONNECT_TO_RECOVERY_PASS; OFF_PROVIDER_BACKUP_DECRYPTED_CHECKSUM_PASS

Recovery นี้ตรวจความครบถ้วนตามอนุมัติ ไม่ใช่ใช้ข้อมูลจริงทดสอบ feature/migration; dry run migration ใช้ฐานสมมติแยกตาม CI เดิม Backup เป็น pre-alignment snapshot ต้องรักษา high-water/code registry เมื่อกู้หลังมี writes ใหม่ ไม่ถือว่าครอบคลุม writes หลัง snapshot

## Live HTTPS checks — 24 PASS / 0 FAIL

ทดสอบผ่าน public Web HTTPS ไป private API ใช้ข้อมูลใหม่ชื่อ PILOT และรหัสผ่านสุ่มใน memory เท่านั้น

- Runtime schema/TLS และ LINE disabled: 1
- Login และ Secure/HttpOnly/SameSite=Strict cookie สำหรับ Owner/Admin/PM/PM2/TECH/TECH2: 12
- Owner สร้างบัญชีสมมติ; Admin เพิ่ม/แก้ชื่อ/เรียงประเภท: 2
- Project A ไม่มี Site/Job และ rich fields; Project B มี Site/หลาย Job พร้อม concurrent unique codes: 2
- TECH assigned visibility และ cross-project/job-only isolation: 2
- PM ถูกปฏิเสธจัดการ project อื่น/บัญชี/role/แต่งตั้งPM/assign privileged roles/cross-project Job: 1
- Revoke สิทธิ์หายทันที และ assignment/revoke audit: 1
- Disable Project Type/Job Type ยังรักษาข้อมูลเก่าและปฏิเสธการใช้ใหม่: 2
- CSRF foreign origin403, logout401 และ forced expiry เฉพาะ synthetic session401: 1

PILOT_HTTPS_FUNCTIONAL_PASS 24; PILOT_SYNTHETIC_ACCOUNTS_DISABLED; PILOT_ACTIVE_ACCOUNTS=0 — ไม่แจก credential ทดสอบ ไม่ลบ audit/ข้อมูล PILOT หรือแก้รายการจริง

Restart API/Web แล้ว RESTART_DATA_DIGEST_PASS; health/runtime guard PASS ตรวจ log ล่าสุดสูงสุด100รายการต่อบริการใน memory ไม่พบรูปแบบ DB URL/private key/bearer/password ที่สแกน ไม่ใช่การรับรองทุก historical log

## ข้อจำกัด / NOT_RUN

- Owner UAT และ authenticated browser/mobile รุ่นใหม่ยัง NOT_RUN; HTTP/API checks ไม่ใช่ browser E2E
- Live rate-limit load test ไม่รันรอบนี้; ใช้ Local/CI evidence เดิม ไม่เปิด LINE จริง
- ไม่มี scheduled backup/PITR; recovery key ผูก Windows profile เครื่องนี้ ยังไม่มี cross-device escrow
- Trial usage ที่ CLI รายงานหลังงานประมาณ $0.1795 ไม่ใช่การอนุมัติจ่ายเงิน ไม่เพิ่มบริการ/upgrade
- PR #2 คง Draft ไม่ Merge ไม่เริ่ม M2/M3/Production; เอกสาร commit หลัง release ไม่เปลี่ยน source ที่ deploy

ตรวจเอกสารหลังอัปเดต: check-m0.mjs 24 PASS, check-r2.mjs 14 PASS, check-r4.mjs 7 PASS รวม45; ไม่มี application code change ใน commit หลักฐานนี้

## Follow-up deployed — 24 September 2026

Owner อนุมัติรุ่น80c2868หลังเสนอ release และยืนยันให้ทำ process ต่อ API/Web exact80c2868b46f766ea0eb6da5e6c50eed617f6be7c SUCCESS:

- API e22c570d-1293-4b48-82a7-d8ee6c1e4f34
- Web 36629910-ef20-4761-8fc3-9918fdf5f719
- ไม่มี migration, LINE=false, Trial usage ที่ตรวจก่อนDeployประมาณ$0.202 ไม่เพิ่มบริการ/upgrade
- /api/health200/database ready; runtime/TLS/schema PASS; secret-pattern log sample PASS
- 8 targeted HTTPS checks PASS: runtime, capabilityfalse, no-siteProject, Owner create/read twice, PM create/read twice, disabledLINE503/no-code-side-effect; synthetic account cleanup disable PASS
- UIอ่านอย่างเดียวหลังRefresh: ปุ่มLINEหาย, Job listใกล้ฟอร์ม/empty-stateแสดง. Current browser rolePM; ไม่เปลี่ยนข้อมูลจริง
- โครงการที่ Owner รายงาน: read-only count Job0/JOB_CREATED audit0 ไม่พบการบันทึกสำเร็จ ยังไม่รู้สาเหตุการส่งครั้งก่อน ไม่ใช้ข้อมูลจริงเป็นfixtureและไม่สร้างJobซ้ำให้
- Owner UAT JobยังOPEN_ISSUE; actual browser form submissionด้วยfixtureรอบนี้NOT_RUN (แยกจากHTTP/APIchecks)

## Seed type hotfix — 24 September 2026

API8e47f04343c131ddc7b4af40856183542ce5f1e8 deployed SUCCESS in55fecd13-bfb2-4fb0-ae15-cc822ef4f641; Web80c2868 unchanged. No migration/seed/data rewrite. Root causeD-028 reproduced using actual Web serializers then fixed by canonical type-only identifier validation.

CI36013717502 SUCCESS: Local35PASS/2SKIP, Native PostgreSQL37PASS/0SKIP, typecheck/build/containers/smoke/M0. LiveHTTPS29checks PASS: runtime/TLS/schema/LINEfalse, capabilityfalse, noSiteProject, Owner10+PM10 seeded Job create/read with responsible PM fixture and null planned_date,5seededProject create/read, disabledLINE no binding code. Fixture accounts disabled automatically; no changes to real rows or master type configuration.

Health200/database ready and API sample100log entries no scanned secret pattern. Native and HTTP tests cover shipped seed IDs explicitly; previous custom/default-only tests were insufficient. Owner form UAT remains pending; no claim of live browser submission of real data.
