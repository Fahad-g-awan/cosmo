"use client";

import { useCallback, useState } from "react";

import { validateEmail, validatePassword } from "@auth-core/lib/auth.utils";
import {
  authClientError,
  parseAuthResponse,
  type AuthHookResult,
} from "@auth-core/lib/parseAuthResponse";

/**
 * Server-side success payload from the auth IdP `/api/auth/signin` route.
 * Note: the IdP intentionally spreads the upstream Cognito response onto the
 * success body (not nested under `data`). Phase 3 keeps that legacy shape;
 * P6 will normalize it.
 */
export interface SignInSuccessData {
  redirectTo?: string;
  message?: string;
  sessionId?: string;
  accessToken?: string;
  expiresAt?: string;
  refreshTokenExpiresAt?: string;
  user?: { id?: string; role?: string } & Record<string, unknown>;
}

export type SignInSuccess = { success: true } & SignInSuccessData;
export type SignInResult = AuthHookResult<SignInSuccess>;

interface UseSignIn {
  handleSignin: (args: {
    email?: string;
    password?: string;
    code?: string;
  }) => Promise<SignInResult>;
  isProcessing: boolean;
}

export function useSignIn(): UseSignIn {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignin = useCallback(
    async ({
      email,
      password,
      code,
    }: {
      email?: string;
      password?: string;
      code?: string;
    }): Promise<SignInResult> => {
      setIsProcessing(true);
      try {
        if (!code && email && !validateEmail(email)) {
          return authClientError("invalid_request", "Please enter valid email");
        }
        if (!code && password && !validatePassword(password)) {
          return authClientError(
            "invalid_request",
            "Please enter valid password",
          );
        }
        if (!email && !code) {
          return authClientError(
            "invalid_request",
            "Something went wrong, please try again",
          );
        }

        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: email ?? "",
            password: password ?? "",
            code: code ?? "",
          }),
        });

        return await parseAuthResponse<SignInSuccess>(response);
      } catch (error: unknown) {
        console.log("[useSignin] Network error:", error);
        return authClientError(
          "server_error",
          error instanceof Error
            ? error.message
            : "Something went wrong, please try again",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  return {
    handleSignin,
    isProcessing,
  };
}
