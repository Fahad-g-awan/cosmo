"use client";

import { useState } from "react";

import {
  authClientError,
  parseAuthResponse,
  type AuthHookResult,
} from "@auth-core/lib/parseAuthResponse";
import {
  clearSignupPasswordBridge,
  takeDecryptedSignupPassword,
} from "@auth-core/lib/signupPasswordBridge";

export interface ConfirmSignupSuccessData {
  message?: string;
  status?: string;
  requiresSignIn?: boolean;
  redirectTo?: string;
  sessionId?: string;
  accessToken?: string;
  accessTokenExpiresAt?: number;
  refreshTokenExpiresAt?: number;
  identityId?: string;
  profileId?: string | null;
  role?: string;
}

export type ConfirmSignupSuccess = { success: true } & ConfirmSignupSuccessData;
export type ConfirmSignupResult = AuthHookResult<ConfirmSignupSuccess>;

interface UseConfirmSignup {
  handleConfirmSignup: (code: string) => Promise<ConfirmSignupResult>;
  isProcessing: boolean;
}

const clearSignupEmail = (): void => {
  try {
    localStorage.removeItem("auth_new_signup_email");
  } catch {
    // localStorage may be unavailable — non-fatal.
  }
};

export function useConfirmSignup(): UseConfirmSignup {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmSignup = async (
    code: string
  ): Promise<ConfirmSignupResult> => {
    setIsProcessing(true);
    try {
      if (!code) {
        return authClientError("invalid_request", "Code is required");
      }

      const rawEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_new_signup_email")
          : null;
      const email = rawEmail?.trim().toLowerCase() ?? null;

      if (!email) {
        return authClientError(
          "invalid_request",
          "SIGNUP_SESSION_REQUIRED",
        );
      }

      const normalizedCode = String(code).trim().replace(/\s+/g, "");
      const password = await takeDecryptedSignupPassword();

      const response = await fetch("/api/auth/confirm-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          code: normalizedCode,
          ...(password ? { password } : {}),
        }),
      });

      const result = await parseAuthResponse<ConfirmSignupSuccess>(response);

      if (result.success) {
        clearSignupPasswordBridge();
        clearSignupEmail();
      }

      return result;
    } catch (error: unknown) {
      console.log("[useConfirmSignup] Network error:", error);
      return authClientError(
        "server_error",
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleConfirmSignup,
    isProcessing,
  };
}
