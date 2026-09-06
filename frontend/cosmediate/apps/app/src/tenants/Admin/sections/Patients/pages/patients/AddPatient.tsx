"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createPatientApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  PATIENT_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { withPatientImagePlaceholder } from "@app/lib/form-field-limits";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { PatientForm } from "../../components/form/PatientForm";
import { buildPatientFormData } from "../../lib/buildPatientFormData";
import { PatientFormValues } from "../../types/patient.types";

const AddPatient = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: Partial<PatientFormValues>) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const payload = await withPatientImagePlaceholder(data);
      const response = await createPatientApi(
        buildPatientFormData(payload),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: PATIENT_FORM_FIELD_MAP,
        successMessage: "Patient created successfully",
        errorTitle: "Failed to create patient",
        onSuccess: () => router.push("/patients"),
      });
    } catch (error) {
      console.error("Error creating patient:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create patient",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.patients?.add || {
      title: "Add Patient",
      description: "Create a new patient account",
    },
    "patient",
  );

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Patient
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create a new patient
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <PatientForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Patient"
        />
      </div>
    </div>
  );
};

export default AddPatient;
