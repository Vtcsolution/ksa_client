-- AI meeting summary: rep-entered notes on "mark meeting done", turned into
-- a structured recap by GPT (mirrors the Ziwo call-analysis pipeline, but
-- meetings have no recording/transcript source, so notes are the input).
alter table meetings add column if not exists notes text;
alter table meetings add column if not exists summary_ar text;
alter table meetings add column if not exists summary_en text;
alter table meetings add column if not exists next_steps_ar text;
alter table meetings add column if not exists next_steps_en text;
alter table meetings add column if not exists sentiment text;
alter table meetings add column if not exists summarized_at timestamptz;
