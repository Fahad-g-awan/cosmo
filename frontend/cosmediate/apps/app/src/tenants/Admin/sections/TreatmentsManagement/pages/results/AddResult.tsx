"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createTreatmentResultApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import type { FormApiRef } from "@app/lib/form-api-ref";
import {
  TREATMENT_RESULT_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";

import { TreatmentResultForm } from "../../components/form/treatmentResult/TreatmentResultForm";
import { buildTreatmentResultFormData } from "../../lib/buildTreatmentResultFormData";
import { TreatmentResultFormValues } from "../../types/treatmentResult.types";

const AddTreatmentResult = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: TreatmentResultFormValues) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await createTreatmentResultApi(
        buildTreatmentResultFormData(data, { ownerType: "ADMIN" }),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: TREATMENT_RESULT_FORM_FIELD_MAP,
        successMessage: "Treatment result created successfully",
        errorTitle: "Failed to create treatment result",
        onSuccess: () => router.push("/treatments/results"),
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
    panelHeaderConfig.admin.treatments.results.add,
    "treatment_result",
  );

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Treatment Result
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create new treatment result
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <TreatmentResultForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Treatment Result"
        />
      </div>
    </div>
  );
};

export default AddTreatmentResult;
