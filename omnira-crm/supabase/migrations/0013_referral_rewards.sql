-- Which referral code (if any) brought this lead in — set manually by staff
-- when they cross-reference a Website-captured code against a real CRM
-- referral_code (see LeadDetailModal's "Referred by code" field).
alter table leads add column if not exists referred_by_code text;

-- One row per successful referral payout, created automatically the moment
-- a lead with referred_by_code set is marked "won" (see setResultWon in
-- src/lib/supabase/mutations.ts) — status stays "pending" until a manager
-- reviews it, matching this project's "human review" pattern for every
-- rewards/verification decision.
create table if not exists referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_lead_id uuid not null references leads(id) on delete cascade,
  referred_lead_id uuid not null references leads(id) on delete cascade,
  referral_code text not null,
  points integer not null default 500,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected')),
  decided_by uuid references profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists referral_rewards_referrer_idx on referral_rewards(referrer_lead_id);
create index if not exists referral_rewards_status_idx on referral_rewards(status);

alter table referral_rewards enable row level security;

-- Insert is unrestricted because it's created automatically the moment a
-- REP marks a referred lead "won" (setResultWon runs under the rep's own
-- session, not an admin client) — but only managers can see or decide the
-- reward itself, matching the expenses table's manager-only pattern.
create policy referral_rewards_select on referral_rewards for select to authenticated using (is_manager());
create policy referral_rewards_insert on referral_rewards for insert to authenticated with check (true);
create policy referral_rewards_update on referral_rewards for update to authenticated using (is_manager());
