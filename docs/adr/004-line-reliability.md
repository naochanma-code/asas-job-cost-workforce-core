# ADR-004 — Durable inbox/outbox และการแยก draft

- วันที่ 2026-09-21; baseline MASTER §3.4/9; status DESIGN ONLY
- Context: webhook response ก่อน durable save และ request background ไม่รับประกันการทำงาน; รูปในกลุ่มเสี่ยงสลับคน/flow
- Proposal: raw body signature + size/schema → inbox durable commit keyed(channel,event) → 200; worker lease + bounded retry/dead queue; atomic business effect/outbox; replay key เดิมไม่ post ใหม่
- Draft isolation key channel/source kind/source ID/sender/Project/nullable Job/flow ID; image event unique channel/message; หลาย draft ของคนเดียวไม่เดา ให้เลือก private; ภาพดาวน์โหลดเข้า private storage หลังรับ durable โดยเร็ว
- Reply fail ไม่ลบธุรกิจ; push fallback/outbox ส่งแบบตรวจสิทธิ์และ deduplicate; error logs ใช้ category/correlation เท่านั้น
- Alternatives: latest group image/draft ผูกผิดคน; waitUntil/request background เป็นหลักเสี่ยงสูญหาย; distributed queue/provider-specific lock-in ยังไม่จำเป็นกับ monolith
- Consequences: ต้องมี worker ต่อเนื่อง, replay admin tool แบบ audit, expired reply token handling; เลือก backoff/attempt/TTL ระหว่าง implementation ตาม provider contract และ throughput จริง
- Validation deferred: raw signature, redelivery, crash before/after commit, lease expired, storage failure, 2 senders interleaved, 2 flows same sender, stale project binding; ตรวจ official LINE docs ซ้ำเมื่อเริ่ม implementation ยังไม่มี live OA ใน M0
