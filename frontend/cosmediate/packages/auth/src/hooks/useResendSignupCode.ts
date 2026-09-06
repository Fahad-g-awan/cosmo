"use client";

import { useState } from "react";
import { validateEmail } from "@auth-core/lib/auth.utils";

interface ResendResult {
  success: boolean;
  message: string;
}

interface UseResendSignupCode {
  handleResendSignupCode: (email?: string) => Promise<ResendResult | undefined>;
  isProcessing: boolean;
}

/**
 * Resends the email-verification code for a pending signup.
 *
 * Email is taken from the argument when provided, otherwise from
 * `localStorage.auth_new_signup_email` (the key used by `useSignUp`).
 */
export function useResendSignupCode(): UseResendSignupCode {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResendSignupCode = async (email?: string) => {
    try {
      setIsProcessing(true);

      const resolvedEmail = (
        email ??
        (typeof window !== "undefined"
          ? (localStorage.getItem("auth_new_signup_email") ?? undefined)
          : undefined)
      )
        ?.trim()
        .toLowerCase();

      if (!resolvedEmail || !validateEmail(resolvedEmail)) {
        console.log("[useResendSignupCode] Invalid email");
        throw new Error("Please enter a valid email");
      }

      const response = await fetch("/api/auth/confirm-signup/resend", {
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
      console.log("[useResendSignupCode] Resend code hook error:", error);
      throw error instanceof Error ? error : new Error(String(error));
    } finally {
      setIsProcessing(false);
    }
  };

  return { handleResendSignupCode, isProcessing };
}
