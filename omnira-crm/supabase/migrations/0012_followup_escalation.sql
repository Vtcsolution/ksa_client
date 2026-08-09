-- Tracks the last time a lead's overdue follow-up was auto-escalated, so the
-- escalation job can dedupe (a lead is only escalated once per follow-up
-- instance — rescheduling clears eligibility since the new dt is later than
-- this timestamp).
alter table leads add column if not exists followup_escalated_at timestamptz;
