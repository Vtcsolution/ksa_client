import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { runPollCycle } from "@/lib/ziwo/pollCycle";

/**
 * Session-authed equivalent of /api/ziwo/poll, safe to call from the
 * browser. This is what the "Sync Ziwo Calls" button on the Call
 * Intelligence page hits (visible to both roles); the button previously
 * just showed a toast and did nothing real. Any logged-in user may trigger
 * it — it's a data refresh, not a privileged action.
 */
export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await runPollCycle();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
