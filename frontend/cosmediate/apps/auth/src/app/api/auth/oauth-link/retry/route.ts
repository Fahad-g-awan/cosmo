import { NextRequest, NextResponse } from "next/server";

import { canRetryProviderLinkedLink } from "@cosmediate/auth";
import { optionsHandler, requestHeader } from "@cosmediate/auth-bff";
import { authError } from "@cosmediate/type-utils";

import {
  appendStateToAuthorizeUrl,
  getOAuthLinkContext,
  updateOAuthLinkAttempt,
} from "@auth/lib/oauth-link-store";

export async function OPTIONS(request: NextRequest) {
  return optionsHandler(request);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      linkSessionId?: string;
    };

    const { linkSessionId } = body;
    if (!linkSessionId) {
      return authError("invalid_request", "linkSessionId is required", {
        init: { headers: requestHeader(request) },
      });
    }

    const linkCtx = await getOAuthLinkContext(linkSessionId);
    if (!linkCtx) {
      return authError(
        "invalid_request",
        "Link session expired. Please try again.",
        {
          init: { headers: requestHeader(request) },
        },
      );
    }

    const nextAttempt = linkCtx.attempt + 1;
    if (!canRetryProviderLinkedLink(linkCtx.attempt)) {
      return NextResponse.json(
        { success: false, exhausted: true },
        { status: 400, headers: requestHeader(request) },
      );
    }

    await updateOAuthLinkAttempt(linkSessionId, nextAttempt);

    const authorizeUrl = appendStateToAuthorizeUrl(
      linkCtx.authorizeUrl,
      linkSessionId,
    );

    return NextResponse.json(
      { success: true, authorizeUrl },
      { status: 200, headers: requestHeader(request) },
    );
  } catch (error) {
    console.error("[auth:/api/oauth-link/retry] Unexpected error", error);
    return authError(
      "server_error",
      error instanceof Error ? error.message : "Internal server error",
      { init: { headers: requestHeader(request) } },
    );
  }
}
