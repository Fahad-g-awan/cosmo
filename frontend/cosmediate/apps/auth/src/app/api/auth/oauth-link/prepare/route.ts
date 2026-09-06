import { NextRequest, NextResponse } from "next/server";

import { oauthLinkStartApi } from "@cosmediate/api";
import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { authError } from "@cosmediate/type-utils";

import { resolveBackendOrigin } from "@auth/lib/resolve-backend-origin";
import {
  appendStateToAuthorizeUrl,
  storeOAuthLinkContext,
} from "@auth/lib/oauth-link-store";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      userId?: string;
      accessToken?: string;
      returnTo?: string;
      provider?: string;
      appOrigin?: string;
      appClientId?: string;
    };

    const {
      email,
      userId,
      accessToken,
      returnTo = "/settings/account/security/manage-password",
      provider = "google",
      appOrigin = "",
      appClientId = "",
    } = body;

    if (!email || !userId || !accessToken) {
      return authError("not_authenticated", "Not authenticated", {
        init: { headers: requestHeader(request) },
      });
    }

    if (!appClientId || !appOrigin) {
      return authError("invalid_request", "Missing app OAuth client context", {
        init: { headers: requestHeader(request) },
      });
    }

    const redirectUri = process.env.COGNITO_OAUTH_REDIRECT_URI;
    if (!redirectUri) {
      return authError(
        "server_misconfig",
        "COGNITO_OAUTH_REDIRECT_URI is not configured",
        { init: { headers: requestHeader(request) } },
      );
    }

    const identityProvider =
      provider.toLowerCase() === "google" ? "Google" : provider;

    const startRes = await oauthLinkStartApi(
      { redirectUri, identityProvider },
      accessToken,
      { origin: resolveBackendOrigin(request) },
    );

    if (!startRes.success || !startRes.authorizeUrl) {
      return NextResponse.json(startRes, {
        status: 400,
        headers: requestHeader(request),
      });
    }

    const linkSessionId = await storeOAuthLinkContext({
      returnTo,
      provider,
      email,
      userId,
      accessToken,
      authorizeUrl: startRes.authorizeUrl,
      redirectUri,
      appOrigin,
      appClientId,
      attempt: 0,
    });

    const authorizeUrl = appendStateToAuthorizeUrl(
      startRes.authorizeUrl,
      linkSessionId,
    );

    return NextResponse.json(
      { success: true, authorizeUrl },
      { status: 200, headers: requestHeader(request) },
    );
  } catch (error) {
    console.error("[auth:/api/oauth-link/prepare] Unexpected error", error);
    return authError(
      "server_error",
      error instanceof Error ? error.message : "Internal server error",
      { init: { headers: requestHeader(request) } },
    );
  }
}
