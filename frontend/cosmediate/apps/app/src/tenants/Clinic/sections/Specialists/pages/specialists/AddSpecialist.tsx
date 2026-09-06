"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createSpecialistApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";
import { InfoMessage } from "@cosmediate/ui";

import {
  handleCrudMutationResult,
  showApiFailureToast,
  SPECIALIST_FORM_FIELD_MAP,
} from "@app/lib/api-errors";
import { useWorkspaceListScope } from "@app/hooks/useWorkspaceListScope";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { withSpecialistImagePlaceholder } from "@app/lib/form-field-limits";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { SpecialistForm } from "../../components/form/specialist/SpecialistForm";
import { buildSpecialistFormData } from "../../lib/buildSpecialistFormData";
import { SpecialistFormValues } from "../../types/specialist.types";

const AddSpecialist = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();
  const { isScopeReady, scopeBlockedReason, createScope } =
    useWorkspaceListScope({
      tab: "specialists",
    });

  const activeClinicId =
    typeof createScope.clinicId === "string" ? createScope.clinicId : undefined;

  const handleSubmit = async (data: Partial<SpecialistFormValues>) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const payload = await withSpecialistImagePlaceholder(data);
      const response = await createSpecialistApi(
        buildSpecialistFormData(
          payload,
          {},
          { clinicDashboard: true, activeClinicId },
        ),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: SPECIALIST_FORM_FIELD_MAP,
        successMessage: "Specialist created successfully",
        errorTitle: "Failed to create specialist",
        onSuccess: () => router.push("/specialists"),
      });
    } catch (error) {
      console.error(
        "[Specialist_handleSubmit] Error creating specialist:",
        error,
      );
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create specialist",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(panelHeaderConfig.clinic.specialists.add, "specialist");

  if (!isScopeReady && scopeBlockedReason) {
    return (
      <div className="w-full my-5">
        <InfoMessage
          title="Clinic scope required"
          message={scopeBlockedReason}
          variant="info"
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Specialist
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create new specialist
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <SpecialistForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Specialist"
          clinicDashboard
          defaultParentClinicId={activeClinicId}
        />
      </div>
    </div>
  );
};

export default AddSpecialist;
