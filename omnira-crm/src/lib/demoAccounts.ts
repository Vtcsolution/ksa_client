// Fixed demo credentials behind the login screen's one-click account buttons.
// These are demo-only accounts (seeded by scripts/seed.ts), not real secrets —
// the whole point of a one-click demo button is that the visitor never types
// a password, so exposing it in frontend code is fine here.

// `key` doubles as the seed profile's stored `name` AND the lookup key into
// the "users"/"auth" translation namespaces (e.g. messages/en.json users.u_mgr)
// — resolveUserName() and userDisplayName() route any profile whose stored
// name matches one of these through the translator instead of showing it raw.
export interface DemoAccount {
  key: "u_mgr" | "u_faris" | "u_azza";
  descKey: "managerDesc" | "faresDesc" | "azzaDesc";
  email: string;
  password: string;
  role: "manager" | "rep";
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { key: "u_mgr", descKey: "managerDesc", email: "manager@omnira-demo.local", password: "OmniraDemo!Manager1", role: "manager" },
  { key: "u_faris", descKey: "faresDesc", email: "faris@omnira-demo.local", password: "OmniraDemo!Faris1", role: "rep" },
  { key: "u_azza", descKey: "azzaDesc", email: "azza@omnira-demo.local", password: "OmniraDemo!Azza1", role: "rep" },
];

export const SEED_USER_NAME_KEYS: ReadonlySet<string> = new Set(DEMO_ACCOUNTS.map((a) => a.key));
