"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  Button,
  FullScreenLoader,
  InfoMessage,
  SmallLoader,
} from "@cosmediate/ui";
import {
  useSignIn,
  isProviderLinkedRetryError,
  canRetryProviderLinkedLink,
  buildGoogleHostedUiAuthorizeUrl,
} from "@cosmediate/auth";
import { buildProcessingRecoverySignInHref } from "@cosmediate/config";
import { useLocale, useTranslations } from "@cosmediate/i18n/client";
import type { AuthProcessingErrorCode } from "@cosmediate/i18n";
import type { AuthErrorCode } from "@cosmediate/type-utils";

import {
  mapAuthApiFailureMessage,
  mapHostedUiOAuthErrorDescription,
} from "@auth/lib/map-oauth-processing-error";

const IDP_SIGN_IN_PATH = "/signin";
/** Auth IdP proxy resolves `/dashboard` → app host (role-based redirect). */
const DASHBOARD_RECOVERY_PATH = "/dashboard";

type ProcessingRecovery = "signin" | "dashboard";

interface ProcessingError {
  code: AuthErrorCode | "unknown";
  message: string;
  recovery: ProcessingRecovery;
  title: string;
}

async function completeOAuthLink(
  linkSessionId: string,
  code: string,
  linkErrorFallback: string,
): Promise<
  | { redirectUrl: string }
  | { error: string; errorCode?: string; details?: unknown }
> {
  const res = await fetch("/api/auth/oauth-link/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ linkSessionId, code }),
  });

  const data = (await res.json().catch(() => null)) as {
    success?: boolean;
    redirectUrl?: string;
    message?: string;
    error?: string;
    details?: unknown;
  } | null;

  if (!res.ok || !data?.success || !data.redirectUrl) {
    return {
      error: data?.message || linkErrorFallback,
      errorCode: data?.error,
      details: data?.details,
    };
  }

  return { redirectUrl: data.redirectUrl };
}

