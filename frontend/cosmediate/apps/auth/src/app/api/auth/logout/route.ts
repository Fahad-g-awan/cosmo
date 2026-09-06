import {
  clearAllIdpAuthCookies,
  getAuthSelfUrl,
  readIdpSessionSnapshot,
} from "@cosmediate/config";
import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { NextRequest, NextResponse } from "next/server";

import { authError } from "@cosmediate/type-utils";
import { logoutApi } from "@cosmediate/api";

import { resolveBackendOrigin } from "@auth/lib/resolve-backend-origin";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function POST(request: NextRequest) {
  const headers = requestHeader(request);

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return authError(
        "not_authenticated",
        "Missing or invalid Authorization header",
        { init: { headers } },
      );
    }

    const accessToken = authHeader.slice("Bearer ".length);

    const body = (await request.json().catch(() => ({}))) as {
      redirect_uri?: string;
      sessionId?: string;
    };
    const rawRedirect =
      typeof body.redirect_uri === "string" ? body.redirect_uri.trim() : "";
    const redirectUri =
      rawRedirect !== ""
        ? rawRedirect
        : `${getAuthSelfUrl().replace(/\/+$/, "")}/signin`;

    const idpSnap = readIdpSessionSnapshot(
      (name) => request.cookies.get(name)?.value,
    );
    const sessionId =
      (typeof body.sessionId === "string" ? body.sessionId : undefined) ??
      idpSnap?.session_id;

    const logoutResponse = await logoutApi({
      accessToken,
      redirectUri,
      origin: resolveBackendOrigin(request),
      sessionId,
    });
    const status = logoutResponse.success ? 200 : 400;
    const response = NextResponse.json(
      {
        success: logoutResponse.success ?? false,
        message: logoutResponse.message,
      },
      {
        status,
        headers,
      },
    );

    clearAllIdpAuthCookies(response);
    return response;
  } catch (error) {
    console.error("[auth:/api/auth/logout] Unexpected error", error);

    const response = authError("server_error", "Internal server error", {
      init: { headers },
    });
    clearAllIdpAuthCookies(response);
    return response;
  }
}
