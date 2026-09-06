"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClinicApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  CLINIC_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { ClinicForm } from "../../components/form/clinic/ClinicForm";
import {
  buildClinicFormData,
  withClinicImagePlaceholders,
} from "../../lib/buildClinicFormData";
import { ClinicFormValues } from "../../types/clinic.types";

const AddClinic = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);
  const submitInFlightRef = useRef(false);

  const { session } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: Partial<ClinicFormValues>) => {
    if (!session?.tokens?.accessToken) return;
    if (submitInFlightRef.current) return;

    submitInFlightRef.current = true;
    setIsSubmitting(true);

    try {
      const payload = await withClinicImagePlaceholders(data);
      const response = await createClinicApi(
        buildClinicFormData(payload),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: CLINIC_FORM_FIELD_MAP,
        successMessage: "Clinic created successfully",
        errorTitle: "Failed to create clinic",
        onSuccess: () => router.push("/clinic-management"),
      });
    } catch (error) {
      console.error("[Clinic_handleSubmit] Error creating clinic:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create clinic",
      );
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(panelHeaderConfig.admin.clinicManagement.add, "clinic");

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Clinic
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create new clinic
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <ClinicForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Clinic"
        />
      </div>
    </div>
  );
};

export default AddClinic;
