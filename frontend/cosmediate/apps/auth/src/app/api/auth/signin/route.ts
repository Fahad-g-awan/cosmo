import { NextRequest, NextResponse } from "next/server";

import { userSignInApi } from "@cosmediate/api";
import { authError } from "@cosmediate/type-utils";
import {
  clearIdpSessionCookies,
  getClientAppUrl,
  setIdpSessionCookies,
} from "@cosmediate/config";
import type { SessionData } from "@auth/lib/oauth-context-store";
import {
  getOAuthContext,
  updateOAuthContext,
} from "@auth/lib/oauth-context-store";
import { resolveBackendOrigin } from "@auth/lib/resolve-backend-origin";
import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { debugAuth } from "@auth/lib/debug-log";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email = "",
      password = "",
      code = "",
    } = body as { email?: string; password?: string; code?: string };

    if (!code && (!email || !password)) {
      return authError("invalid_request", "Email and password are required", {
        init: { headers: requestHeader(request) },
      });
    }

    if (!email && !code) {
      return authError("invalid_request", "Auth code is required", {
        init: { headers: requestHeader(request) },
      });
    }

    let cognitoOauthRedirectUri: string | undefined;

    if (code) {
      cognitoOauthRedirectUri = process.env.COGNITO_OAUTH_REDIRECT_URI;
    }

    const signInResponse = await userSignInApi(
      {
        ...(!code && { email, password, method: "password" }),
        ...(code && {
          code,
          redirectUri: cognitoOauthRedirectUri,
          method: "code",
        }),
      },
      { origin: resolveBackendOrigin(request) },
    );
    const status = signInResponse.success ? 200 : 401;

    if (!signInResponse.success) {
      return NextResponse.json(signInResponse, {
        status,
        headers: requestHeader(request),
      });
    }

    if (!signInResponse.identityId || !signInResponse.role) {
      console.error(
        "[auth:/api/signin] Backend returned success:true without identityId/role",
      );
      return authError("server_error", "Invalid signin response from backend", {
        init: { headers: requestHeader(request) },
      });
    }

    debugAuth(
      "[auth:/api/signin] signInResponse.identityId",
      signInResponse.identityId,
    );

    const session: SessionData = {
      session_id: signInResponse.sessionId,
      identity_id: signInResponse.identityId,
      profile_id: signInResponse.profileId ?? "",
      user_role: signInResponse.role,
      access_token: signInResponse.accessToken,
      token_exp: signInResponse.accessTokenExpiresAt,
      refresh_exp: signInResponse.refreshTokenExpiresAt,
    };

    let redirectTo: string | undefined;
    const oauthCodeCookie = request.cookies.get("cos_oauth_code")?.value;

    if (oauthCodeCookie) {
      try {
        const ctx = await getOAuthContext({ oauthCode: oauthCodeCookie });

        if (!ctx) {
          console.warn("[auth:/api/signin] Missing OAuth context");

          return authError("invalid_request", "Missing OAuth context", {
            init: { headers: requestHeader(request) },
          });
        }

        const target = new URL(ctx.redirect_uri);
        target.searchParams.set("code", ctx.oauthCode);
        target.searchParams.set("return_to", ctx.return_to);

        redirectTo = target.toString();

        await updateOAuthContext({
          oauthCode: ctx.oauthCode,
          sessionData: session,
        });
        debugAuth("[auth:/api/signin] Stored session data in OAuth context");
      } catch (error) {
        console.error("[auth:/api/signin] Failed to build redirectTo", error);
        throw new Error("Failed to build redirectTo");
      }
    } else {
      redirectTo = getClientAppUrl("app", request);
      debugAuth(
        "[auth:/api/signin] Direct IdP signin — bootstrap redirect",
        redirectTo,
      );
    }

    const response = NextResponse.json(
      {
        ...signInResponse,
        redirectTo,
      },
      { status, headers: requestHeader(request) },
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
    console.error("[auth:/api/signin] Unexpected error", error);
    return authError(
      "server_error",
      error instanceof Error ? error.message : "Internal server error",
      { init: { headers: requestHeader(request) } },
    );
  }
}
