import type { Database } from "../database/index";

// Clear only queue content. Keep event IDs, delivery state/history and audit.
export async function expireLinePayloads(db: Database): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.query(`UPDATE notification_outbox o SET payload='{}',
      state=CASE WHEN o.state IN ('SENT','CANCELLED') THEN o.state ELSE 'DEAD' END,
      lease_until=NULL,last_error_category='PAYLOAD_EXPIRED'
      FROM line_event_inbox e WHERE o.event_id=e.id
      AND e.received_at<=now()-interval '24 hours' AND o.payload<>'{}'::jsonb`);
    await tx.query(`UPDATE line_event_inbox SET payload='{}',
      state=CASE WHEN state='DONE' THEN state ELSE 'DEAD' END,lease_until=NULL
      WHERE received_at<=now()-interval '24 hours' AND payload<>'{}'::jsonb`);
  });
}
