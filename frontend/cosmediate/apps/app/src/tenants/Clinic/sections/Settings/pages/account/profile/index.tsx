"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";

import { Toaster, NoDataFound, ProfileLoader } from "@cosmediate/ui";

import type { ClinicManager } from "@cosmediate/type-utils/auth";
import type { Specialist } from "@cosmediate/type-utils";

import {
  getClinicManagerApi,
  getManagementSpecialistApi,
  updateClinicManagerApi,
  updateSpecialistApi,
} from "@cosmediate/api";
import { patchSessionUserFromProfileEntity, useAuth } from "@cosmediate/auth";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";
import {
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import type { FormApiRef } from "@app/lib/form-api-ref";
import { parseError } from "@app/lib/utils";

import {
  getProfileFieldMap,
  type AccountProfileRole,
} from "./profile.constants";
import { buildAccountProfileFormData } from "./buildProfileFormData";
import { TabHeader } from "../../../components/TabHeader";
import { ProfileForm } from "./components/ProfileForm";
import { ProfileFormValues } from "./profile.types";

import { LiaUserAltSlashSolid } from "react-icons/lia";

type AccountProfileEntity = ClinicManager | Specialist;

const Profile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<AccountProfileEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const {
    session,
    userRole,
    sessionUser,
    handleSetSessionUser,
    isSessionLoading,
  } = useAuth();
  const { setPanelHeaderConfig } = usePanelHeader();

  const profileId = sessionUser?.profileId;
  const accessToken = session?.tokens?.accessToken;
  const accountRole: AccountProfileRole =
    userRole === "SPECIALIST" ? "SPECIALIST" : "MANAGER";
  const isSpecialist = accountRole === "SPECIALIST";

  const handleFetchUser = useCallback(async () => {
    if (!profileId || !accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = isSpecialist
        ? await getManagementSpecialistApi(
            { id: profileId, from: "listing" },
            accessToken,
          )
        : await getClinicManagerApi({ id: profileId }, accessToken);

      if (response.success && response.item) {
        setUser(response.item);
      } else {
        showApiFailureToast(
          response,
          "Failed to load profile data",
          "Unable to load your profile. Please try again.",
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
  }, [profileId, accessToken, isSpecialist]);

  useEffect(() => {
    void handleFetchUser();
  }, [handleFetchUser]);

  const handleSubmit = async (data: ProfileFormValues) => {
    if (!profileId || !accessToken) return;

    try {
      setIsSubmitting(true);

      const formData = buildAccountProfileFormData(
        profileId,
        data,
        accountRole,
        user,
      );

      const response = isSpecialist
        ? await updateSpecialistApi(formData, accessToken)
        : await updateClinicManagerApi(formData, accessToken);

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: getProfileFieldMap(accountRole),
        successMessage: "Profile updated successfully",
        errorTitle: "Failed to update profile",
        validationErrorTitle: "Please fix the highlighted fields",
        onSuccess: async () => {
          await handleFetchUser();
          if (response.item && sessionUser) {
            handleSetSessionUser(
              patchSessionUserFromProfileEntity(sessionUser, response.item),
            );
          }
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update profile",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const panelConfig = isSpecialist
    ? panelHeaderConfig.specialist.settings.account.profile
    : panelHeaderConfig.clinic.settings.account.profile;

  useEffect(() => {
    setPanelHeaderConfig(panelConfig);
  }, [setPanelHeaderConfig, panelConfig]);

  if ((isLoading || isSessionLoading) && !user) {
    return <ProfileLoader />;
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

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <TabHeader
        title="My Profile"
        description="Update your personal information"
      />
      <p className="w-full text-xs text-500 -mt-2">
        Required fields are marked with <span className="text-red-400">*</span>
      </p>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        {user && (
          <ProfileForm
            ref={formRef}
            role={accountRole}
            initialData={user}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
