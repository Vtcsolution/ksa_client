import "server-only";

// Ziwo auth: POST /auth/login (form-urlencoded username/password/remember)
// returns { result: true, content: { ..., access_token: "<uuid>" }, info: {} }.
// Confirmed live against the real omneraone-poc account on 2026-08-04.
//
// Ziwo doesn't document an exact expiry for `remember=true` tokens ("valid
// for longer period" is all the docs say), so instead of guessing a TTL and
// pre-emptively refreshing, we cache the token until a real request comes
// back 401, then log in again and retry once. See ziwoFetch() below.
//
// Webhook receiving/signature verification is a separate, not-yet-built
// piece — waiting on the signing secret. This module only covers the
// outbound side: authenticating to call the Ziwo API ourselves.

interface ZiwoLoginResponse {
  result: boolean;
  content?: { access_token?: string };
  info?: unknown;
}

let cachedToken: string | null = null;
let loginPromise: Promise<string> | null = null;

function baseUrl(): string {
  const url = process.env.ZIWO_API_BASE_URL;
  if (!url) throw new Error("ZIWO_API_BASE_URL is not set");
  return url.replace(/\/+$/, "");
}

async function login(): Promise<string> {
  const email = process.env.ZIWO_LOGIN_EMAIL;
  const password = process.env.ZIWO_LOGIN_PASSWORD;
  if (!email || !password) throw new Error("ZIWO_LOGIN_EMAIL / ZIWO_LOGIN_PASSWORD are not set");

  const body = new URLSearchParams({ username: email, password, remember: "true" });
  const res = await fetch(`${baseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json().catch(() => null)) as ZiwoLoginResponse | null;
  const token = json?.content?.access_token;
  if (!res.ok || !json?.result || !token) {
    throw new Error(`Ziwo login failed (HTTP ${res.status}): ${JSON.stringify(json?.info ?? json)}`);
  }
  cachedToken = token;
  return token;
}

/** Logged-in access token, reused across calls until a 401 forces a re-login. */
export async function getZiwoAccessToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  if (!loginPromise) {
    loginPromise = login().finally(() => {
      loginPromise = null;
    });
  }
  return loginPromise;
}

/** Authenticated fetch against the Ziwo API — pass a path like "/profile" or "/info". */
export async function ziwoFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const doFetch = (accessToken: string) =>
    fetch(url, { ...init, headers: { ...(init.headers ?? {}), access_token: accessToken } });

  const token = await getZiwoAccessToken();
  let res = await doFetch(token);
  if (res.status === 401) {
    cachedToken = null;
    const fresh = await getZiwoAccessToken();
    res = await doFetch(fresh);
  }
  return res;
}
