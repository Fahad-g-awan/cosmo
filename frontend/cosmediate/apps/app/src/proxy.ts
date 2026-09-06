import {
  getCrossAppShortcutTargetUrl,
  runProxySessionGate,
  shouldBypassProxyAuthFlow,
  shouldBypassProxyInfrastructure,
} from "@cosmediate/config";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const shortcutTarget = getCrossAppShortcutTargetUrl(request, {
    pathname,
    search,
  });
  if (shortcutTarget) {
    return NextResponse.redirect(shortcutTarget);
  }

  if (shouldBypassProxyInfrastructure(pathname)) {
    return NextResponse.next();
  }

  if (shouldBypassProxyAuthFlow(pathname)) {
    return NextResponse.next();
  }

  return runProxySessionGate(request, { mode: "dashboard" });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
