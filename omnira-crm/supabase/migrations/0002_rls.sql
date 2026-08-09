-- Row Level Security — reps see only their own leads/activity, managers see everything.
--
-- Known limitation (flagged, not silently swept under the rug): RLS here is
-- row-level, matching the stated requirement exactly. A few actions that are
-- "manager-only" in the current UI (approve quote, delete lead, edit locked
-- fields) are enforced at the row level where that maps cleanly (e.g. quotes
-- UPDATE is manager-only outright). Where an action is really a column-level
-- restriction on a row the rep already owns (e.g. a rep editing fields on
-- their own lead that only a manager's UI exposes), RLS alone can't
-- distinguish that — the UI already gates it and continues to; hardening
-- that server-side would need per-column check functions, out of scope for
-- Milestone 1.

alter table profiles enable row level security;
alter table targets enable row level security;
alter table segments enable row level security;
alter table leads enable row level security;
alter table calls enable row level security;
alter table visits enable row level security;
alter table meetings enable row level security;
alter table quotes enable row level security;
alter table contracts enable row level security;
alter table activity_log enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table call_insights enable row level security;

-- security definer avoids RLS-recursion when a policy on another table
-- queries `profiles` to check the caller's role.
create function is_manager() returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'manager'
  );
$$ language sql security definer stable set search_path = public;

-- ===== profiles =====
create policy profiles_select on profiles for select
  to authenticated using (true); -- names/roles aren't sensitive; needed for assignment UI on both roles

create policy profiles_update on profiles for update
  to authenticated using (is_manager() or id = auth.uid());

-- ===== targets =====
create policy targets_select on targets for select
  to authenticated using (is_manager() or user_id = auth.uid());

create policy targets_upsert on targets for insert
  to authenticated with check (is_manager());

create policy targets_update on targets for update
  to authenticated using (is_manager());

-- ===== segments =====
create policy segments_select on segments for select
  to authenticated using (true);

create policy segments_insert on segments for insert
  to authenticated with check (is_manager());

-- ===== leads =====
create policy leads_select on leads for select
  to authenticated using (is_manager() or assigned_to = auth.uid());

create policy leads_insert on leads for insert
  to authenticated with check (is_manager() or assigned_to = auth.uid());

create policy leads_update on leads for update
  to authenticated using (is_manager() or assigned_to = auth.uid());

create policy leads_delete on leads for delete
  to authenticated using (is_manager());

-- ===== calls =====
create policy calls_select on calls for select
  to authenticated using (is_manager() or rep_id = auth.uid());

create policy calls_insert on calls for insert
  to authenticated with check (is_manager() or rep_id = auth.uid());

-- ===== visits =====
create policy visits_select on visits for select
  to authenticated using (is_manager() or rep_id = auth.uid());

create policy visits_insert on visits for insert
  to authenticated with check (is_manager() or rep_id = auth.uid());

create policy visits_update on visits for update
  to authenticated using (is_manager() or rep_id = auth.uid());

-- ===== meetings =====
create policy meetings_select on meetings for select
  to authenticated using (is_manager() or rep_id = auth.uid());

create policy meetings_insert on meetings for insert
  to authenticated with check (is_manager() or rep_id = auth.uid());

create policy meetings_update on meetings for update
  to authenticated using (is_manager() or rep_id = auth.uid());

-- ===== quotes ===== (approve/reject is manager-only outright — a real row-level fact)
create policy quotes_select on quotes for select
  to authenticated using (
    is_manager() or exists (select 1 from leads where leads.id = quotes.lead_id and leads.assigned_to = auth.uid())
  );

create policy quotes_insert on quotes for insert
  to authenticated with check (
    is_manager() or exists (select 1 from leads where leads.id = quotes.lead_id and leads.assigned_to = auth.uid())
  );

create policy quotes_update on quotes for update
  to authenticated using (is_manager());

-- ===== contracts =====
create policy contracts_select on contracts for select
  to authenticated using (
    is_manager() or exists (select 1 from leads where leads.id = contracts.lead_id and leads.assigned_to = auth.uid())
  );

create policy contracts_insert on contracts for insert
  to authenticated with check (
    is_manager() or exists (select 1 from leads where leads.id = contracts.lead_id and leads.assigned_to = auth.uid())
  );

-- ===== activity_log =====
create policy activity_log_select on activity_log for select
  to authenticated using (
    is_manager() or exists (select 1 from leads where leads.id = activity_log.lead_id and leads.assigned_to = auth.uid())
  );

create policy activity_log_insert on activity_log for insert
  to authenticated with check (
    is_manager() or exists (select 1 from leads where leads.id = activity_log.lead_id and leads.assigned_to = auth.uid())
  );

-- ===== audit_logs ===== (system-wide trail — manager visibility only)
create policy audit_logs_select on audit_logs for select
  to authenticated using (is_manager());

create policy audit_logs_insert on audit_logs for insert
  to authenticated with check (actor_id = auth.uid());

-- ===== notifications ===== (strictly personal — no manager override)
create policy notifications_select on notifications for select
  to authenticated using (user_id = auth.uid());

create policy notifications_update on notifications for update
  to authenticated using (user_id = auth.uid());

-- ===== call_insights ===== (writes happen server-side via service_role, which
-- bypasses RLS entirely — clients only ever read here)
create policy call_insights_select on call_insights for select
  to authenticated using (is_manager() or rep_id = auth.uid());
