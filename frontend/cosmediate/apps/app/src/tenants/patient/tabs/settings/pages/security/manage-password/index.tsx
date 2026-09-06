"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";

import {
  Toaster,
  PasswordFormLoader,
  NoDataFound,
  InfoMessage,
} from "@cosmediate/ui";
import { getPatientApi } from "@cosmediate/api";
import type { Patient } from "@cosmediate/type-utils/auth";
import { SocialAccounts } from "@cosmediate/auth";
import { useAuth } from "@cosmediate/auth";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";
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
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session, sessionUser, isSessionLoading, identityId } = useAuth();
  const { setPanelHeaderConfig } = usePanelHeader();

  const profileId = sessionUser?.profileId;

  const fetchPatient = useCallback(async () => {
    if (!profileId || !session?.tokens?.accessToken) {
      if (!profileId) setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getPatientApi(
        { id: profileId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setPatient(response.item);
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
    fetchPatient();
  }, [fetchPatient]);

  useEffect(() => {
    if (searchParams.get("linked") === "google") {
      Toaster("Google connected successfully", "success");
      void fetchPatient();
    }
  }, [searchParams, fetchPatient]);

  const handleSubmit = async (values: PasswordFormValues) => {
    if (!session?.tokens?.accessToken || !patient || !identityId) return;

    const userHasPassword = patient?.passwordSet || false;

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
          result.action === "password_updated"
            ? "You will be redirected to sign in."
            : "Please sign in again with your new password.",
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
      let errorMsg = parsedErrorMsg;

      if (parsedErrorMsg.toLowerCase().includes("unauthorized")) {
        errorMsg = "Unauthorized Access, please signin again";
      }

      Toaster("An error occurred while updating password", "error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setPanelHeaderConfig(
      panelHeaderConfig.patient.settings.security.managePassword,
    );
  }, [setPanelHeaderConfig]);

  if ((isLoading || isSessionLoading) && !patient) {
    return <PasswordFormLoader />;
  }

  if (!patient && !isLoading && !isSessionLoading) {
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

  const userHasPassword = patient?.passwordSet || false;
  const linkedProviders = patient?.linkedProviders || [];

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
