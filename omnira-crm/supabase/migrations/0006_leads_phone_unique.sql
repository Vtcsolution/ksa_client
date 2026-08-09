-- Phone was already treated as the natural dedup key everywhere (importLeads,
-- addFieldLead, fixLeadContact all check-before-insert), just never enforced
-- at the DB level. That left a real race: the Ziwo webhook and the poll
-- cycle can both discover the same never-before-seen number at nearly the
-- same time and both try to auto-create a lead for it. Enforcing uniqueness
-- turns that race into a clean, catchable conflict instead of a silent
-- duplicate lead — see the catch block in processZiwoCallEvent.
create unique index if not exists leads_phone_unique_idx on leads (phone);
