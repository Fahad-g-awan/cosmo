import {
  getCrossAppShortcutTargetUrl,
  getLocaleCookieDomain,
  isLocaleCode,
  LOCALE_COOKIE_NAME,
} from "@cosmediate/config";
import { NextRequest, NextResponse } from "next/server";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Auth IdP hosts the same `/home`, `/dashboard`, `/blog` shortcuts as client apps
 * so bookmarks and shared links resolve consistently from auth.cosmediate.* as well.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const shortcutTarget = getCrossAppShortcutTargetUrl(request, {
    pathname,
    search,
  });
  if (shortcutTarget) {
    return NextResponse.redirect(shortcutTarget);
  }

  const locale = request.nextUrl.searchParams.get("locale");
  if (locale && isLocaleCode(locale)) {
    const response = NextResponse.next();
    const domain = getLocaleCookieDomain(request.nextUrl.hostname);

    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_YEAR_SECONDS,
      ...(domain ? { domain } : {}),
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
