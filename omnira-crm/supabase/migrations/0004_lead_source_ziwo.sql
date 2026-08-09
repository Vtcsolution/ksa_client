-- Real callers who ring in/get called via Ziwo but don't match any existing
-- lead by phone were previously left as orphaned call_insights rows (visible
-- on Call Intelligence but invisible on All Clients). This adds a 'ziwo'
-- lead source so processZiwoCallEvent can auto-create a lead for them,
-- keeping the client list in sync with real call activity.
alter type lead_source add value if not exists 'ziwo';
