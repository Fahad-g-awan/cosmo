"use client";

import { useState } from "react";
import { validateEmail } from "@auth-core/lib/auth.utils";

interface ResendResult {
  success: boolean;
  message: string;
}

interface UseResendForgotPasswordCode {
  handleResendForgotPasswordCode: (
    email?: string
  ) => Promise<ResendResult | undefined>;
  isProcessing: boolean;
}

/**
 * Resends the password-reset code.
 *
 * Email is taken from the argument when provided, otherwise from
 * `localStorage.auth_forgot_password_email` (the key used by `useForgotPassword`).
 */
export function useResendForgotPasswordCode(): UseResendForgotPasswordCode {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResendForgotPasswordCode = async (email?: string) => {
    try {
      setIsProcessing(true);

      const resolvedEmail =
        email ??
        (typeof window !== "undefined"
          ? (localStorage.getItem("auth_forgot_password_email") ?? undefined)
          : undefined);

      if (!resolvedEmail || !validateEmail(resolvedEmail)) {
        console.log("[useResendForgotPasswordCode] Invalid email");
        throw new Error("Please enter a valid email");
      }

      const response = await fetch("/api/auth/forgot-password/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: resolvedEmail }),
      });

      const result = (await response.json()) as ResendResult;

      if (result?.success) {
        return result;
      }

      throw new Error(
        result?.message || "Something went wrong, please try again."
      );
    } catch (error: unknown) {
      console.log(
        "[useResendForgotPasswordCode] Resend code hook error:",
        error
      );
      throw error instanceof Error ? error : new Error(String(error));
    } finally {
      setIsProcessing(false);
    }
  };

  return { handleResendForgotPasswordCode, isProcessing };
}
