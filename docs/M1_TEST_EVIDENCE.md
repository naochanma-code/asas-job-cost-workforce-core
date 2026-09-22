# M1 Test Evidence — 2026-09-21

## สถานะส่งต่อ Railway — 2026-09-22

- GitHub App: บันทึกและตรวจ Only select repositories = asas-job-cost-workforce-core เพียง1repo; Railway มองเห็น source แล้ว ไม่ต้องขออนุมัติสิทธิ์เดิมซ้ำ
- PostgreSQL18 template บน volume เปิด Online แล้วใน Trial เป็นฐานใหม่ ไม่มี app schema/ข้อมูลผู้ทดลอง; ไม่ถือ DEPLOYED_STAGING ของทั้งแอป
- API build ครั้งแรก 7c0efb71 ล้มเหลวที่ Railpack prepare: ใช้ main/M0 และ0variables ไม่ได้เริ่ม runtime. แก้ staging configuration เป็น branch codex/milestone-1-foundation + deploy/Dockerfile.api แล้ว แต่ยังไม่ deploy ใหม่
- API มี9 staged changes: 6variables (Dockerfile/NODE_ENV/HOST/PORT/LINE_ENABLED=false/DATABASE_URL reference), branch M1, restart NEVER, start pnpm bootstrap; Auto deploy disabled. Credential Postgres ผู้ดูแลใช้เฉพาะ bootstrap jobชั่วคราว ห้ามใช้เปิด HTTP runtime ต้องเปลี่ยนเป็น runtime roleและถอนbootstrap varsก่อน
- รอ Owner กรอก BOOTSTRAP_USERNAME/BOOTSTRAP_PASSWORD ใน Railway Variables เองอย่างน้อย12ตัว ไม่ส่งรหัสในแชท ไม่ใช้รหัส demo เดิม ยังไม่กด Deploy จนตรวจค่าตั้งต้นครบ
- ยังไม่สร้าง Web/worker; HTTPS/UAT/restore/DB role/TLS/real LINE ยัง NOT_RUN; ไม่อัปเกรดแผน/merge PR #2/M2/Production
- ข้อควรระวัง: Railway Deploy Changes อาจรวมบริการอื่นที่เปลี่ยนค้างไว้ ต้องตรวจ source commit/branch/commandของทุกserviceก่อนกด ไม่ถือรายการท้ายmodalว่าเป็นบริการเดียวที่จะเริ่ม


อัปเดตผล: commit 0d68bba push แล้ว; [CI 35709354964](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35709354964) SUCCESS ทุก step รวม native PostgreSQL, Next build, Docker Web/API build และ smoke health ทั้งสอง container, M0 45 checks. Owner อนุมัติ Railway GitHub App เฉพาะ Repository นี้แล้ว ตรวจพบ installation มีอยู่และเลือก All repositories จึงลดเป็น Only select repositories /asas-job-cost-workforce-core และตรวจค่าที่บันทึกแล้วสำเร็จ App เดิมมี read/write actions, administration, checks, code, statuses, deployments, PRs, workflows ไม่ได้เพิ่มชนิดสิทธิ์; ยังไม่ deploy.


## Railway Trial preparation — 2026-09-22

