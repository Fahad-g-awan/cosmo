import { NextRequest, NextResponse } from "next/server";

import { userSignUpConfirmApi } from "@cosmediate/api";
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
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      code?: string;
      password?: string;
    };

    const { email, code, password } = body;

    if (!email || !code) {
      return authError("invalid_request", "Email and code are required", {
        init: { headers: requestHeader(request) },
      });
    }

    const apiRes = await userSignUpConfirmApi(
      {
        email,
        code,
        ...(password ? { password } : {}),
      },
      { origin: resolveBackendOrigin(request) },
    );

    if (!apiRes.success) {
      return NextResponse.json(apiRes, {
        status: 400,
        headers: requestHeader(request),
      });
    }

    const hasSession =
      Boolean(apiRes.sessionId) &&
      Boolean(apiRes.accessToken) &&
      Boolean(apiRes.identityId) &&
      Boolean(apiRes.role) &&
      typeof apiRes.accessTokenExpiresAt === "number" &&
      typeof apiRes.refreshTokenExpiresAt === "number";

    if (!hasSession) {
      return NextResponse.json(apiRes, {
        status: 200,
        headers: requestHeader(request),
      });
    }

    const session: SessionData = {
      session_id: apiRes.sessionId!,
      identity_id: apiRes.identityId!,
      profile_id: apiRes.profileId ?? "",
      user_role: apiRes.role!,
      access_token: apiRes.accessToken!,
      token_exp: apiRes.accessTokenExpiresAt!,
      refresh_exp: apiRes.refreshTokenExpiresAt!,
    };

    let redirectTo: string | undefined;
    const oauthCodeCookie = request.cookies.get("cos_oauth_code")?.value;

    if (oauthCodeCookie) {
      try {
        const ctx = await getOAuthContext({ oauthCode: oauthCodeCookie });

        if (!ctx) {
          console.warn("[auth:/api/confirm-signup] Missing OAuth context");

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
        debugAuth(
          "[auth:/api/confirm-signup] Stored session data in OAuth context",
        );
      } catch (error) {
        console.error(
          "[auth:/api/confirm-signup] Failed to build redirectTo",
          error,
        );
        throw new Error("Failed to build redirectTo");
      }
    } else {
      redirectTo = getClientAppUrl("app", request);
      debugAuth(
        "[auth:/api/confirm-signup] Direct IdP confirm — bootstrap redirect",
        redirectTo,
      );
    }

    const response = NextResponse.json(
      {
        ...apiRes,
        redirectTo,
      },
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
    console.error("[auth:/api/confirm-signup] Unexpected error", error);

    return authError(
      "server_error",
      error instanceof Error ? error.message : "Internal server error",
      { init: { headers: requestHeader(request) } },
    );
  }
}
