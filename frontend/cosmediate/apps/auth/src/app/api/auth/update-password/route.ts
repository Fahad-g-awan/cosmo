import { clearAllIdpAuthCookies } from "@cosmediate/config";
import { NextRequest, NextResponse } from "next/server";

import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { updateUserPasswordApi } from "@cosmediate/api";
import { authError } from "@cosmediate/type-utils";

import { resolveBackendOrigin } from "@auth/lib/resolve-backend-origin";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      oldPassword?: string;
      newPassword?: string;
      email?: string;
      userId?: string;
      accessToken?: string;
    };

    const { oldPassword, newPassword, email, userId, accessToken } = body;

    if (!oldPassword || !newPassword) {
      return authError(
        "invalid_request",
        "oldPassword and newPassword are required",
        { init: { headers: requestHeader(request) } },
      );
    }

    if (!email || !userId || !accessToken) {
      return authError("not_authenticated", "Incomplete session information", {
        init: { headers: requestHeader(request) },
      });
    }

    const apiRes = await updateUserPasswordApi(
      {
        email,
        userId,
        oldPassword,
        newPassword,
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
    console.error("[auth:/api/update-password] Unexpected error", error);
    return authError(
      "server_error",
      error instanceof Error ? error?.message : "Internal server error",
      { init: { headers: requestHeader(request) } },
    );
  }
}