- tsc --noEmit: PASS
- tsx --test --test-concurrency=1 tests/*.test.ts: 20 total /19 PASS /0 FAIL /1 SKIP (native restore ไม่มี TEST_DATABASE_URL บนเครื่อง)
- runtime-schema test: SELECT อย่างเดียว, reject missing/modified/extra migrations PASS บน PGlite ไม่ใช่หลักฐาน runtime role บน Railway
- Docker build/Web smoke เพิ่มใน CI: PENDING รุ่นใหม่
- Railway UI: asas-m1-staging/environment staging สร้างแล้ว; Limited Trial $5/30วัน; ไม่มี service/deploy/DB/LINE traffic
- Configure GitHub App ถูก automatic approval review ปฏิเสธก่อนเปิด ต้องรับ Owner approval สำหรับ repository access ไม่มีการให้สิทธิ์สำเร็จ
- DEPLOYED_STAGING=NO, REAL_LINE=NOT_RUN, UAT_PASSED=NO; หลักฐานด้านล่างเป็น historical commit ตามที่ระบุ

## รอบเตรียม Staging — 2026-09-22

Baseline PR #2 head 5328b4273ef7c2536097747e63469392fdaa74a0 ตรวจ GitHub: Draft=true, merged=false, mergeable=true; main 0d5da8a, behind0/ahead2; [CI baseline 35610665915](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35610665915) SUCCESS

เพิ่ม tests/staging-security.test.ts (HTTPS guard/cookie/CSRF/logout, rate-limit spoof/lockout/global, byte-exact signature/empty Verify) และ tests/native-restore.test.ts (isolated native PG schemas, Project A/B/Site/Job/assignment/audit/LINE mapping, no transient credentials, scope/revocationหลังrestore) ผลรอบสุดท้ายบันทึกด้านล่าง แยกจาก baseline

Staging HTTPS/proxy/DB TLS, LINE จริง, provider restart/PITR/backup scheduler, Owner UAT ทั้งหมด **NOT_RUN** ไม่มีการสมัคร/ชำระเงิน/deploy/ส่งข้อความ และยังไม่ Ready to Merge

แผนทดสอบที่เตรียม: [matrix](M1_STAGING_TEST_MATRIX.md), [UAT](M1_OWNER_UAT.md), [pilot checklist](M1_LINE_PILOT_CHECKLIST.md), [deployment plan](M1_STAGING_PLAN.md) ไม่ใช้สถานะเอกสาร PREPARED เป็น TESTED_STAGING

## หลักฐานเดิม 2026-09-21

ผู้ทดสอบ: Codex · branch codex/milestone-1-foundation จาก main 0d5da8a · ข้อมูลทั้งหมดสมมติ

Artifact implementation ที่ตรวจ: `69c073944d8c2149e9d5f903af6da9b6d08a4ae3` · [Draft PR #2](https://github.com/naochanma-code/asas-job-cost-workforce-core/pull/2) · [GitHub Actions run 35610393373](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35610393373) verify job SUCCESS: frozen install, strict typecheck, PGlite tests, native PostgreSQL 17 tests, Next build และ M0 regression ทุก step ผ่าน

## ผลที่ตรวจแล้วบนเครื่อง

| การตรวจ | ผล / หลักฐาน |
| --- | --- |
| TypeScript strict | PASS `pnpm typecheck`; web tsconfig strict=true |
| Next build | PASS `pnpm build` สร้าง static route / และ API rewrite; ไม่มี deployment |
| Foundation API/database suite | PASS 9 subtests + parent ใช้ Fastify inject กับ PGlite PostgreSQL; tests/foundation.test.ts |
| Persistence/backup | PASS 1 test: ปิด–เปิดฐาน disk, consistent backup, restore ลงฐานว่าง, reject non-empty/tampered backup; tests/persistence.test.ts |
| Browser login + no Job | PASS บัญชี Admin จริงของ local test สร้างลูกค้า/Project A ที่ไม่มี Site/Job แล้วมอบหมาย TECH ไม่มีช่องถาม Job |
| Browser scope/persistence | PASS TECH เห็น A หลัง login และ refresh; TECH2 ไม่เห็น A; logout/login เป็น session จริง ไม่มี role selector |
| M0 regression | PASS 24 + 14 + 7 = 45 checks และ independent .NET ZIP reader; ไม่แก้ prototype |
| Dependency audit | PASS `pnpm audit --prod`: No known vulnerabilities found ณ วันที่ตรวจ ไม่ใช่ security audit ของระบบ |
| Native PostgreSQL 17 CI | PASS ชุด API/SQL/permission/LINE mock เดียวกันกับ local; backup disk case ยังคงใช้ PGlite ไม่ใช่ provider restore |
| Documentation links | PASS local links 96 รายการไม่มีไฟล์หาย; git diff --check ผ่าน |

Node test runner รายงาน 11 tests PASS (รวม parent 1 และ leaf cases 10); ไม่ใช่ 11 independent acceptance tasks

API cases ครอบคลุม missing/forged/expired session, CSRF Origin, wrong password, multiple Owner audit, Owner-only account creation, API ไม่มี password/financial fields, optional scope constraints, duplicate assignment rollback รวม audit, PM cross-scope/stale version/ถอนสิทธิ์, TECH forbidden edit, signed LINE body/destination/dedupe, one-use nonce, retry/lease, recheck access ก่อนส่ง, group wrong actor/expired/replay, unlink/deactivate/logout และ health

LINE transport เป็น fake sender ทั้งหมด ไม่มี request ไป LINE OA ผลนี้ไม่แทน real integration และไม่เป็น Owner UAT ของ M1

## ยังไม่ตรวจ / ข้อจำกัด

- Native PostgreSQL CI ผ่านตาม run ด้านบน; load/concurrency testing และ provider backup restore ยัง NOT_RUN
- HTTPS staging, DB TLS, secret rotation, reverse proxy rate limit และ provider backup/PITR: NOT_RUN
- LINE จริงกับ OA/กลุ่มที่ Owner มี: NOT_RUN รอระบุ environment/allowlist/credentials ผ่าน secret manager
- Owner UAT M1: NOT_RUN การยืนยัน 7 งานก่อนหน้านี้เป็น M0 เท่านั้น
- ไม่มี password recovery/MFA/role-change/group-rebind UI, automated backup scheduler หรือ DEAD payload TTL purge; ไม่มีเวลา/OT/ค่าใช้จ่าย/รูปบิลใน M1

สถานะ M1: IN_PROGRESS; ยังไม่ READY_TO_MERGE / UAT_PASSED / PRODUCTION_READY

## ผล local รอบเพิ่ม tests (2026-09-22)

- frozen offline install, strict typecheck และ Next build PASS
- Node runner 19 total: 18 PASS / 0 FAIL / 1 SKIP (native restore ต้อง TEST_DATABASE_URL; CI PostgreSQL17 ผ่านตามหลักฐานด้านล่าง)
- M0 regression 24+14+7 =45 checks PASS; git diff --check PASS
- ผลนี้มาจาก isolated M1 checkout ไม่มี migration003/time API ของ M2 ไม่มี real LINE หรือ staging transport

## ผล CI รอบ Staging preparation

Artifact code/tests/docs: 45be1acfe136338df8867dd3ba98ecd6f841a212; [Foundation run 35685633979](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35685633979), verify job 106611718741 SUCCESS ทุก step: frozen install/typecheck/PGlite tests/native PostgreSQL17 tests/Next build/M0 regression

Native restore case PASS จริงใน CI ไม่ได้ skip ใน native run: แยก source/target schemas, restore แล้ว reopen connection, ตรวจ A/B/Site/Job/assignment/audit/LINE mappings และทดสอบ scope กับการถอน assignment หลัง restore ไม่ใช่ provider backup/PITR หรือ Staging restart

Commit หลักฐานถัดจาก45be1acเปลี่ยนเอกสารเท่านั้น; ไม่อ้างว่า CI commitเก่าคือ headใหม่ ผล PRยังDraft/ไม่merge/ไม่deploy/M2พัก
