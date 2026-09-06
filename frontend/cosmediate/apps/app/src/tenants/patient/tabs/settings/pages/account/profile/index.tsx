"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";

import type { Patient } from "@cosmediate/type-utils/auth";

import { patchSessionUserFromProfileEntity, useAuth } from "@cosmediate/auth";
import { Toaster, NoDataFound, ProfileLoader } from "@cosmediate/ui";
import { getPatientApi, updatePatientApi } from "@cosmediate/api";

import {
  PATIENT_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";
import type { FormApiRef } from "@app/lib/form-api-ref";
import { parseError } from "@app/lib/utils";

import { buildPatientProfileFormData } from "./buildProfileFormData";
import { ProfileForm } from "./components/ProfileForm";
import { ProfileFormValues } from "./profile.types";

import { LiaUserAltSlashSolid } from "react-icons/lia";

const Profile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session, sessionUser, handleSetSessionUser, isSessionLoading } =
    useAuth();
  const { setPanelHeaderConfig } = usePanelHeader();

  const profileId = sessionUser?.profileId;

  const fetchPatient = useCallback(async () => {
    if (!profileId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
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
        showApiFailureToast(response, "Failed to load profile data");
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
  }, [profileId, session?.tokens?.accessToken]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const handleSubmit = async (data: ProfileFormValues) => {
    if (!profileId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await updatePatientApi(
        buildPatientProfileFormData(data, {
          id: profileId,
          status: patient?.status,
        }),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: PATIENT_FORM_FIELD_MAP,
        successMessage: "Profile updated successfully",
        errorTitle: "Failed to update profile",
        validationErrorTitle: "Please fix the highlighted fields",
        onSuccess: async () => {
          await fetchPatient();
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

  useEffect(() => {
    setPanelHeaderConfig(panelHeaderConfig.patient.settings.profile);
  }, [setPanelHeaderConfig]);

  if ((isLoading || isSessionLoading) && !patient) {
    return <ProfileLoader />;
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

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          My Profile
        </h1>
        <p className="text-sm text-400">Update your personal information</p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        {patient && (
          <ProfileForm
            ref={formRef}
            initialData={patient}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
