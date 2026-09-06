"use client";

import { useState } from "react";

import { isStrongPassword } from "@auth-core/lib/auth.utils";
import {
  authClientError,
  parseAuthResponse,
  type AuthHookResult,
} from "@auth-core/lib/parseAuthResponse";

export interface UpdatePasswordSuccessData {
  redirectTo?: string;
  message?: string;
}

export type UpdatePasswordSuccess = { success: true } & UpdatePasswordSuccessData;
export type UpdatePasswordResult = AuthHookResult<UpdatePasswordSuccess>;

interface UseUpdatePassword {
  handleUpdatePassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<UpdatePasswordResult>;
  isProcessing: boolean;
}

export function useUpdatePassword(): UseUpdatePassword {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdatePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<UpdatePasswordResult> => {
    setIsProcessing(true);
    try {
      if (!oldPassword.trim()) {
        return authClientError(
          "invalid_request",
          "Please enter valid old password"
        );
      }
      if (!newPassword.trim() || !isStrongPassword(newPassword)) {
        return authClientError(
          "invalid_request",
          "Please enter valid new password"
        );
      }

      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      return await parseAuthResponse<UpdatePasswordSuccess>(response);
    } catch (error: unknown) {
      console.log("[useUpdatePassword] Network error:", error);
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
    handleUpdatePassword,
    isProcessing,
  };
}
