-- Notifications previously stored final rendered English text (title/body),
-- which can't display correctly in Arabic. Switching to the same kind+params
-- pattern already used by activity_log/LogLine.tsx: the frontend renders via
-- t(`notif.${kind}`, params), so notifications are bilingual like everything
-- else. title/body stay as unused legacy columns (nullable, harmless).
alter table notifications add column if not exists params jsonb not null default '{}';
