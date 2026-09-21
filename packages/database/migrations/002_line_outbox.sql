CREATE TABLE notification_outbox (
 id uuid PRIMARY KEY, event_id text UNIQUE NOT NULL REFERENCES line_event_inbox(id),
 payload jsonb NOT NULL, state text NOT NULL DEFAULT 'PENDING', attempts integer NOT NULL DEFAULT 0,
 next_attempt_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz, last_error_category text
);
