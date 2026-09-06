"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import {
  Button,
  FullScreenLoader,
  InfoMessage,
  SmallLoader,
} from "@cosmediate/ui/index";
import { buildProcessingRecoverySignInHref } from "@cosmediate/config";
import type { AuthErrorCode, AuthErrorResponse } from "@cosmediate/type-utils";

const CLIENT_SIGN_IN_PATH = "/auth/signin";

interface ProcessingError {
  code: AuthErrorCode | "unknown";
  message: string;
}

const exhaustivenessCheck = (_value: never): never => {
  throw new Error("Unreachable AuthErrorCode branch");
};

/**
 * Translate the typed `AuthErrorCode` returned by `/api/auth/exchange-code`
 * into a user-facing message. The compile-time `never` check guarantees that
 * adding a new code in `packages/type-utils/src/auth.ts` will surface here.
 */
const userMessageForCode = (code: AuthErrorCode | "unknown"): string => {
  if (code === "unknown") {
    return "Something went wrong while signing you in. Please try again.";
  }

  switch (code) {
    case "missing_auth_code":
      return "The sign-in link is incomplete. Please start again from the sign-in page.";
    case "token_exchange_failed":
      return "We couldn't verify your sign-in. The link may have expired. Please sign in again.";
    case "server_misconfig":
      return "Sign-in is temporarily unavailable due to a server configuration issue. Please contact support.";
    case "server_error":
      return "An unexpected error occurred. Please try again in a moment.";
    case "invalid_request":
    case "invalid_grant":
    case "invalid_client":
    case "unsupported_grant_type":
      return "The sign-in request was invalid. Please start again from the sign-in page.";
    case "not_authenticated":
    case "invalid_session":
      return "Your session is no longer valid. Please sign in again.";
    case "refresh_unavailable":
    case "refresh_revoked":
      return "Your session has expired. Please sign in again.";
    default:
      return exhaustivenessCheck(code);
  }
};

const AuthProcessingComp = () => {
  const searchParams = useSearchParams();
  const oauthReturnTo = searchParams.get("return_to");
  const [error, setError] = useState<ProcessingError | null>(null);

  const exchangeCode = useCallback(async (code: string) => {
    try {
      if (!code) {
        console.error(
          "[app:/auth/processing] Unauthenticated: auth code not available",
        );
        setError({
          code: "missing_auth_code",
          message: userMessageForCode("missing_auth_code"),
        });
        return;
      }

      const res = await fetch("/api/auth/exchange-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      const data: unknown = await res.json().catch(() => null);

      if (!data || typeof data !== "object") {
        console.error("[app:/auth/processing] exchange-code returned no body", {
          status: res.status,
        });
        setError({ code: "unknown", message: userMessageForCode("unknown") });
        return;
      }

      if ((data as { success?: boolean }).success === true) {
        const redirectTo =
          typeof (data as { redirectTo?: string }).redirectTo === "string"
            ? (data as { redirectTo: string }).redirectTo
            : "/";
        window.location.href = redirectTo;
        return;
      }

      const errBody = data as Partial<AuthErrorResponse>;
      const errCode = (errBody.error ?? "unknown") as AuthErrorCode | "unknown";
      console.error("[app:/auth/processing] exchange-code failed", errBody);
      setError({
        code: errCode,
        message: errBody.message ?? userMessageForCode(errCode),
      });
    } catch (err) {
      console.error("[app:/auth/processing] Unexpected error", err);
      setError({ code: "unknown", message: userMessageForCode("unknown") });
    }
  }, []);

  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const code = searchParams.get("code");

    exchangeCode(code || "");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeCode]);

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-md flex flex-col gap-4">
          <InfoMessage
            variant="error"
            size="lg"
            title="Sign-in failed"
            message={error.message}
          />
          <Button
            variant="default"
            onClick={() => {
              window.location.href = buildProcessingRecoverySignInHref(
                CLIENT_SIGN_IN_PATH,
                error.code,
                oauthReturnTo,
              );
            }}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center overflow-hidden">
      <FullScreenLoader />
    </div>
  );
};

export default function AuthProcessing() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center overflow-hidden">
          <SmallLoader />
        </div>
      }
    >
      <AuthProcessingComp />
    </Suspense>
  );
}
