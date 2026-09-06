"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createTreatmentApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  TREATMENT_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import type { FormApiRef } from "@app/lib/form-api-ref";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";

import { TreatmentForm } from "../../components/form/treatment/TreatmentForm";
import { buildTreatmentFormData } from "../../lib/buildTreatmentFormData";
import { TreatmentFormValues } from "../../types/treatment.types";

const AddTreatment = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: TreatmentFormValues) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await createTreatmentApi(
        buildTreatmentFormData(data),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: TREATMENT_FORM_FIELD_MAP,
        successMessage: "Treatment created successfully",
        errorTitle: "Failed to create treatment",
        onSuccess: () => router.push("/treatments"),
      });
    } catch (error) {
      console.error("[Treatment_handleSubmit] Error creating treatment:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create treatment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.treatments.add || {
      title: "Add Treatment",
      description: "Create a new treatment",
    },
    "treatment",
  );

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Treatment
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create new treatment
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <TreatmentForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Treatment"
        />
      </div>
    </div>
  );
};

export default AddTreatment;
