import {
  getAuthRefreshUrl,
  parseIdpRefreshSuccessPayload,
  readClientSessionSnapshot,
  setClientSessionCookies,
} from "@cosmediate/config";
import { NextRequest, NextResponse } from "next/server";

import { createCorsHelpers } from "../cors";
import type { RefreshRouteHandlerConfig } from "../types";

export function createRefreshRouteHandlers(cfg: RefreshRouteHandlerConfig): {
  OPTIONS: (request: NextRequest) => NextResponse;
  POST: (request: NextRequest) => Promise<Response>;
} {
  const { optionsHandler, requestHeader } = createCorsHelpers(
    cfg.allowedOrigins,
  );

  return {
    OPTIONS: (request: NextRequest) => optionsHandler(request),

    POST: async (request: NextRequest) => {
      const headers = requestHeader(request);

      try {
        const snap = readClientSessionSnapshot(
          (name) => request.cookies.get(name)?.value,
        );

        if (!snap?.sessionId || !snap.tokens.accessToken) {
          return NextResponse.json(
            { success: false, error: "not_authenticated" },
            { status: 401, headers },
          );
        }

        let idpUrl: string;
        try {
          idpUrl = getAuthRefreshUrl();
        } catch {
          return NextResponse.json(
            { success: false, error: "server_misconfig" },
            { status: 500, headers },
          );
        }

        const idpRes = await fetch(idpUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: snap.sessionId,
            accessToken: snap.tokens.accessToken,
          }),
        });

        const raw: unknown = await idpRes.json().catch(() => null);
        const payload = parseIdpRefreshSuccessPayload(raw);

        if (!idpRes.ok || !payload) {
          return NextResponse.json(
            {
              success: false,
              error:
                raw && typeof raw === "object" && "error" in raw
                  ? String(
                      (raw as { error?: unknown }).error ?? "refresh_failed",
                    )
                  : "refresh_failed",
            },
            { status: idpRes.status >= 400 ? idpRes.status : 401, headers },
          );
        }

        const response = NextResponse.json(
          { success: true },
          { status: 200, headers },
        );
        setClientSessionCookies(response, payload);
        return response;
      } catch (error) {
        console.error(cfg.routeLogPrefix, error);
        return NextResponse.json(
          { success: false, error: "server_error" },
          { status: 500, headers },
        );
      }
    },
  };
}
