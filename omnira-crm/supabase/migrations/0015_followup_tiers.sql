-- AI lead-tier follow-up cadence: every lead is sorted into cold/warm/hot/urgent
-- (see src/lib/followupCadence.ts) and worked through a timed sequence of
-- AI-drafted, queued WhatsApp touchpoints — see src/lib/supabase/followupCadence.ts
-- for the sweep that reads these columns.
alter table leads add column if not exists followup_tier text check (followup_tier in ('cold', 'warm', 'hot', 'urgent'));
alter table leads add column if not exists followup_tier_updated_at timestamptz;
alter table leads add column if not exists followup_cadence_started_at timestamptz;
alter table leads add column if not exists followup_step integer not null default 0;

create table if not exists followup_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  tier text not null,
  step integer not null,
  theme text not null,
  message_ar text not null,
  message_en text not null,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);
create index if not exists followup_messages_lead_idx on followup_messages(lead_id);

alter table followup_messages enable row level security;

-- Writes happen server-side via the service-role sweep only (same convention
-- as call_insights) — no insert/update policy for authenticated users.
create policy followup_messages_select on followup_messages for select
  to authenticated using (
    is_manager() or exists (select 1 from leads where leads.id = followup_messages.lead_id and leads.assigned_to = auth.uid())
  );
