"use client";

import React, { useEffect, useRef, useState } from "react";

import { NoDataFound, EntityFormLoader } from "@cosmediate/ui";
import { Clinic, Specialist } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";
import {
  CLINIC_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
  SPECIALIST_FORM_FIELD_MAP,
} from "@app/lib/api-errors";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { ClinicForm } from "../../components/clinicSetup/ClinicForm";
import {
  buildClinicSetupFormData,
  SPECIALIST_ALLOWED_FIELDS,
} from "../../lib/buildClinicSetupFormData";
import { CLINIC_ALLOWED_FIELDS } from "../../constants/clinic.constants";
import { ClinicFormValues } from "../../types/clinic.types";
import { useClinicSetup } from "../../hooks/useClinicSetup";
import { TabHeader } from "../../components/TabHeader";

import { CiMedicalCase } from "react-icons/ci";

const ClinicSetupFormPage = ({
  children,
  sectionTitle,
  sectionDescription,
}: {
  children: (props: {
    initialData: Partial<Clinic | Specialist>;
    onSubmit: (data: Partial<ClinicFormValues>) => Promise<void>;
    isSubmitting: boolean;
  }) => React.ReactNode;
  sectionTitle?: string;
  sectionDescription?: string;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { isLoading, initialData, handleUpdate, refetch } = useClinicSetup();

  const { setPanelHeaderConfig } = usePanelHeader();
  const { session, userRole } = useAuth();

  const handleSubmit = async (data: Partial<ClinicFormValues>) => {
    if (!initialData || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await handleUpdate(
        buildClinicSetupFormData(
          data,
          { id: initialData.id },
          {
            clearEmptyOptionals: true,
            allowedFields:
              userRole === "SPECIALIST"
                ? SPECIALIST_ALLOWED_FIELDS
                : CLINIC_ALLOWED_FIELDS,
          },
        ),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap:
          userRole === "SPECIALIST"
            ? SPECIALIST_FORM_FIELD_MAP
            : CLINIC_FORM_FIELD_MAP,
        successMessage: "Updated successfully",
        errorTitle: "Failed to update",
        onSuccess: () => {
          void refetch();
        },
      });
    } catch (error) {
      console.error("[Clinic_handleSubmit] Error while updating data:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const panelConfig =
    userRole === "SPECIALIST"
      ? panelHeaderConfig.specialist.settings.clinicProfile
      : panelHeaderConfig.clinic.settings.clinicProfile;

  useEffect(() => {
    setPanelHeaderConfig(panelConfig);
  }, [setPanelHeaderConfig, userRole, panelConfig]);

  if (isLoading && !initialData) {
    return <EntityFormLoader />;
  }

  if (!initialData && !isLoading) {
    return (
      <NoDataFound
        message={`${userRole === "SPECIALIST" ? "Specialist" : "Clinic"} data not found`}
        description="Please try again or contact support"
        icon={<CiMedicalCase className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <TabHeader
        title={
          sectionTitle ||
          (userRole === "SPECIALIST"
            ? "Advance Profile Setup"
            : "Clinic profile setup")
        }
        description={
          sectionDescription ||
          (userRole === "SPECIALIST"
            ? "Set up and manage your specialist profile details, services, and operational information."
            : "Set up and manage Clinic details, services, and operational information.")
        }
      />
      <p className="w-full text-xs text-500">
        Required fields are marked with <span className="text-red-400">*</span>
      </p>

      {initialData && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <ClinicForm
            key={`${initialData.id}-${initialData.updatedAt}`}
            ref={formRef}
            initialData={initialData}
          >
            {children({ initialData, onSubmit: handleSubmit, isSubmitting })}
          </ClinicForm>
        </div>
      )}
    </div>
  );
};

export default ClinicSetupFormPage;
