-- Omnira Valet CRM — core schema (Milestone 1a)
--
-- Design notes (decisions made without stopping to ask, per instruction to
-- not interrupt mid-build — flagged here for review):
--
-- 1. `profiles` extends `auth.users` (1:1 via shared id) since Supabase Auth's
--    own table only carries email/password — role/name/permissions live here.
-- 2. `segments.id` stays TEXT with the exact seed slugs ("hotels", "restaurants",
--    "malls", "hospitals", "halls", "complexes") because the frontend's
--    SegmentIcon component switches on that exact string — using generated
--    UUIDs would silently break every segment icon in the UI.
-- 3. `visits`/`meetings`/`calls` all carry a denormalized `rep_id` (in addition
--    to `lead_id`) — this matches how the UI actually queries ("my meetings
--    today") and keeps RLS policies a direct column check instead of a join.
-- 4. `daily_stats` is a VIEW computed from calls/visits/meetings, not a table —
--    avoids a second source of truth that could drift from the real records.
-- 5. No physical `reports` table: the Weekly Report page is a live, computed
--    view over existing data in the current UI (no "save/lock a report"
--    feature exists) — nothing to migrate. Revisit if that changes.
-- 6. `notifications` and `call_insights` are included now (schema-complete)
--    but stay unpopulated until Milestone 1c wires the Ziwo/OpenAI pipeline —
--    the Call Intelligence page keeps reading its mock data until then.

create extension if not exists "pgcrypto";

-- ===== enums =====
create type user_role as enum ('manager', 'rep');
create type lead_source as enum ('excel', 'field');
create type lead_status as enum ('new', 'contacted', 'interested', 'followup', 'meeting', 'won', 'archived');
create type call_answered as enum ('answered', 'noanswer', 'busy');
create type meeting_type as enum ('inperson', 'online');
create type quote_status as enum ('pending', 'approved', 'rejected');
create type contract_via as enum ('meeting', 'direct');
create type call_insight_status as enum ('processing', 'analyzed');
create type call_sentiment as enum ('positive', 'neutral', 'negative');
create type buying_intent as enum ('low', 'medium', 'high');

-- ===== profiles (staff/users) =====
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  name_en text,
  role user_role not null default 'rep',
  -- matches DEFAULT_PERMS in src/lib/constants.ts (all true; `transfer` gets
  -- overridden explicitly per-account by /api/staff based on the chosen role)
  perm_transfer boolean not null default true,
  perm_receive boolean not null default true,
  perm_add_field boolean not null default true,
  perm_meetings boolean not null default true,
  perm_quote boolean not null default true,
  perm_content boolean not null default true,
  checked_in boolean not null default false,
  check_in_time timestamptz,
  created_at timestamptz not null default now()
);

-- ===== targets (current goal config, 1:1 per rep) =====
create table targets (
  user_id uuid primary key references profiles (id) on delete cascade,
  daily_calls int not null default 0,
  daily_visits int not null default 0,
  weekly_meetings int not null default 0,
  monthly_contracts int not null default 0,
  updated_at timestamptz not null default now()
);

-- ===== segments =====
create table segments (
  id text primary key,
  name_key text,
  custom_name text,
  created_at timestamptz not null default now(),
  constraint segments_name_check check (name_key is not null or custom_name is not null)
);

-- ===== leads =====
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  phone text not null,
  location text not null default '',
  segment_id text references segments (id),
  source lead_source not null default 'excel',
  status lead_status not null default 'new',
  assigned_to uuid references profiles (id),
  notes text not null default '',
  result text,
  result_reason_key text,
  phone_edits int not null default 0,
  mtg_postponed int not null default 0,
  transferred_from uuid references profiles (id),
  transferred_at timestamptz,
  decision_maker_name text,
  decision_maker_name_en text,
  decision_maker_phone text,
  discount_official numeric,
  discount_given numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_idx on leads (status);
create index leads_assigned_to_idx on leads (assigned_to);
create index leads_segment_id_idx on leads (segment_id);
create index leads_updated_at_idx on leads (updated_at desc);
create index leads_phone_idx on leads (phone);

-- ===== calls (call_history) =====
create table calls (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  rep_id uuid references profiles (id),
  dur_sec int not null default 0,
  answered call_answered not null,
  note text,
  at timestamptz not null default now()
);

create index calls_lead_id_idx on calls (lead_id);
create index calls_rep_id_at_idx on calls (rep_id, at);

