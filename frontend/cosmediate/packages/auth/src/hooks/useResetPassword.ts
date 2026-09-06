"use client";

import { useState } from "react";

import { isStrongPassword } from "@auth-core/lib/auth.utils";
import {
  authClientError,
  parseAuthResponse,
  type AuthHookResult,
} from "@auth-core/lib/parseAuthResponse";

export interface ResetPasswordSuccessData {
  message?: string;
  status?: string;
}

export type ResetPasswordSuccess = { success: true } & ResetPasswordSuccessData;
export type ResetPasswordResult = AuthHookResult<ResetPasswordSuccess>;

type UseResetPassword = {
  handleResetPassword: (
    code: string,
    newPassword: string
  ) => Promise<ResetPasswordResult>;
  isProcessing: boolean;
};

export function useResetPassword(): UseResetPassword {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResetPassword = async (
    code: string,
    newPassword: string
  ): Promise<ResetPasswordResult> => {
    setIsProcessing(true);
    try {
      const email =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_forgot_password_email")
          : null;

      if (!email) {
        return authClientError(
          "invalid_request",
          "Something went wrong, please try again"
        );
      }
      if (!code || code.toLowerCase() === "") {
        return authClientError(
          "invalid_request",
          "Please enter a valid verification code"
        );
      }
      if (!newPassword || !isStrongPassword(newPassword)) {
        return authClientError(
          "invalid_request",
          "Please enter a valid password"
        );
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code, newPassword }),
      });

      const result = await parseAuthResponse<ResetPasswordSuccess>(response);

      if (result.success) {
        try {
          localStorage.removeItem("auth_forgot_password_email");
        } catch {
          // localStorage may be unavailable — non-fatal.
        }
      }

      return result;
    } catch (error: unknown) {
      console.log("[useResetPassword] Network error:", error);
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
    handleResetPassword,
    isProcessing,
  };
}
