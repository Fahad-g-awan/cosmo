import { NextRequest, NextResponse } from "next/server";

import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";

import {
  type ScalarSessionCookiePayload,
  readIdpSessionSnapshot,
  setIdpSessionCookies,
} from "@cosmediate/config";
import { resolveBackendOrigin } from "@auth/lib/resolve-backend-origin";
import { refreshTokensFromBackend } from "@auth/lib/refresh-tokens";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

/**
 * OAuth-adjacent refresh — not the standard mutation `authSuccess` shape.
 * Returns scalar session fields for client BFFs to mirror into `cos_*` cookies.
 */
export async function POST(request: NextRequest) {
  const headers = requestHeader(request);

  try {
    const body = (await request.json().catch(() => ({}))) as {
      sessionId?: string;
      accessToken?: string;
    };

    const idpSnap = readIdpSessionSnapshot(
      (name) => request.cookies.get(name)?.value,
    );
    const sessionId =
      (typeof body.sessionId === "string" ? body.sessionId : undefined) ??
      idpSnap?.session_id;
    const accessToken =
      (typeof body.accessToken === "string" ? body.accessToken : undefined) ??
      idpSnap?.access_token;

    if (!sessionId || !accessToken) {
      return NextResponse.json(
        { success: false, error: "invalid_request" },
        { status: 400, headers },
      );
    }

    const result = await refreshTokensFromBackend({
      sessionId,
      accessToken,
      origin: resolveBackendOrigin(request),
    });

    if (!result.ok) {
      const status =
        result.code === "refresh_unavailable"
          ? 502
          : result.code === "invalid_response"
            ? 500
            : 401;
      return NextResponse.json(
        { success: false, error: result.code },
        { status, headers },
      );
    }

    const { data } = result;
    const identityId = data.identityId ?? idpSnap?.identity_id;
    const profileId = data.profileId ?? idpSnap?.profile_id ?? "";
    const userRole = data.role ?? idpSnap?.user_role;

    if (!identityId || !userRole) {
      console.error(
        "[auth:/api/auth/refresh] Missing identity/role after refresh — cannot emit cookie payload",
      );
      return NextResponse.json(
        { success: false, error: "invalid_response" },
        { status: 500, headers },
      );
    }

    const payload: ScalarSessionCookiePayload = {
      session_id: data.sessionId,
      access_token: data.accessToken,
      token_exp: Math.trunc(data.expiresAt),
      refresh_exp: Math.trunc(data.refreshTokenExpiresAt),
      identity_id: identityId,
      profile_id: profileId ?? "",
      user_role: userRole,
    };

    const jsonBody = {
      success: true as const,
      session_id: payload.session_id,
      access_token: payload.access_token,
      token_exp: payload.token_exp,
      refresh_exp: payload.refresh_exp,
      identity_id: payload.identity_id,
      profile_id: payload.profile_id,
      user_role: payload.user_role,
    };

    const response = NextResponse.json(jsonBody, { status: 200, headers });

    if (idpSnap) {
      setIdpSessionCookies(response, payload);
    }

    return response;
  } catch (error) {
    console.error("[auth:/api/auth/refresh] Unexpected error", error);
    return NextResponse.json(
      { success: false, error: "server_error" },
      { status: 500, headers },
    );
  }
}
