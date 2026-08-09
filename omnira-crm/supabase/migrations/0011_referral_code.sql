-- Referral program: every won client gets a shareable code a manager can hand
-- off, so they can refer other companies. The website's contact form has a
-- matching "referral code" field (captured there, not auto-validated against
-- this table — cross-referencing and rewarding stays a manual, human-reviewed
-- decision per the project's own "important decisions stay under human
-- review" principle, not an automated payout).
alter table leads add column if not exists referral_code text unique;
