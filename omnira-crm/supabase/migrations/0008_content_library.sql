-- Content Library was 100% fake (a hardcoded 4-item array, "Upload" button
-- was just a toast). This makes it real: a table + a public Storage bucket,
-- so managers can actually upload brochures/menus and reps can actually send
-- them to clients. Starts empty on purpose — no fabricated placeholder rows.
create table content_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  file_type text not null default 'other', -- 'pdf' | 'image' | 'doc' | 'link' | 'other'
  storage_path text, -- path within the content-library bucket; null for type='link'
  external_url text, -- for type='link'; null otherwise
  file_size int,
  uploaded_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index content_items_created_at_idx on content_items (created_at desc);

alter table content_items enable row level security;

-- Whole team can see/use the library; only managers curate it (upload/delete).
create policy content_items_select on content_items for select
  to authenticated using (true);
create policy content_items_insert on content_items for insert
  to authenticated with check (is_manager());
create policy content_items_delete on content_items for delete
  to authenticated using (is_manager());

insert into storage.buckets (id, name, public)
values ('content-library', 'content-library', true)
on conflict (id) do nothing;

-- Public bucket needs no SELECT policy (Supabase serves public objects via a
-- public URL that bypasses RLS) — only writes need gating.
create policy content_library_insert on storage.objects for insert
  to authenticated with check (bucket_id = 'content-library' and public.is_manager());
create policy content_library_delete on storage.objects for delete
  to authenticated using (bucket_id = 'content-library' and public.is_manager());
