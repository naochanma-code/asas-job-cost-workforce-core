# ADR-005 — หลักฐานใน Core และ export ที่ตรวจย้อนกลับได้

- วันที่ 2026-09-21; baseline D-003/MASTER §10; month/retention details Proposed Q-06
- Context: LINE/Drive ไม่ควรเป็นที่เก็บต้นฉบับถาวร; expense หลายภาพทำให้ sum manifest ซ้ำได้
- Proposal: private S3-compatible binary + PostgreSQL metadata/hash; typed amount, no OCR requirement; object IDs ไม่มี PII; authorized short-lived signed downloads; immutable replacement lineage
- Export snapshot ตาม expense_date เดือนเวลาไทย (Q-06) กับ approved revision ณ cutoff; ZIP files + evidence manifest หนึ่ง row/evidence + expenses register หนึ่ง row/expense + metadata/checksums; total คิด unique expense ไม่ sum evidence rows
- Generation versioned, re-run explicit request สร้าง revision; retry request key เดิมใช้ run เดิม; changed source ทำ revision ใหม่และ supersedes เก่า; ไฟล์ขาดให้ FAILED ห้าม success partial ZIP
- Alternatives: public shared drive link ถาวรทำ auth ยาก; overwrite filename/history ทำพิสูจน์ย้อนหลังไม่ได้; generic payroll+expense bundle เปิดข้อมูลค่าจ้างแก่ Admin
- Consequences: export มีข้อมูลส่วนบุคคลจริงในระบบอนาคตแต่ห้ามเข้า Git; revoke rights ต้อง deny new download; short-lived links มี residual expiry window ต้องกำหนดอายุจริงก่อน production
- Retention provisional 7 ปี configurable; legal hold/deletion approval/backups ต้องให้บัญชี/Owner ยืนยันก่อน production ไม่อ้าง compliance พร้อม
- Validation: 2 expense/3 evidence ยอดไม่ซ้ำ, hash/count/readability, unsafe filename/formula injection, revision, missing file, backup restore metadata+binary; ไม่มี Drive integration ใน M0
