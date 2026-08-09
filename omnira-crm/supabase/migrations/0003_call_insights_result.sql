-- Adds the raw Ziwo call result (answered/no-answer/busy/cancel/...) as its
-- own column. Previously only embedded inside processing_log's first entry,
-- which made "was this call answered" unqueryable without JSON parsing —
-- needed to compute real answered-call counts (Dashboard/Weekly Report KPIs)
-- straight from call_insights instead of the old seeded lead.calls array.
alter table call_insights add column if not exists result text;

-- Backfill from the existing rows' processing_log (every row's first entry
-- is always the webhook_received stage, which carries the raw result).
update call_insights
set result = log_entry->>'result'
from (
  select id, processing_log->0 as log_entry
  from call_insights
) as backfill
where call_insights.id = backfill.id
  and call_insights.result is null
  and backfill.log_entry ? 'result';
