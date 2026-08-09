-- The webhook and the poll cycle can both see the same answered call at
-- nearly the same time and both decide to trigger analyzeZiwoCall() — each
-- one re-transcribes and re-analyzes the same recording in parallel, real
-- wasted OpenAI spend for every such overlap. This column is a short-lived
-- claim: processZiwoCallEvent atomically flips it from null before firing
-- analysis, so only the caller that wins the race actually starts it.
-- Cleared again when analysis finishes (success or fail) — see analysis.ts —
-- so a genuinely failed call can still be retried on the next sync.
alter table call_insights add column if not exists analysis_claimed_at timestamptz;
