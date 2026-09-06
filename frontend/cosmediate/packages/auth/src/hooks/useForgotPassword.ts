"use client";

import { useState } from "react";

import { validateEmail } from "@auth-core/lib/auth.utils";
import {
  authClientError,
  parseAuthResponse,
  type AuthHookResult,
} from "@auth-core/lib/parseAuthResponse";

import { beginResendCooldown } from "./useResendCooldown";

export interface ForgotPasswordSuccessData {
  message?: string;
  status?: string;
}

export type ForgotPasswordSuccess = { success: true } & ForgotPasswordSuccessData;
export type ForgotPasswordResult = AuthHookResult<ForgotPasswordSuccess>;

interface UseForgotPassword {
  handleForgotPassword: (email: string) => Promise<ForgotPasswordResult>;
  isProcessing: boolean;
}

export function useForgotPassword(): UseForgotPassword {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleForgotPassword = async (
    email: string
  ): Promise<ForgotPasswordResult> => {
    setIsProcessing(true);
    try {
      if (!email || !validateEmail(email)) {
        return authClientError("invalid_request", "Please enter valid email");
      }

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const result = await parseAuthResponse<ForgotPasswordSuccess>(response);

      if (result.success) {
        try {
          localStorage.setItem("auth_forgot_password_email", email);
          beginResendCooldown("auth_forgot_password_resend");
        } catch {
          // localStorage may be unavailable — non-fatal.
        }
      }

      return result;
    } catch (error: unknown) {
      console.log("[useForgotPassword] Network error:", error);
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
    handleForgotPassword,
    isProcessing,
  };
}