const AuthProcessingComp = () => {
  const auth = useTranslations("auth");
  const locale = useLocale();
  const [statusMessage, setStatusMessage] = useState(
    auth.processing.completing,
  );
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

  const { handleSignin } = useSignIn();
  const searchParams = useSearchParams();
  const oauthReturnTo = searchParams.get("return_to");

  const setLinkError = useCallback(
    (message: string, code: AuthErrorCode | "unknown" = "unknown") => {
      setError({
        code,
        message,
        recovery: "dashboard",
        title: auth.processing.linkFailedTitle,
      });
    },
    [auth.processing.linkFailedTitle],
  );

  const setSignInError = useCallback(
    (message: string, code: AuthErrorCode | "unknown" = "unknown") => {
      setError({
        code,
        message,
        recovery: "signin",
        title: auth.processing.failedTitle,
      });
    },
    [auth.processing.failedTitle],
  );

  const exchangeCode = useCallback(
    async (code: string, linkSessionId: string | null) => {
      if (!code && !linkSessionId) {
        setSignInError(
          userMessageForCode("missing_auth_code"),
          "missing_auth_code",
        );
        return;
      }

      if (linkSessionId && code) {
        setStatusMessage(auth.processing.connectingGoogle);
        const linkResult = await completeOAuthLink(
          linkSessionId,
          code,
          auth.processing.linkGoogleFailed,
        );
        if ("error" in linkResult) {
          setLinkError(
            mapAuthApiFailureMessage(
              {
                error: linkResult.errorCode,
                message: linkResult.error,
                details: linkResult.details,
              },
              auth,
              auth.processing.linkGoogleFailed,
            ),
          );
          return;
        }
        window.location.href = linkResult.redirectUrl;
        return;
      }

      const result = await handleSignin({ code });

      if (result.success) {
        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        }
        return;
      }

      console.error(
        "[auth:/processing] sign-in failed",
        result.error,
        result.message,
      );
      setSignInError(
        mapAuthApiFailureMessage(
          {
            error: result.error,
            message: result.message,
            details: "details" in result ? result.details : undefined,
          },
          auth,
          result.message || userMessageForCode(result.error),
        ),
        result.error,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      auth,
      auth.processing.connectingGoogle,
      auth.processing.linkGoogleFailed,
      handleSignin,
      setLinkError,
      setSignInError,
      userMessageForCode,
    ],
  );

  const exchangeStarted = useRef(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const run = async () => {
      const oauthError = searchParams.get("error");
      const oauthErrorDescription = searchParams.get("error_description");
      const code = searchParams.get("code") || "";
      const linkSessionId = searchParams.get("state");
      const isLinkFlow = Boolean(linkSessionId);

      if (
        isProviderLinkedRetryError(oauthError, oauthErrorDescription) &&
        linkSessionId
      ) {
        setStatusMessage(auth.processing.finishingConnection);
        const retryRes = await fetch("/api/auth/oauth-link/retry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ linkSessionId }),
        });
        const retryData = (await retryRes.json().catch(() => null)) as {
          success?: boolean;
          authorizeUrl?: string;
          exhausted?: boolean;
        } | null;

        if (retryRes.ok && retryData?.success && retryData.authorizeUrl) {
          window.location.href = retryData.authorizeUrl;
          return;
        }

        if (!retryData?.exhausted) {
          setLinkError(auth.processing.linkGoogleFailed);
          return;
        }
      }

      if (
        isProviderLinkedRetryError(oauthError, oauthErrorDescription) &&
        !linkSessionId
      ) {
        setStatusMessage(auth.processing.finishingSignIn);
        const storedMode = localStorage.getItem("socialAuthmode");
        const storedProvider = localStorage.getItem("socialAuthProvider");
        const attemptKey = "socialAuthRetryAttempt";
        const attempt = Number(localStorage.getItem(attemptKey) || "0");

        if (
          storedMode === "auto" &&
          storedProvider &&
          canRetryProviderLinkedLink(attempt)
        ) {
          localStorage.setItem(attemptKey, String(attempt + 1));
          try {
            window.location.href = buildGoogleHostedUiAuthorizeUrl();
            return;
          } catch {
            // fall through to error UI
          }
        }

        setSignInError(auth.processing.completeSignInFailed);
        return;
      }

      if (
        oauthError &&
        !isProviderLinkedRetryError(oauthError, oauthErrorDescription)
      ) {
        const message = mapHostedUiOAuthErrorDescription(
          oauthErrorDescription,
          auth,
        );
        if (isLinkFlow) {
          setLinkError(message);
        } else {
          setSignInError(message);
        }
        return;
      }

      localStorage.removeItem("socialAuthRetryAttempt");
      await exchangeCode(code, linkSessionId);
    };

    void run();
  }, [
    auth,
    auth.processing.completeSignInFailed,
    auth.processing.finishingConnection,
    auth.processing.finishingSignIn,
    auth.processing.linkGoogleFailed,
    exchangeCode,
    searchParams,
    setLinkError,
    setSignInError,
  ]);

  if (error) {
    const goToRecovery = () => {
      if (error.recovery === "dashboard") {
        window.location.href = DASHBOARD_RECOVERY_PATH;
        return;
      }
      window.location.href = buildProcessingRecoverySignInHref(
        IDP_SIGN_IN_PATH,
        error.code,
        oauthReturnTo,
        locale,
      );
    };

    return (
      <div className="h-screen w-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md flex flex-col gap-4">
          <InfoMessage
            variant="error"
            size="lg"
            title={error.title}
            message={error.message}
          />
          <Button variant="default" onClick={goToRecovery}>
            {error.recovery === "dashboard"
              ? auth.processing.backToDashboard
              : auth.processing.backToSignIn}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-3 overflow-hidden">
      <FullScreenLoader />
      <p className="text-sm text-500">{statusMessage}</p>
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
