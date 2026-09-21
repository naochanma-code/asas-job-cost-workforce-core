# ADR-006 — Modular monolith และขอบเขต process prototype

- วันที่ 2026-09-21; confirmed architectural baseline MASTER §8/14/19
- Context: ต้องพิสูจน์ flow เล็กก่อนเพิ่มขอบเขตและไม่ reuse legacy source/schema โดยอัตโนมัติ
- Design: TypeScript strict; Next.js web, Node.js/Fastify API, persistent worker, PostgreSQL, S3-compatible private objects; business application services ร่วม Web/LINE; contracts/domain/database/ui แยก modules; ไม่มี route handler เรียกข้าม Web/LINE
- Modules: identity, customer/project/job, assignment, budget, time/OT, expense/evidence, cost ledger, payroll, accounting export, LINE, reporting, audit/ops; opportunity เป็น future boundary หลัง pilot
- M0 ทำเฉพาะ Markdown, Mermaid, HTML process mock และ verification ของ fixture; ไม่ scaffold apps/packages, install production dependencies, migrate DB, deploy หรือ connect LINE
- Hosting/provider/domain/queue tuning defer จน owner pilot checklist; ไม่เลือกหรือซื้อบริการจาก ADR นี้
- Alternatives: microservices เพิ่ม operational burden ก่อน core flow; import legacy DB อาจดึงข้อผิดพลาดเดิม; หน้าเมนูว่างทุก module ไม่พิสูจน์ประโยชน์
- Consequences: Owner ต้องผ่าน 7-task process gate ก่อน M1; local prototype ไม่ใช่ API/security/load/reliability proof
- Validation: docs traceability + local mock smoke + manual Owner task record; integration/deployment/real LINE/UAT แยก NOT_RUN
