-- Package prices/hours and the quote minimum were hardcoded constants
-- (src/lib/constants.ts PACKAGES/MIN_PRICE) baked into the frontend bundle —
-- a real business risk, since changing a price required a code deploy. This
-- makes them DB-editable by managers. The three packages themselves stay a
-- fixed set (silver/gold/platinum) — that identity is coded into quote
-- validation logic (platinum = custom/no-minimum) in QuoteModal.tsx and
-- useAppStore's sendQuote action; only the numbers become editable, not the
-- package list shape. Names stay in i18n (brand-consistent labels, not
-- something a manager needs to retranslate).
create table pricing_packages (
  id text primary key, -- 'silver' | 'gold' | 'platinum'
  price numeric, -- null = custom/negotiable (platinum)
  hours int, -- null = not hour-based
  updated_at timestamptz not null default now()
);

create table pricing_settings (
  id boolean primary key default true,
  min_price numeric not null default 4000,
  constraint pricing_settings_singleton check (id)
);

insert into pricing_packages (id, price, hours) values
  ('silver', 5000, 8),
  ('gold', 6500, 12),
  ('platinum', null, null);

insert into pricing_settings (min_price) values (4000);

alter table pricing_packages enable row level security;
alter table pricing_settings enable row level security;

create policy pricing_packages_select on pricing_packages for select to authenticated using (true);
create policy pricing_packages_update on pricing_packages for update to authenticated using (is_manager());

create policy pricing_settings_select on pricing_settings for select to authenticated using (true);
create policy pricing_settings_update on pricing_settings for update to authenticated using (is_manager());
