import { NextResponse } from "next/server";

export interface CorsHelpers {
  originHandler(request: Request): string;
  optionsHandler(request: Request): NextResponse;
  requestHeader(request: Request): Record<string, string>;
}

export function createCorsHelpers(
  allowedOrigins: readonly string[]
): CorsHelpers {
  function originHandler(request: Request): string {
    let origin = request.headers.get("Origin") ?? "";

    if (!origin) {
      const host = request.headers.get("Host");
      if (host) {
        const isLocalhost =
          host.includes("localhost") || host.includes("127.0.0.1");
        origin = `${isLocalhost ? "http" : "https"}://${host}`;
      }
    }

    return allowedOrigins.includes(origin) ? origin : "";
  }

  function optionsHandler(request: Request): NextResponse {
    const origin = originHandler(request);

    return new NextResponse(null, {
      status: 204,
      headers: {
        ...(origin && { "Access-Control-Allow-Origin": origin }),
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  function requestHeader(request: Request): Record<string, string> {
    const origin = originHandler(request);

    return {
      ...(origin && { "Access-Control-Allow-Origin": origin }),
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };
  }

  return { originHandler, optionsHandler, requestHeader };
}
