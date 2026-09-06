"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { getManagementTreatmentApi, updateTreatmentApi } from "@cosmediate/api";
import { NoDataFound, Toaster, EntityFormLoader } from "@cosmediate/ui";
import { Treatment } from "@cosmediate/type-utils/";
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

import { CiMedicalCase } from "react-icons/ci";

const UpdateTreatment = () => {
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const treatmentId = searchParams.id;

  const handleFetchTreatment = useCallback(async () => {
    if (!treatmentId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementTreatmentApi(
        { id: treatmentId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setTreatment(response.item);
      } else {
        showApiFailureToast(response, "Failed to load treatment");
      }
    } catch (error) {
      console.error("Error fetching treatment:", error);
      Toaster("An error occurred while loading treatment data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [treatmentId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: TreatmentFormValues) => {
    if (!treatmentId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await updateTreatmentApi(
        buildTreatmentFormData(data, { id: treatmentId }),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: TREATMENT_FORM_FIELD_MAP,
        successMessage: "Treatment data updated successfully",
        errorTitle: "Failed to update treatment",
        onSuccess: () => router.push("/treatments"),
      });
    } catch (error) {
      console.error(
        "[Treatment_handleSubmit] Error while updating treatment:",
        error,
      );
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update treatment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(panelHeaderConfig.admin.treatments.update, "treatment");

  useEffect(() => {
    handleFetchTreatment();
  }, [handleFetchTreatment, treatmentId]);

  if (isLoading && !treatment) {
    return <EntityFormLoader />;
  }

  if (!treatment && !isLoading) {
    return (
      <NoDataFound
        message="Treatment data not found"
        description="Please try again or contact support"
        icon={<CiMedicalCase className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Update Treatment
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update {treatment?.name}
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      {treatment && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <TreatmentForm
            ref={formRef}
            initialData={treatment}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Treatment"
            isUpdate
          />
        </div>
      )}
    </div>
  );
};

export default UpdateTreatment;
