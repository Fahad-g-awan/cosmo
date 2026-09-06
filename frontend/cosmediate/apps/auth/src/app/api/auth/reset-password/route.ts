import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { NextRequest, NextResponse } from "next/server";

import { resetPasswordApi } from "@cosmediate/api";
import { authError } from "@cosmediate/type-utils";

import { resolveBackendOrigin } from "@auth/lib/resolve-backend-origin";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      code?: string;
      newPassword?: string;
    };

    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return authError(
        "invalid_request",
        "email, code and newPassword are required",
        { init: { headers: requestHeader(request) } },
      );
    }

    const apiRes = await resetPasswordApi(
      { email, code, newPassword },
      { origin: resolveBackendOrigin(request) },
    );
    const status = apiRes.success ? 200 : 400;

    return NextResponse.json(apiRes, {
      status,
      headers: requestHeader(request),
    });
  } catch (error) {
    console.error("[auth:/api/reset-password] Unexpected error", error);
    return authError(
      "server_error",
      error instanceof Error ? error.message : "Internal server error",
      { init: { headers: requestHeader(request) } },
    );
  }
}
