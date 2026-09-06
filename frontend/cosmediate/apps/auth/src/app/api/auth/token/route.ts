import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { safePostAuthRedirect } from "@cosmediate/config";
import { getOAuthClient } from "@auth/lib/oauth-client-store";
import {
  claimOAuthContextForTokenExchange,
  normalizeSessionDataForToken,
} from "@auth/lib/oauth-context-store";
import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { debugAuth } from "@auth/lib/debug-log";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

/**
 * OAuth2 token endpoint — DOCUMENTED EXCEPTION to the standard auth response
 * shape (see AUTH_SYSTEM_MASTER_PLAN.md §5.2 "Kept exceptions").
 *
 * - Success: flat snake_case session scalars + `return_to` / `redirect_to` —
 *   not wrapped in `{ success, data }`.
 * - Error:   returns RFC 6749 shape `{ error, message }` — no `success` field.
 */
export async function POST(request: NextRequest) {
  const headers = requestHeader(request);

  try {
    const contentType = request.headers.get("content-type") || "";

    let body: {
      grant_type?: string;
      code?: string;
      redirect_uri?: string;
      client_id?: string;
      client_secret?: string;
    };

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();

      body = {
        grant_type: formData.get("grant_type")?.toString(),
        code: formData.get("code")?.toString(),
        redirect_uri: formData.get("redirect_uri")?.toString(),
        client_id: formData.get("client_id")?.toString(),
        client_secret: formData.get("client_secret")?.toString(),
      };
    } else {
      body = await request.json();
    }

    const { grant_type, code, redirect_uri, client_id, client_secret } = body;
    debugAuth("[auth:/api/token] request", {
      grant_type,
      redirect_uri,
      client_id,
    });

    if (grant_type !== "authorization_code") {
      return NextResponse.json(
        {
          error: "unsupported_grant_type",
          message: "Only authorization_code grant_type is supported",
        },
        { status: 400, headers }
      );
    }

    if (!code || !redirect_uri || !client_id || !client_secret) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message:
            "code, redirect_uri, client_id and client_secret are required",
        },
        { status: 400, headers }
      );
    }

    const oAuthClient = await getOAuthClient(client_id);

    if (!oAuthClient) {
      return NextResponse.json(
        {
          error: "invalid_client",
          message: "Client not found or inactive",
        },
        { status: 401, headers }
      );
    }

    const isSecretValid = await bcrypt.compare(
      client_secret,
      oAuthClient.hashedSecret
    );

    if (!isSecretValid) {
      return NextResponse.json(
        {
          error: "invalid_client",
          message: "Invalid client credentials",
        },
        { status: 401, headers }
      );
    }

    if (!oAuthClient.redirectURIs.includes(redirect_uri)) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message: "redirect_uri does not match registered URIs",
        },
        { status: 400, headers }
      );
    }

    const oAuthContext = await claimOAuthContextForTokenExchange({
      oauthCode: code,
      redirect_uri,
      client_id,
    });

    if (!oAuthContext) {
      return NextResponse.json(
        {
          error: "invalid_grant",
          message: "Invalid or expired authorization code",
        },
        { status: 400, headers }
      );
    }

    const normalized = normalizeSessionDataForToken(oAuthContext.sessionData);

    if (!normalized) {
      return NextResponse.json(
        {
          error: "server_error",
          message: "Session data not found in OAuth context",
        },
        { status: 500, headers }
      );
    }

    if (!normalized.identity_id) {
      console.error(
        "CRITICAL: normalized session missing identity_id",
        oAuthContext.sessionData
      );
      return NextResponse.json(
        {
          error: "invalid_session",
          message: "Identity missing in session",
        },
        { status: 500, headers }
      );
    }

    const return_to = oAuthContext.return_to;
    const redirect_to = safePostAuthRedirect(return_to);

    const responsePayload = {
      session_id: normalized.session_id,
      access_token: normalized.access_token,
      token_exp: normalized.token_exp,
      refresh_exp: normalized.refresh_exp,
      identity_id: normalized.identity_id,
      profile_id: normalized.profile_id ?? "",
      user_role: normalized.user_role,
      ...(return_to !== undefined && return_to !== ""
        ? { return_to }
        : {}),
      redirect_to,
    };

    debugAuth(
      "[auth:/oauth/token] responsePayload.identity_id",
      responsePayload.identity_id
    );

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: requestHeader(request),
    });
  } catch (error) {
    console.error("[auth:/api/token] Unexpected error", error);

    return NextResponse.json(
      {
        error: "server_error",
        message: "Internal server error",
      },
      { status: 500, headers }
    );
  }
}
