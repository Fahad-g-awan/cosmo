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
import { useLocale, useTranslations } from "@cosmediate/i18n/client";
import type { AuthProcessingErrorCode } from "@cosmediate/i18n";
import type {
  AuthErrorCode,
  AuthErrorResponse,
} from "@cosmediate/type-utils";

const CLIENT_SIGN_IN_PATH = "/auth/signin";

interface ProcessingError {
  code: AuthErrorCode | "unknown";
  message: string;
}

const AuthProcessingComp = () => {
  const auth = useTranslations("auth");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const oauthReturnTo = searchParams.get("return_to");
  const [error, setError] = useState<ProcessingError | null>(null);

  const userMessageForCode = useCallback(
    (code: AuthErrorCode | "unknown"): string => {
      if (code === "unknown") {
        return auth.processing.messages.unknown;
      }
      return auth.processing.messages[code as AuthProcessingErrorCode];
    },
    [auth.processing.messages],
  );

  const exchangeCode = useCallback(
    async (code: string) => {
      try {
        if (!code) {
          console.error(
            "[blog:/auth/processing] Unauthenticated: auth code not available"
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
          console.error(
            "[blog:/auth/processing] exchange-code returned no body",
            { status: res.status }
          );
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
        const errCode = (errBody.error ?? "unknown") as
          | AuthErrorCode
          | "unknown";
        console.error("[blog:/auth/processing] exchange-code failed", errBody);
        setError({
          code: errCode,
          message: errBody.message ?? userMessageForCode(errCode),
        });
      } catch (err) {
        console.error("[blog:/auth/processing] Unexpected error", err);
        setError({ code: "unknown", message: userMessageForCode("unknown") });
      }
    },
    [userMessageForCode],
  );

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
      <div className="h-screen w-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md flex flex-col gap-4">
          <InfoMessage
            variant="error"
            size="lg"
            title={auth.processing.failedTitle}
            message={error.message}
          />
          <Button
            variant="default"
            onClick={() => {
              window.location.href = buildProcessingRecoverySignInHref(
                CLIENT_SIGN_IN_PATH,
                error.code,
                oauthReturnTo,
                locale,
              );
            }}
          >
            {auth.processing.backToSignIn}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <FullScreenLoader />
    </div>
  );
};

export default function AuthProcessing() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center">
          <SmallLoader />
        </div>
      }
    >
      <AuthProcessingComp />
    </Suspense>
  );
}
