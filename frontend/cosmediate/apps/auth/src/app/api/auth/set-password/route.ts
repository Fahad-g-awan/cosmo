import { clearAllIdpAuthCookies } from "@cosmediate/config";
import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { NextRequest, NextResponse } from "next/server";

import { setNewPasswordApi } from "@cosmediate/api";
import { authError } from "@cosmediate/type-utils";

import { resolveBackendOrigin } from "@auth/lib/resolve-backend-origin";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      password?: string;
      email?: string;
      userId?: string;
      accessToken?: string;
    };

    const { password, email, userId, accessToken } = body;

    if (!password) {
      return authError("invalid_request", "password is required", {
        init: { headers: requestHeader(request) },
      });
    }

    if (!email || !userId || !accessToken) {
      return authError("not_authenticated", "Incomplete session information", {
        init: { headers: requestHeader(request) },
      });
    }

    const apiRes = await setNewPasswordApi(
      {
        email,
        userId,
        password,
      },
      accessToken,
      { origin: resolveBackendOrigin(request) },
    );
    const status = apiRes.success ? 200 : 400;
    const response = NextResponse.json(apiRes, {
      status,
      headers: requestHeader(request),
    });

    clearAllIdpAuthCookies(response);

    return response;
  } catch (error) {
    console.error("[auth:/api/set-password] Unexpected error", error);
    return authError(
      "server_error",
      error instanceof Error ? error?.message : "Internal server error",
      { init: { headers: requestHeader(request) } },
    );
  }
}
