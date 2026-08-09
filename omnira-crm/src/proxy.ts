import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Login screen lives at the bare locale root ("/ar", "/en"); everything else
// under a locale is the authenticated app.
function isPublicPath(pathname: string) {
  return new RegExp(`^/(${routing.locales.join("|")})/?$`).test(pathname);
}

export default async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  // A locale-routing redirect (e.g. missing locale prefix) — let it happen;
  // the auth check re-runs on the request that follows.
  if (intlResponse.headers.get("location")) {
    return intlResponse;
  }

  let response = intlResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = intlMiddleware(request);
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const publicPath = isPublicPath(pathname);
  const locale = pathname.split("/")[1] || routing.defaultLocale;

  if (!user && !publicPath) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }
  if (user && publicPath) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
