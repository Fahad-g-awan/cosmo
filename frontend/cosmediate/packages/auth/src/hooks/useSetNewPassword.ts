"use client";

import { useState } from "react";

import { isStrongPassword } from "@auth-core/lib/auth.utils";
import {
  authClientError,
  parseAuthResponse,
  type AuthHookResult,
} from "@auth-core/lib/parseAuthResponse";

export interface SetNewPasswordSuccessData {
  redirectTo?: string;
  message?: string;
}

export type SetNewPasswordSuccess = { success: true } & SetNewPasswordSuccessData;
export type SetNewPasswordResult = AuthHookResult<SetNewPasswordSuccess>;

interface UseSetNewPassword {
  handleSetNewPassword: (password: string) => Promise<SetNewPasswordResult>;
  isProcessing: boolean;
}

export function useSetNewPassword(): UseSetNewPassword {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSetNewPassword = async (
    password: string
  ): Promise<SetNewPasswordResult> => {
    setIsProcessing(true);
    try {
      if (!password.trim() || !isStrongPassword(password)) {
        return authClientError(
          "invalid_request",
          "Please enter valid password"
        );
      }

      const response = await fetch(`/api/auth/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      return await parseAuthResponse<SetNewPasswordSuccess>(response);
    } catch (error: unknown) {
      console.log("[useSetNewPassword] Network error:", error);
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
    handleSetNewPassword,
    isProcessing,
  };
}
