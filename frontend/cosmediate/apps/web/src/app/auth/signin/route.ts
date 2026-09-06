import { NextRequest, NextResponse } from "next/server";

import {
  getAuthAuthorizeUrl,
  getAuthCallbackUrl,
  getOrigin,
  isLocaleCode,
  readLocaleFromCookieHeader,
} from "@cosmediate/config";
import { authError } from "@cosmediate/type-utils";

export async function GET(request: NextRequest) {
  const errorMessage = request.nextUrl.searchParams.get("error_description");

  // Decision N3: URL param is `return_to` (renamed from `redirect_after_auth`).
  const returnTo = request.nextUrl.searchParams.get("return_to") || "/";

  const clientId = process.env.AUTH_CLIENT_ID;
  if (!clientId) {
    return authError("server_misconfig", "Missing auth configuration");
  }

  let authorizeUrl: string;
  try {
    authorizeUrl = getAuthAuthorizeUrl();
  } catch (err) {
    console.error("[web:/auth/signin]", err);
    return authError("server_misconfig", "Missing auth configuration");
  }

  const authUrl = new URL(authorizeUrl);
  authUrl.searchParams.set("redirect_uri", getAuthCallbackUrl(request));
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("app_origin", getOrigin(request));
  authUrl.searchParams.set("scope", "openid profile");

  if (errorMessage) {
    authUrl.searchParams.set("error_description", errorMessage);
  }

  authUrl.searchParams.set("return_to", returnTo);

  const localeParam = request.nextUrl.searchParams.get("locale");
  const locale =
    localeParam && isLocaleCode(localeParam)
      ? localeParam
      : readLocaleFromCookieHeader(request.headers.get("cookie"));
  if (locale) {
    authUrl.searchParams.set("locale", locale);
  }

  return NextResponse.redirect(authUrl.toString());
}
