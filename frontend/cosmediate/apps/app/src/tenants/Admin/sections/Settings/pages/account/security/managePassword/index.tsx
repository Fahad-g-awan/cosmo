"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";

import {
  Toaster,
  PasswordFormLoader,
  NoDataFound,
  InfoMessage,
} from "@cosmediate/ui";
import { getAdminApi } from "@cosmediate/api";
import { Admin } from "@cosmediate/type-utils/auth";
import { SocialAccounts } from "@cosmediate/auth";
import { useAuth } from "@cosmediate/auth";

import { usePanelHeader } from "@app/layout/management/context";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import {
  logoutAndRedirectToAuthSignin,
  submitSettingsPassword,
} from "@app/lib/settings-password";
import { showApiFailureToast, type FormApiRef } from "@app/lib/api-errors";
import { PASSWORD_FORM_FIELD_MAP } from "@app/lib/password-form.schema";
import { PasswordForm } from "./components/PasswordForm";
import { PasswordFormValues } from "./password.types";
import { parseError } from "@app/lib/utils";

import { LiaUserAltSlashSolid } from "react-icons/lia";
import { Shield } from "lucide-react";

const SETTINGS_RETURN_TO = "/settings/account/security/manage-password";

const ManagePassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const searchParams = useSearchParams();
  const { session, sessionUser, isSessionLoading, identityId } = useAuth();
  const { setPanelHeaderConfig } = usePanelHeader();

  const profileId = sessionUser?.profileId;

  const handleFetchUser = useCallback(async () => {
    if (!profileId || !session?.tokens?.accessToken) {
      if (!profileId) setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getAdminApi(
        { id: profileId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setUser(response.item);
      } else {
        Toaster("Failed to load profile data", "error");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      Toaster("An error occurred while loading profile data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [profileId, session?.tokens?.accessToken]);

  useEffect(() => {
    handleFetchUser();
  }, [handleFetchUser]);

  useEffect(() => {
    if (searchParams.get("linked") === "google") {
      Toaster("Google connected successfully", "success");
      void handleFetchUser();
    }
  }, [searchParams, handleFetchUser]);

  const handleSubmit = async (values: PasswordFormValues) => {
    if (!session?.tokens?.accessToken || !user || !identityId) return;

    const userHasPassword = user?.passwordSet || false;

    setIsSubmitting(true);
    try {
      const result = await submitSettingsPassword({
        accessToken: session.tokens.accessToken,
        userHasPassword,
        values,
      });

      if (result.ok) {
        Toaster(
          result.action === "password_updated"
            ? "Password updated successfully"
            : "Password set successfully",
          "success",
          "You will be redirected to sign in.",
        );
        setTimeout(() => {
          void logoutAndRedirectToAuthSignin(
            session.tokens?.accessToken,
            result.action,
          );
        }, 1500);
      } else {
        const fieldErrorCount =
          formRef.current?.setApiErrors(result, PASSWORD_FORM_FIELD_MAP) ?? 0;
        showApiFailureToast(
          result,
          fieldErrorCount > 0
            ? "Please fix the highlighted fields"
            : "Password update failed",
        );
      }
    } catch (error) {
      console.error("Error updating password:", error);
      const parsedErrorMsg = parseError(error);
      const errorMsg = parsedErrorMsg.toLowerCase().includes("unauthorized")
        ? "Unauthorized Access, please signin again"
        : parsedErrorMsg;

      Toaster("An error occurred while updating password", "error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setPanelHeaderConfig(
      panelHeaderConfig.admin.settings.account.security.managePassword,
    );
  }, [setPanelHeaderConfig]);

  if ((isLoading || isSessionLoading) && !user) {
    return <PasswordFormLoader />;
  }

  if (!user && !isLoading && !isSessionLoading) {
    return (
      <NoDataFound
        message="Profile data not found"
        description="Please signin again or contact support"
        icon={
          <LiaUserAltSlashSolid className="size-7 text-300" strokeWidth={1.5} />
        }
      />
    );
  }

  const userHasPassword = user?.passwordSet || false;
  const linkedProviders = user?.linkedProviders || [];

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      <div className="w-full ">
        <h1 className="text-2xl font-semibold text-gray-900">
          Security Settings
        </h1>
        <p className="text-sm text-400 mt-1">
          Manage your password and connected accounts
        </p>
      </div>

      <div className="w-full flex flex-col items-center justify-start gap-6">
        {/* Social Accounts Section */}
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <SocialAccounts
            linkedProviders={linkedProviders}
            context="settings"
            returnTo={SETTINGS_RETURN_TO}
          />
        </div>

        {/* Password Section */}
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-600" />
            <h2 className="text-lg font-semibold text-900">
              {userHasPassword ? "Update Password" : "Set Password"}
            </h2>
          </div>

          {/* Password status indicator */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              {userHasPassword ? (
                <InfoMessage
                  message="Password is set for your account"
                  variant="success"
                />
              ) : (
                <InfoMessage
                  message="No password set. Set a password to enable email/password
                    login."
                  variant="warning"
                />
              )}
            </div>
          </div>

          <PasswordForm
            ref={formRef}
            userHasPassword={userHasPassword}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default ManagePassword;
