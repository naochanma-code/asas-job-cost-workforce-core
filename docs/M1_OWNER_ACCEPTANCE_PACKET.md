# M1 — ชุดหลักฐานให้ Owner พิจารณารับงาน

## 26 กันยายน 2026 — C3 Owner unlink/relink ผ่านรอบจริง

Owner กดยกเลิกการเชื่อมด้วยตนเอง แล้วรายงานว่าส่ง “งานของฉัน” และระบบให้เชื่อมบัญชีก่อน ไม่แสดงงาน. หลังเปิดลิงก์ใหม่ เชื่อมกลับบัญชี Owner เดิม และส่ง “งานของฉัน” Owner ยืนยันเห็น PILOT LINE A/B ถูกต้อง. สถานะ C3 = UAT_PASSED เฉพาะ lifecycle รอบนี้ ตามรายงาน Owner.

Codex ตรวจฐานแบบอ่านอย่างเดียว: LINE_UNLINKED เวลา 2026-09-26T16:50:56.073Z และ LINE_LINKED เวลา 16:52:41.260Z มี actor เดียวกันซึ่งเป็น OWNER; currently_linked=true. ไม่อ่านหรือบันทึก LINE ID/token/payload. ยืนยันกลับ Core account เดิมจาก audit; ตัวตน LINE เดิมยึดตามรายงาน Owner ไม่อ้าง raw-ID comparison.

C4 nonce expiry/reuse และ C5 isolated group-code wrong actor/expiry/replay ยัง PARTIAL/NOT_RUN ตามข้อจำกัดเดิม ไม่ใช้ C3 แทนผลเหล่านี้. ไม่ต้องทำ unlink/relink ซ้ำ. ยังไม่รับ M1 ทั้งหมด ไม่ Merge/M2/Production; ไม่มี app/schema/deployment เปลี่ยนจากการบันทึกนี้.


## ผล C1 ล่าสุด — 26 กันยายน 2026

C1 ทดสอบโดย Codex บน Web Staging แล้ว: บัญชี TECH สมมติเห็นเฉพาะ B/Job ที่มอบหมาย ไม่เห็น A/sibling/ปุ่มจัดการ; refresh ผ่าน และหลังปิดบัญชี/expire session กลับหน้า Login. Injected deployed API ให้ A404/B200/users403. Browser direct API URL ถูกเครื่องมือบล็อก จึงไม่ใช้ผล injected API อ้างเป็น browser HTTP. หลักฐานใน M1_TEST_EVIDENCE.md; ไม่ขอ Owner ทำ C1 ซ้ำ. ข้อความ C1 NOT_RUN ด้านล่างเป็นแผนก่อนผลนี้ ส่วน C3–C5 ยังต้องใช้ LINE ผู้ทดลองจริง.


26 กันยายน 2026 · ผู้จัดทำ Codex · `PREPARED / NOT_ACCEPTED` · [UAT รอบรวม](M1_CONSOLIDATED_OWNER_UAT.md) · [รายละเอียดหลักฐาน](M1_TEST_EVIDENCE.md)

เอกสารนี้สรุปเฉพาะ Milestone 1 ตาม `MASTER_PROMPT.md` §17 ไม่แทนหลักฐานรายขั้นหรือคำอนุมัติ Merge/Deploy. PR #2 ยัง Draft; release บน Staging คือ `dc289ee3088cd84639cc828b49a6f5c50a665f55`. [CI 36252716794](https://github.com/naochanma-code/asas-job-cost-workforce-core/actions/runs/36252716794) ที่ commit `a025be9` SUCCESS; commit เอกสารหลังจากนี้ต้องตรวจ CI แยกและยังไม่ได้ deploy. อย่าใช้ผล CI แทนผล Staging.

