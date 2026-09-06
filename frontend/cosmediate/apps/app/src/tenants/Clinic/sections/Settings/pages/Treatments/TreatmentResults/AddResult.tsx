"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useRef, useState } from "react";

import { createTreatmentResultApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";
import { Toaster } from "@cosmediate/ui";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import type { FormApiRef } from "@app/lib/form-api-ref";
import {
  TREATMENT_RESULT_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";

import { TreatmentResultForm } from "../../../components/form/treatmentResult/TreatmentResultForm";
import { TreatmentResultFormData } from "../../../types/treatmentResult.types";
import { ALLOWED_FIELDS } from "../../../constants/treatmentResult.constants";

const RESULTS_BASE_PATH = "/settings/treatments-management/results";

const AddTreatmentResult = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicTreatmentId = searchParams.get("clinicTreatmentId") ?? "";
  const clinicGalleryMode = Boolean(clinicTreatmentId);

  const handleSubmit = async (data: Partial<TreatmentResultFormData>) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const resolvedClinicTreatmentId =
        clinicTreatmentId || String(data.clinicTreatmentId ?? "").trim();

      if (!resolvedClinicTreatmentId) {
        Toaster("Please select a clinic treatment offering", "error");
        return;
      }

      const requestData: Record<string, unknown> = {
        ownerType: "CLINIC",
        clinicTreatmentId: resolvedClinicTreatmentId,
      };

      Object.entries(data).forEach(([key, value]) => {
        if (ALLOWED_FIELDS.has(key) && value !== undefined && value !== null) {
          requestData[key] = value;
        }
      });

      requestData.clinicTreatmentId = resolvedClinicTreatmentId;
      delete requestData.treatmentId;

      const formData = new FormData();

      Object.entries(requestData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object" && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === "string" || value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await createTreatmentResultApi(
        formData,
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: TREATMENT_RESULT_FORM_FIELD_MAP,
        successMessage: "Treatment result created successfully",
        errorTitle: "Failed to create treatment result",
        onSuccess: () => router.push(RESULTS_BASE_PATH),
      });
    } catch (error) {
      console.error(
        "[Treatment_Results_handleSubmit] Error creating data:",
        error,
      );
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create treatment result",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.clinic.settings.treatments.results.add,
    "treatment_result",
  );

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Treatment Result
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create a new before/after result
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <TreatmentResultForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Treatment Result"
          clinicGalleryMode={clinicGalleryMode}
          initialData={
            clinicTreatmentId
              ? { clinicTreatmentId, description: "" }
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default AddTreatmentResult;
