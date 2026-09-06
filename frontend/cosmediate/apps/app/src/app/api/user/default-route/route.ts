import { NextRequest, NextResponse } from "next/server";

import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { CLIENT_SESSION_COOKIE } from "@cosmediate/config";
import { UserRole } from "@cosmediate/type-utils/auth";

import { getDefaultRouteForRole } from "@app/lib/routing/roleRouting";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function GET(request: NextRequest) {
  try {
    const userRole = request.cookies.get(
      CLIENT_SESSION_COOKIE.USER_ROLE,
    )?.value;

    if (!userRole) {
      return NextResponse.json(
        {
          authenticated: false,
          defaultRoute: "/signin",
        },
        { status: 200, headers: requestHeader(request) },
      );
    }

    const defaultRoute = getDefaultRouteForRole(userRole as UserRole);

    return NextResponse.json(
      {
        authenticated: true,
        defaultRoute,
      },
      { status: 200, headers: requestHeader(request) },
    );
  } catch (error) {
    console.error("[app:/api/user/default-route] Unexpected error", error);
    return NextResponse.json(
      {
        authenticated: false,
        defaultRoute: "/signin",
        error: "server_error",
        message:
          error instanceof Error ? error?.message : "Internal server error",
      },
      { status: 500, headers: requestHeader(request) },
    );
  }
}