| ข้อใน M1 | หลักฐานที่มี | ขอบเขตของผล |
| --- | --- | --- |
| Repository, Environment, Authentication, Roles | Staging Web/API/Postgres/LINE worker online; Login/Logout และกรณี role ที่บันทึกไว้ผ่าน local/CI กับ Staging ตาม [PROJECT_STATUS](PROJECT_STATUS.md) | CODED / TESTED / DEPLOYED_STAGING เฉพาะกรณีที่ตรวจแล้ว; Web TECH Job/sibling/refresh ผ่าน C1; direct browser API tool-blocked แต่ deployed injected API ผ่าน; ไม่ใช่ Production |
| Customer, optional Site, Project, optional Job, configurable types | Admin สร้าง Customer/Project ไม่มี Site/Job และอีก Project ที่มี Site/Job ผ่าน Web Staging; Owner ยืนยันสร้าง Job ผ่านหลังแก้ UI; type/Job/Project API และ PostgreSQL regression ผ่าน. `PRJ-3511fa71` มี Job 1/audit 1 และ Codex เห็น Job ในหน้า OWNER ทั้งสองส่วนหลัง refresh | Web UAT เฉพาะรายการสมมติที่บันทึก; การแสดงผลปัจจุบันตรวจด้วย session Owner โดย Codex ไม่ใช่ Owner ยืนยันรอบใหม่; สาเหตุการกดครั้งแรกยังไม่ทราบ |
| Assignment และ Audit | Admin มอบหมาย TECH ให้ Project ที่ไม่มี Job ผ่าน Web; Job-level assignment/revoke และ audit บน Pilot ผ่าน; automated permission/isolation ผ่าน | Project Web ของ Admin กับ LINE Pilot เป็นคนละ fixture |
| LINE Account Linking และ Group Binding | Owner/Admin/TECH เชื่อมบัญชีและเห็นงานตามบทบาทใน bounded Pilot; กลุ่มเดียวผูก Pilot A และมี successful audit 1 | UAT จริงภายใน 3 คน/1 กลุ่ม/2 Project สมมติ; isolated negative cases ยัง PARTIAL/NOT_RUN |
| Gate: TECH เห็นงานจริงใน LINE โดย Project ไม่มี Site/Job ใช้ได้ | TECH เห็น Pilot A ที่ไม่มี Site/Job แล้ว; หลัง revoke ไม่เห็น A และหลัง assign Job B เห็น B ตามรายงาน Owner กับ backend/audit. Synthetic test ใหม่ตรวจ Admin-create/assign → TECH fake-LINE ใน Project เดียวผ่าน | Pilot A ถูกสร้างและมอบหมายโดย OWNER ตาม SELECT read-only 26 ก.ย.; synthetic test ไม่แทน Admin→TECH LINE จริงใน Project เดียว |

## รายการที่ต้องตรวจหรือตัดสินขอบเขตในรอบรับ M1

1. **C1 Web TECH บน Staging:** ตรวจแล้วตามผลด้านบน ไม่ต้องให้ Owner ทำซ้ำ; direct browser API เป็นข้อจำกัดเครื่องมือ ไม่ใช่ FAIL ของระบบ.
2. **ความเชื่อมโยง Gate:** หลักฐาน Admin Web กับ TECH LINE พิสูจน์ความสามารถแยกกัน แต่ไม่ใช่ Project เดียว. ให้ Owner พิจารณาว่ายอมรับหลักฐานแยกพร้อมข้อจำกัดนี้หรือขอ flow เดียวเพิ่มเติม. กรณีเพิ่มต้องตกลง Project/LINE allowlist และผู้ทดลองก่อน; Codex ไม่ขยายเอง.
3. **LINE security live cases C3–C5:** unlink/relink, nonce expiry/reuse, wrong actor และ group code expiry/replay ยัง `PARTIAL/NOT_RUN` บน provider แม้ automated tests ผ่าน. ให้ Owner เลือกว่าจะรันกรณีใดใน UAT จริงหรือรับเป็นข้อจำกัดที่ระบุชัด; Master ไม่ได้ระบุว่าทุก negative case ต้องผ่าน live provider ก่อน M1. กรณีที่ไม่อนุมัติหรือแยกสาเหตุไม่ได้คงสถานะเดิม ไม่ใช้ binding เดิมหรือ overwrite guard แทน isolated PASS. รายละเอียดอยู่ใน [UAT รอบรวม](M1_CONSOLIDATED_OWNER_UAT.md).
4. **Owner acceptance:** หลังรายงานผลและข้อจำกัดจริง ให้ Owner ตัดสินการรับ M1. การ Merge PR #2 เป็นคำตัดสินแยกและยังไม่ได้รับอนุญาต.

## รายการที่มีคำตัดสินเลื่อนไปแล้ว

- **C2 provider browser recovery:** D-037 ให้ทดสอบหลัง M3 ก่อน Pilot; `DEFERRED_BY_OWNER / NOT_RUN`. Local/CI synthetic recovery ผ่านตามขอบเขต แต่ไม่เป็น provider PASS. ยังไม่สร้าง Railway environment เพิ่ม; เมื่อจำเป็นในรอบหลัง M3 ต้องตรวจ Trial/topology/cost/ข้อมูลสมมติแยก.
- **Daily Backup:** Owner ให้รอช่วงงานใกล้ปิด; `DEFERRED_BY_OWNER / NOT_ENABLED`. Restore เฉพาะ OWNER เป็นข้อกำหนด D-035 ที่ยังไม่ได้พิสูจน์การบังคับ provider/CLI. ไม่ใช้ผล manual backup แทน schedule/PITR.

รอบนี้ไม่เปิด LINE scope ใหม่ ไม่เปลี่ยนข้อมูลจริง ไม่สร้าง resource/ใช้บริการเสียเงิน ไม่ Deploy Production และไม่ Merge PR #2.
