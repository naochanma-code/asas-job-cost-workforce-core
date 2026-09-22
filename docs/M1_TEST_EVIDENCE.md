# M1 Test Evidence — 2026-09-21

## รอบเตรียม Staging — 2026-09-22

Baseline PR #2 head 5328b4273ef7c2536097747e63469392fdaa74a0 ตรวจ GitHub: Draft=true, merged=false, mergeable=true; main 0d5da8a, behind0/ahead2; [CI baseline 35610665915](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/35610665915) SUCCESS

เพิ่ม tests/staging-security.test.ts (HTTPS guard/cookie/CSRF/logout, rate-limit spoof/lockout/global, byte-exact signature/empty Verify) และ tests/native-restore.test.ts (isolated native PG schemas, Project A/B/Site/Job/assignment/audit/LINE mapping, no transient credentials, scope/revocationหลังrestore) ผลรอบสุดท้ายจะบันทึกด้านล่าง แยกจาก baseline

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
- Node runner 19 total: 18 PASS / 0 FAIL / 1 SKIP (native restore ต้อง TEST_DATABASE_URL; รอ CI PostgreSQL17)
- M0 regression 24+14+7 =45 checks PASS; git diff --check PASS
- ผลนี้มาจาก isolated M1 checkout ไม่มี migration003/time API ของ M2 ไม่มี real LINE หรือ staging transport
