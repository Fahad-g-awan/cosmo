import { NextRequest, NextResponse } from "next/server";

import { oauthLinkCallbackApi } from "@cosmediate/api";
import {
  clearIdpSessionCookies,
  readIdpSessionSnapshot,
  setIdpSessionCookies,
} from "@cosmediate/config";
import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { authError } from "@cosmediate/type-utils";

import {
  deleteOAuthLinkContext,
  getOAuthLinkContext,
} from "@auth/lib/oauth-link-store";
import { resolveBackendOrigin } from "@auth/lib/resolve-backend-origin";
import { buildSpOAuthHandoffUrl } from "@auth/lib/sp-oauth-handoff";
import type { SessionData } from "@auth/lib/oauth-context-store";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      linkSessionId?: string;
      code?: string;
    };

    const { linkSessionId, code } = body;

    if (!linkSessionId || !code) {
      return authError(
        "invalid_request",
        "linkSessionId and code are required",
        {
          init: { headers: requestHeader(request) },
        },
      );
    }

    const linkCtx = await getOAuthLinkContext(linkSessionId);
    if (!linkCtx) {
      return authError(
        "invalid_request",
        "Link session expired. Please try again.",
        {
          init: { headers: requestHeader(request) },
        },
      );
    }

    const callbackRes = await oauthLinkCallbackApi(
      {
        email: linkCtx.email,
        userId: linkCtx.userId,
        code,
        redirectUri: linkCtx.redirectUri,
        identityProvider: linkCtx.provider,
      },
      linkCtx.accessToken,
      { origin: resolveBackendOrigin(request) },
    );

    if (!callbackRes.success) {
      return NextResponse.json(callbackRes, {
        status: 400,
        headers: requestHeader(request),
      });
    }

    const idpSnap = readIdpSessionSnapshot(
      (name) => request.cookies.get(name)?.value,
    );

    const session: SessionData = {
      session_id:
        callbackRes.sessionId ??
        idpSnap?.session_id ??
        `link-${linkSessionId.slice(0, 8)}`,
      identity_id:
        callbackRes.identityId ?? idpSnap?.identity_id ?? linkCtx.userId,
      profile_id: callbackRes.profileId ?? idpSnap?.profile_id ?? "",
      user_role: callbackRes.role ?? idpSnap?.user_role ?? "PATIENT",
      access_token: callbackRes.accessToken ?? linkCtx.accessToken,
      token_exp: callbackRes.accessTokenExpiresAt ?? idpSnap?.token_exp ?? 0,
      refresh_exp:
        callbackRes.refreshTokenExpiresAt ?? idpSnap?.refresh_exp ?? 0,
    };

    if (!session.access_token) {
      return authError(
        "server_error",
        "Invalid session after account linking",
        {
          init: { headers: requestHeader(request) },
        },
      );
    }

    const returnTo = `${linkCtx.returnTo}${linkCtx.returnTo.includes("?") ? "&" : "?"}linked=google`;

    const redirectUrl = await buildSpOAuthHandoffUrl(request, session, {
      appOrigin: linkCtx.appOrigin,
      appClientId: linkCtx.appClientId,
      returnTo,
    });

    await deleteOAuthLinkContext(linkSessionId);

    const response = NextResponse.json(
      { success: true, redirectUrl },
      { status: 200, headers: requestHeader(request) },
    );

    clearIdpSessionCookies(response);
    setIdpSessionCookies(response, {
      session_id: session.session_id,
      access_token: session.access_token,
      token_exp: session.token_exp,
      refresh_exp: session.refresh_exp,
      identity_id: session.identity_id,
      profile_id: session.profile_id,
      user_role: session.user_role,
    });

    return response;
  } catch (error) {
    console.error("[auth:/api/oauth-link/complete] Unexpected error", error);
    return authError(
      "server_error",
      error instanceof Error ? error.message : "Internal server error",
      { init: { headers: requestHeader(request) } },
    );
  }
}
