"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";

import type { ClinicManager } from "@cosmediate/type-utils/auth";
import type { Specialist } from "@cosmediate/type-utils";

import {
  Toaster,
  PasswordFormLoader,
  NoDataFound,
  InfoMessage,
} from "@cosmediate/ui";
import {
  getAuthMeMethodsApi,
  getClinicManagerApi,
  getManagementSpecialistApi,
} from "@cosmediate/api";
import { SocialAccounts } from "@cosmediate/auth";
import { useAuth } from "@cosmediate/auth";

import {
  logoutAndRedirectToAuthSignin,
  submitSettingsPassword,
} from "@app/lib/settings-password";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";
import { showApiFailureToast, type FormApiRef } from "@app/lib/api-errors";
import { PASSWORD_FORM_FIELD_MAP } from "@app/lib/password-form.schema";
import { parseError } from "@app/lib/utils";

import { TabHeader } from "../../../../components/TabHeader";
import { PasswordForm } from "./components/PasswordForm";
import { PasswordFormValues } from "./password.types";

import { LiaUserAltSlashSolid } from "react-icons/lia";
import { Shield } from "lucide-react";

const SETTINGS_RETURN_TO = "/settings/account/security/manage-password";

type AccountUser = ClinicManager | Specialist;

const ManagePassword = () => {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session, userRole, sessionUser, isSessionLoading, identityId } =
    useAuth();
  const { setPanelHeaderConfig } = usePanelHeader();

  const profileId = sessionUser?.profileId;
  const accessToken = session?.tokens?.accessToken;
  const isSpecialist = userRole === "SPECIALIST";

  const refreshLinkedProviders = useCallback(async () => {
    if (!accessToken) return;

    try {
      const methods = await getAuthMeMethodsApi(accessToken);
      if (methods.success) {
        setLinkedProviders(methods.linkedProviders ?? []);
      }
    } catch (error) {
      console.error("Error refreshing auth methods:", error);
    }
  }, [accessToken]);

  const handleFetchUser = useCallback(async () => {
    if (!profileId || !accessToken) {
      if (!profileId) setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [profileResponse] = await Promise.all([
        isSpecialist
          ? getManagementSpecialistApi(
              { id: profileId, from: "listing" },
              accessToken,
            )
          : getClinicManagerApi({ id: profileId }, accessToken),
        refreshLinkedProviders(),
      ]);

      if (profileResponse.success && profileResponse.item) {
        setUser(profileResponse.item);
      } else {
        showApiFailureToast(
          profileResponse,
          "Failed to load profile data",
          "Unable to load your security settings. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      Toaster(
        "An error occurred while loading profile data",
        "error",
        parseError(error),
      );
    } finally {
      setIsLoading(false);
    }
  }, [profileId, accessToken, isSpecialist, refreshLinkedProviders]);

  useEffect(() => {
    void handleFetchUser();
  }, [handleFetchUser]);

  useEffect(() => {
    if (searchParams.get("linked") === "google") {
      Toaster("Google connected successfully", "success");
      void refreshLinkedProviders();
      void handleFetchUser();
    }
  }, [searchParams, handleFetchUser, refreshLinkedProviders]);

  const handleSubmit = async (values: PasswordFormValues) => {
    if (!accessToken || !user || !identityId) return;

    const userHasPassword = user?.passwordSet || false;

    setIsSubmitting(true);
    try {
      const result = await submitSettingsPassword({
        accessToken,
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

  const panelConfig = isSpecialist
    ? panelHeaderConfig.specialist.settings.account.security.managePassword
    : panelHeaderConfig.clinic.settings.account.security.managePassword;

  useEffect(() => {
    setPanelHeaderConfig(panelConfig);
  }, [setPanelHeaderConfig, panelConfig]);

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

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      <TabHeader
        title="Security Settings"
        description="Manage your password and connected accounts"
      />

      <div className="w-full flex flex-col items-center justify-start gap-6">
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <SocialAccounts
            linkedProviders={linkedProviders}
            context="settings"
            returnTo={SETTINGS_RETURN_TO}
          />
        </div>

        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-600" />
            <h2 className="text-lg font-semibold text-900">
              {userHasPassword ? "Update Password" : "Set Password"}
            </h2>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              {userHasPassword ? (
                <InfoMessage
                  message="Password is set for your account"
                  variant="success"
                />
              ) : (
                <InfoMessage
                  message="No password set. Set a password to enable email/password login."
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
