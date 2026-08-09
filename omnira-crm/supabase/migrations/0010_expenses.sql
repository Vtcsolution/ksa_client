-- Revenue & Expense tracking. Revenue already exists for real (the
-- `contracts` table, populated whenever a quote is approved) — this only
-- adds the missing half: manually logged company expenses, so managers can
-- see real profit (revenue - expenses), not just revenue alone. Manager-only
-- end to end (financial data, not something reps need visibility into).
create table expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric not null,
  category text not null default 'other',
  expense_date date not null default current_date,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index expenses_date_idx on expenses (expense_date desc);

alter table expenses enable row level security;

create policy expenses_select on expenses for select to authenticated using (is_manager());
create policy expenses_insert on expenses for insert to authenticated with check (is_manager());
create policy expenses_delete on expenses for delete to authenticated using (is_manager());
