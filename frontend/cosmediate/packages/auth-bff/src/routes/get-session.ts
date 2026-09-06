import { NextRequest, NextResponse } from "next/server";

import { readClientSessionSnapshot } from "@cosmediate/config";

import { createCorsHelpers } from "../cors";
import type { GetSessionRouteHandlerConfig } from "../types";

export function createGetSessionRouteHandlers(
  cfg: GetSessionRouteHandlerConfig,
): {
  OPTIONS: (request: NextRequest) => NextResponse;
  GET: (request: NextRequest) => Promise<Response>;
} {
  const { optionsHandler, requestHeader } = createCorsHelpers(
    cfg.allowedOrigins,
  );

  return {
    OPTIONS: (request: NextRequest) => optionsHandler(request),

    GET: async (request: NextRequest) => {
      try {
        const snap = readClientSessionSnapshot(
          (name) => request.cookies.get(name)?.value,
        );

        if (!snap) {
          return NextResponse.json(
            {
              authenticated: false,
              session: null,
            },
            { status: 200, headers: requestHeader(request) },
          );
        }

        return NextResponse.json(
          {
            authenticated: true,
            session: {
              sessionId: snap.sessionId,
              identityId: snap.identityId,
              profileId: snap.profileId,
              userRole: snap.userRole,
              tokens: snap.tokens,
            },
          },
          { status: 200, headers: requestHeader(request) },
        );
      } catch (error) {
        console.error(`${cfg.routeLogPrefix} Unexpected error`, error);

        return NextResponse.json(
          {
            authenticated: false,
            session: null,
            error: "server_error",
            message:
              error instanceof Error ? error?.message : "Internal server error",
          },
          { status: 500, headers: requestHeader(request) },
        );
      }
    },
  };
}
