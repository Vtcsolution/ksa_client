-- Leads gain a real email column (was only ever stuffed into free-text notes
-- for website-sourced leads) so the follow-up cadence can send an email
-- version of each touchpoint alongside the WhatsApp queue, wherever an email
-- is actually on file — see src/lib/supabase/followupCadence.ts.
alter table leads add column if not exists email text;
