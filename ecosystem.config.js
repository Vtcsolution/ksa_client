// PM2 process list for VPS deployment — two Next.js apps plus the
// recurring background sweeps each app depends on (Ziwo call polling,
// follow-up/feedback escalation, campaign scheduling). No Vercel Cron here,
// so these loops are what stand in for it.
//
// IMPORTANT: every app process below is pinned to instances: 1 (fork mode).
// Both apps keep in-memory state that is NOT safe across multiple workers —
// the leads/feedback/testimonials JSON-file stores use an in-process write
// lock (see Website/lib/leads/store.ts), and the public API routes use an
// in-memory rate-limit Map. Running either app in cluster mode or with more
// than 1 instance will silently break both of those.
//
// Usage:
//   pm2 start ecosystem.config.js
//   pm2 save && pm2 startup   (so it survives a VPS reboot)
//
// Both apps must already be built once (`npm install && npm run build` in
// each directory) before starting, and each directory's `.env.local` must
// be filled in with real production values first.

module.exports = {
  apps: [
    {
      name: 'omnira-crm',
      cwd: './omnira-crm',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3417 },
    },
    {
      name: 'omnira-crm-ziwo-poll',
      cwd: './omnira-crm',
      script: 'npx',
      args: 'tsx scripts/ziwo-poll-loop.ts',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'omnira-crm-followups-escalate',
      cwd: './omnira-crm',
      script: 'npx',
      args: 'tsx scripts/followup-escalation-loop.ts',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'omnira-website',
      cwd: './Website',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3500 },
    },
    {
      name: 'omnira-website-feedback-escalate',
      cwd: './Website',
      script: 'npx',
      args: 'tsx scripts/feedback-escalation-loop.ts',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'omnira-website-marketing-scheduler',
      cwd: './Website',
      script: 'npx',
      args: 'tsx scripts/campaign-scheduler-loop.ts',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
    },
  ],
};
