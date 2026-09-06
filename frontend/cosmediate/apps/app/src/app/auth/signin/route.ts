import { NextRequest, NextResponse } from "next/server";

import {
  getAuthAuthorizeUrl,
  getAuthClearSessionUrl,
  getOrigin,
  getAuthCallbackUrl,
  isLocaleCode,
  readLocaleFromCookieHeader,
} from "@cosmediate/config";
import { authError } from "@cosmediate/type-utils";

import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("mode");

  const errorMessage = request.nextUrl.searchParams.get("error_description");

  // Decision N3: URL param is `return_to` (renamed from `redirect_after_auth`).
  const returnTo = request.nextUrl.searchParams.get("return_to") || "/";

  const clientId = process.env.AUTH_CLIENT_ID;
  if (!clientId) {
    return authError("server_misconfig", "Missing auth configuration", {
      init: { headers: requestHeader(request) },
    });
  }

  let authorizeUrl: string;
  let clearSessionUrl: string;
  try {
    authorizeUrl = getAuthAuthorizeUrl();
    clearSessionUrl = getAuthClearSessionUrl();
  } catch (err) {
    console.error("[app:/auth/signin]", err);
    return authError("server_misconfig", "Missing auth configuration", {
      init: { headers: requestHeader(request) },
    });
  }

  if (mode === "update_password") {
    return NextResponse.redirect(clearSessionUrl);
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
