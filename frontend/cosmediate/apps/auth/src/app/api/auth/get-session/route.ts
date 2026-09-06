import { NextRequest, NextResponse } from "next/server";

import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { readIdpSessionSnapshot } from "@cosmediate/config";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

/**
 * Session query endpoint
 * Reads IdP `cos_idp_*` cookies (same `{ authenticated, session }` shape as client BFF get-session).
 */
export async function GET(request: NextRequest) {
  try {
    const clientAuthCtx = request.cookies.get("client_auth_ctx")?.value;
    const authContextId = request.cookies.get("cos_oauth_code")?.value;

    const idpSession = readIdpSessionSnapshot(
      (name) => request.cookies.get(name)?.value,
    );

    if (!idpSession) {
      return NextResponse.json(
        {
          authenticated: false,
          session: null,
          ...((!clientAuthCtx || !authContextId) && { authContext: false }),
        },
        { status: 200, headers: requestHeader(request) },
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        session: {
          sessionId: idpSession.session_id,
          identityId: idpSession.identity_id,
          profileId:
            idpSession.profile_id === "" ? null : idpSession.profile_id,
          userRole: idpSession.user_role,
          tokens: {
            accessToken: idpSession.access_token,
            accessTokenExpiresAt: idpSession.token_exp,
            refreshTokenExpiresAt: idpSession.refresh_exp,
          },
          ...((clientAuthCtx || authContextId) && { authContext: true }),
        },
      },
      { status: 200, headers: requestHeader(request) },
    );
  } catch (error) {
    console.error("[auth:/api/auth/get-session] Unexpected error", error);

    return NextResponse.json(
      {
        authenticated: false,
        session: null,
        error: "server_error",
      },
      { status: 500, headers: requestHeader(request) },
    );
  }
}
