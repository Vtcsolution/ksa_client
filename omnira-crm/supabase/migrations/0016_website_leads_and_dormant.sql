-- Website contact-form inquiries now create a real CRM lead directly (see
-- /api/leads/from-website) instead of only living in the Website's own
-- read-only "Website Inquiries" list — so they enter the same tiered
-- follow-up pipeline as everything else, unassigned until a manager triages.
alter type lead_source add value if not exists 'website';

-- Marks the moment a lead's cold/warm/hot cadence ran out of touchpoints
-- with no status change — i.e. "we tried, they went quiet." Distinct from
-- followup_tier itself so a dormant lead still shows which tier it stalled
-- at. Cleared when someone manually restarts the cadence.
alter table leads add column if not exists followup_dormant_at timestamptz;