-- ===== visits =====
create table visits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  rep_id uuid references profiles (id),
  verified boolean not null default false,
  reviewed boolean,
  note text,
  contact text,
  at timestamptz not null default now()
);

create index visits_lead_id_idx on visits (lead_id);
create index visits_rep_id_at_idx on visits (rep_id, at);

-- ===== meetings =====
create table meetings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  rep_id uuid references profiles (id),
  type meeting_type not null,
  dt timestamptz not null,
  done boolean not null default false,
  missed boolean not null default false,
  missed_reason_key text,
  proof boolean not null default false,
  created_at timestamptz not null default now()
);

create index meetings_lead_id_idx on meetings (lead_id);
create index meetings_rep_id_dt_idx on meetings (rep_id, dt);
create index meetings_dt_idx on meetings (dt) where not done and not missed;

-- ===== quotes =====
create table quotes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  count int not null default 1,
  price numeric not null,
  total numeric not null,
  status quote_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index quotes_lead_id_idx on quotes (lead_id);
create index quotes_status_idx on quotes (status);

-- ===== contracts (won leads) =====
create table contracts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references leads (id) on delete cascade,
  months int not null,
  monthly numeric not null,
  total numeric not null,
  via contract_via not null,
  created_at timestamptz not null default now()
);

-- ===== activity_log (per-lead timeline) =====
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  who_id uuid references profiles (id),
  key text not null,
  params jsonb,
  at timestamptz not null default now()
);

create index activity_log_lead_id_idx on activity_log (lead_id, at desc);

-- ===== audit_logs (system-wide, non-lead-scoped actions) =====
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id),
  action text not null,
  entity_type text not null,
  entity_id text,
  meta jsonb,
  at timestamptz not null default now()
);

create index audit_logs_at_idx on audit_logs (at desc);

-- ===== notifications =====
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  lead_id uuid references leads (id) on delete cascade,
  kind text not null,
  title text,
  body text,
  urgent boolean not null default false,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on notifications (user_id, read, created_at desc);

-- ===== call_insights (Ziwo + OpenAI pipeline — populated in Milestone 1c) =====
create table call_insights (
  id uuid primary key default gen_random_uuid(),
  ziwo_call_id text not null unique,
  lead_id uuid references leads (id),
  rep_id uuid references profiles (id),
  lead_phone text,
  at timestamptz,
  dur_sec int,
  status call_insight_status not null default 'processing',
  recording_url text,
  transcript jsonb,
  summary_ar text,
  summary_en text,
  sentiment call_sentiment,
  sentiment_score int,
  intent_ar text,
  intent_en text,
  buying_intent buying_intent,
  lead_score int,
  objections jsonb,
  action_items jsonb,
  ai_notes_ar text,
  ai_notes_en text,
  next_followup_channel text,
  next_followup_at timestamptz,
  next_followup_recommendation_ar text,
  next_followup_recommendation_en text,
  whatsapp_sent boolean not null default false,
  processing_log jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index call_insights_lead_id_idx on call_insights (lead_id);
create index call_insights_rep_id_idx on call_insights (rep_id);

-- ===== daily_stats (computed view, not a stored table) =====
create view daily_stats as
with c as (
  select rep_id as user_id, date_trunc('day', at) as day, count(*) as calls
  from calls
  where rep_id is not null
  group by rep_id, date_trunc('day', at)
),
v as (
  select rep_id as user_id, date_trunc('day', at) as day, count(*) as visits
  from visits
  where rep_id is not null
  group by rep_id, date_trunc('day', at)
),
m as (
  select rep_id as user_id, date_trunc('day', dt) as day, count(*) as meetings
  from meetings
  where rep_id is not null
  group by rep_id, date_trunc('day', dt)
)
select
  coalesce(c.user_id, v.user_id, m.user_id) as user_id,
  coalesce(c.day, v.day, m.day) as day,
  coalesce(c.calls, 0) as calls,
  coalesce(v.visits, 0) as visits,
  coalesce(m.meetings, 0) as meetings
from c
full outer join v on v.user_id = c.user_id and v.day = c.day
full outer join m on m.user_id = coalesce(c.user_id, v.user_id) and m.day = coalesce(c.day, v.day);

-- ===== updated_at trigger for leads =====
create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_set_updated_at
  before update on leads
  for each row
  execute function set_updated_at();

-- ===== auto-create a profile row when a new auth user signs up =====
create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'rep')
  );
  insert into public.targets (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();
