import { NextRequest, NextResponse } from "next/server";

import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { authError } from "@cosmediate/type-utils";
import { userSignUpApi } from "@cosmediate/api";

import { resolveBackendOrigin } from "@auth/lib/resolve-backend-origin";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      age?: string;
      phone?: string;
      country?: string;
      state?: string;
      city?: string;
      postalCode?: string;
    };

    const {
      email,
      password,
      firstName,
      lastName,
      // age,
      // phone,
      // country,
      // state,
      // city,
      // postalCode,
    } = body;

    if (!email || !password) {
      return authError("invalid_request", "Email and password are required", {
        init: { headers: requestHeader(request) },
      });
    }

    const apiRes = await userSignUpApi(
      {
        email,
        password,
        firstName,
        lastName,
        // age: parseInt(age ?? ""),
        // phone,
        // country,
        // state,
        // city,
        // postalCode,
      },
      { origin: resolveBackendOrigin(request) },
    );
    const status = apiRes.success ? 200 : 400;

    return NextResponse.json(apiRes, {
      status,
      headers: requestHeader(request),
    });
  } catch (error: unknown) {
    console.error("[auth:/api/signup] Unexpected error", error);
    return authError(
      "server_error",
      error instanceof Error ? error.message : "Internal server error",
      { init: { headers: requestHeader(request) } },
    );
  }
}
