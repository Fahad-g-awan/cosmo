"use client";

import { useState } from "react";

import { validateEmail, isStrongPassword } from "@auth-core/lib/auth.utils";
import {
  authClientError,
  parseAuthResponse,
  type AuthHookResult,
} from "@auth-core/lib/parseAuthResponse";
import { storeEncryptedSignupPassword } from "@auth-core/lib/signupPasswordBridge";

import { beginResendCooldown } from "./useResendCooldown";

export interface SignUpSuccessData {
  email?: string;
  message?: string;
  requiresVerification?: boolean;
  status?: string;
}

export type SignUpSuccess = { success: true } & SignUpSuccessData;
export type SignUpResult = AuthHookResult<SignUpSuccess>;

type UseSignUp = {
  handleSignup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    age?: string,
    phone?: string,
    country?: string,
    state?: string,
    city?: string,
    postalCode?: string
  ) => Promise<SignUpResult>;
  isProcessing: boolean;
};

export function useSignUp(): UseSignUp {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
    city?: string,
    age?: string,
    country?: string,
    state?: string,
    postalCode?: string
  ): Promise<SignUpResult> => {
    setIsProcessing(true);
    try {
      if (!validateEmail(email)) {
        return authClientError("invalid_request", "Please enter valid email");
      }
      if (!isStrongPassword(password)) {
        return authClientError(
          "invalid_request",
          "Please enter valid password"
        );
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          age,
          phone,
          country,
          state,
          city,
          postalCode,
        }),
      });

      const result = await parseAuthResponse<SignUpSuccess>(response);

      if (result.success) {
        try {
          localStorage.setItem(
            "auth_new_signup_email",
            email.trim().toLowerCase(),
          );
          beginResendCooldown("auth_confirm_signup_resend");
        } catch {
          // localStorage may be unavailable (SSR / private mode) — non-fatal.
        }
        await storeEncryptedSignupPassword(password);
      }

      return result;
    } catch (error: unknown) {
      console.log("[useSignup] Network error:", error);
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
    handleSignup,
    isProcessing,
  };
}

export default useSignUp;
