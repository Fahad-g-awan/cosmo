import { NextRequest, NextResponse } from "next/server";
import { clearAllIdpAuthCookies } from "@cosmediate/config";

import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function GET(req: NextRequest) {
  const headers = requestHeader(req);

  try {
    const returnToParam = req.nextUrl.searchParams.get("return_to");
    const successParam = req.nextUrl.searchParams.get("success");
    let targetPath = "/signin";

    if (
      returnToParam &&
      returnToParam.startsWith("/") &&
      !returnToParam.startsWith("//") &&
      !returnToParam.includes(":")
    ) {
      targetPath = returnToParam;
    }

    const redirectUri = new URL(targetPath, req.url);

    if (successParam && /^[a-z0-9_]+$/.test(successParam)) {
      redirectUri.searchParams.set("success", successParam);
    }
    const response = NextResponse.redirect(redirectUri);

    clearAllIdpAuthCookies(response);

    return response;
  } catch (error) {
    console.error("[auth:/oauth/clear-session] Unexpected error", error);

    const response = NextResponse.json(
      {
        success: false,
        error: "server_error",
        message: "Internal server error",
      },
      { status: 200, headers }
    );

    return response;
  }
}
