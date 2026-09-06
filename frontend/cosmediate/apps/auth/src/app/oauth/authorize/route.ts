import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";

import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import {
  clearIdpSessionCookies,
  getAuthSelfUrl,
  readIdpSessionSnapshot,
} from "@cosmediate/config";
import {
  storeOAuthContext,
  updateOAuthContext,
} from "@auth/lib/oauth-context-store";
import { debugAuth } from "@auth/lib/debug-log";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

const storeOAuthContextCookies = async (
  response: NextResponse,
  clientAuthCtxValue: string,
  oauthCode: string,
) => {
  response.cookies.set("client_auth_ctx", clientAuthCtxValue, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  response.cookies.set("cos_oauth_code", oauthCode, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
  });
};

export async function GET(req: NextRequest) {
  const headers = requestHeader(req);
  const params = req.nextUrl.searchParams;

  const errorMessage = params.get("error_description") ?? "";
  const returnTo = params.get("return_to") ?? "";
  const locale = params.get("locale");
  const redirectUri = params.get("redirect_uri");
  const appOrigin = params.get("app_origin");
  const clientId = params.get("client_id");
  const scope = params.get("scope");

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "client_id and redirect_uri are required",
      },
      { status: 400, headers },
    );
  }

  if (!scope?.includes("openid profile")) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "scope must include 'openid profile'",
      },
      { status: 400, headers },
    );
  }

  let authSelfUrl: string;
  try {
    authSelfUrl = getAuthSelfUrl();
  } catch (err) {
    console.error("[auth:/oauth/authorize]", err);

    return NextResponse.json(
      {
        error: "server_misconfig",
        message: "Auth configuration is missing on auth app",
      },
      { status: 500, headers },
    );
  }

  const clientAuthCtx = {
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    app_origin: appOrigin,
    return_to: returnTo,
    locale,
  };
  const clientAuthCtxValue = JSON.stringify(clientAuthCtx);
  debugAuth("[auth:/oauth/authorize] clientAuthCtx", clientAuthCtx);

  let oauthCode = "";
  try {
    oauthCode = await storeOAuthContext(clientAuthCtx, 10);
    debugAuth(
      `[auth:/oauth/authorize] Stored OAuth context with ID: ${oauthCode}`,
    );
  } catch (error) {
    console.error(
      "[auth:/oauth/authorize] Failed to store OAuth context:",
      error,
    );

    return NextResponse.json(
      {
        error: "server_error",
        message: "Failed to store OAuth context",
      },
      { status: 500, headers },
    );
  }

  const idpSession = readIdpSessionSnapshot(
    (name) => req.cookies.get(name)?.value,
  );
  const now = DateTime.utc().toSeconds();

  debugAuth("[auth:/oauth/authorize] idp session present", {
    hasSession: Boolean(idpSession),
    token_exp: idpSession?.token_exp,
  });

  if (idpSession && idpSession.token_exp > now) {
    let sessionStored = false;
    try {
      await updateOAuthContext({
        oauthCode: oauthCode,
        sessionData: idpSession,
      });
      sessionStored = true;
      debugAuth("[auth:/oauth/authorize] Stored session data in OAuth context");
    } catch (error) {
      console.error(
        "[auth:/oauth/authorize] Failed to store session data — falling through to signin",
        error,
      );
    }

    if (sessionStored) {
      try {
        const target = new URL(redirectUri);
        target.searchParams.set("code", oauthCode);
        if (returnTo) {
          target.searchParams.set("return_to", returnTo);
        }

        const response = NextResponse.redirect(target.toString());
        storeOAuthContextCookies(response, clientAuthCtxValue, oauthCode);
        return response;
      } catch (error) {
        console.error("[auth:/oauth/authorize] Invalid redirect_uri", error);
        return NextResponse.json(
          {
            error: "invalid_request",
            message: "Invalid redirect_uri",
          },
          { status: 400, headers },
        );
      }
    }
  }

  debugAuth(
    "[auth:/oauth/authorize] no valid IdP session, redirecting to /signin",
  );
  const signinUrl = new URL("/signin", authSelfUrl);
  if (errorMessage) {
    signinUrl.searchParams.set("error_description", errorMessage);
  }
  if (locale) {
    signinUrl.searchParams.set("locale", locale);
  }
  const response = NextResponse.redirect(signinUrl);
  storeOAuthContextCookies(response, clientAuthCtxValue, oauthCode);

  if (idpSession && idpSession.token_exp <= now) {
    clearIdpSessionCookies(response);
  }

  return response;
}
