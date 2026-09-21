# M1 Test Evidence — 2026-09-21

ผู้ทดสอบ: Codex · branch codex/milestone-1-foundation จาก main 0d5da8a · ข้อมูลทั้งหมดสมมติ

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

Node test runner รายงาน 11 tests PASS (รวม parent 1 และ leaf cases 10); ไม่ใช่ 11 independent acceptance tasks

API cases ครอบคลุม missing/forged/expired session, CSRF Origin, wrong password, multiple Owner audit, Owner-only account creation, API ไม่มี password/financial fields, optional scope constraints, duplicate assignment rollback รวม audit, PM cross-scope/stale version/ถอนสิทธิ์, TECH forbidden edit, signed LINE body/destination/dedupe, one-use nonce, retry/lease, recheck access ก่อนส่ง, group wrong actor/expired/replay, unlink/deactivate/logout และ health

LINE transport เป็น fake sender ทั้งหมด ไม่มี request ไป LINE OA ผลนี้ไม่แทน real integration และไม่เป็น Owner UAT ของ M1

## ยังไม่ตรวจ / ข้อจำกัด

- Native PostgreSQL CI: รอตรวจ workflow หลัง push ห้ามอ้างผล PGlite แทน
- HTTPS staging, DB TLS, secret rotation, reverse proxy rate limit และ provider backup/PITR: NOT_RUN
- LINE จริงกับ OA/กลุ่มที่ Owner มี: NOT_RUN รอระบุ environment/allowlist/credentials ผ่าน secret manager
- Owner UAT M1: NOT_RUN การยืนยัน 7 งานก่อนหน้านี้เป็น M0 เท่านั้น
- ไม่มี password recovery/MFA/role-change/group-rebind UI, automated backup scheduler หรือ DEAD payload TTL purge; ไม่มีเวลา/OT/ค่าใช้จ่าย/รูปบิลใน M1

สถานะ M1: IN_PROGRESS; ยังไม่ READY_TO_MERGE / UAT_PASSED / PRODUCTION_READY
