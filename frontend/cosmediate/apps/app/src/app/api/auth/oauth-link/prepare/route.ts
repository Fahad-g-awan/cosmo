import { NextRequest, NextResponse } from "next/server";

import { getAuthProviderUrl, getOrigin } from "@cosmediate/config";
import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { getPasswordFlowCredentials } from "@cosmediate/auth-bff";
import { authError } from "@cosmediate/type-utils";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      returnTo?: string;
      provider?: string;
    };

    const returnTo =
      body.returnTo ?? "/settings/account/security/manage-password";
    const provider = body.provider ?? "google";

    const creds = await getPasswordFlowCredentials(request);
    if (!creds) {
      return authError("not_authenticated", "Not authenticated", {
        init: { headers: requestHeader(request) },
      });
    }

    const clientId = process.env.AUTH_CLIENT_ID;
    if (!clientId) {
      return authError("server_misconfig", "Missing AUTH_CLIENT_ID", {
        init: { headers: requestHeader(request) },
      });
    }

    let authProviderUrl: string;
    let appOrigin: string;
    try {
      authProviderUrl = getAuthProviderUrl();
      appOrigin = getOrigin(request);
    } catch (err) {
      console.error("[app:/api/oauth-link/prepare]", err);
      return authError("server_misconfig", "Auth configuration is missing", {
        init: { headers: requestHeader(request) },
      });
    }

    const authRes = await fetch(`${authProviderUrl}/api/auth/oauth-link/prepare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        email: creds.email,
        userId: creds.userId,
        accessToken: creds.accessToken,
        returnTo,
        provider,
        appOrigin,
        appClientId: clientId,
      }),
    });

    const data = await authRes.json();
    return NextResponse.json(data, {
      status: authRes.status,
      headers: requestHeader(request),
    });
  } catch (error) {
    console.error("[app:/api/oauth-link/prepare] Unexpected error", error);
    return authError(
      "server_error",
      error instanceof Error ? error.message : "Internal server error",
      { init: { headers: requestHeader(request) } },
    );
  }
}
