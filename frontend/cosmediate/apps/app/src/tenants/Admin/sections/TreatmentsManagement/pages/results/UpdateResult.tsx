"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  NoDataFound,
  Toaster,
  TreatmentResultsFormLoader,
} from "@cosmediate/ui";
import {
  getManagementTreatmentResultApi,
  updateTreatmentResultApi,
} from "@cosmediate/api";
import { TreatmentResult } from "@cosmediate/type-utils/";
import { useAuth } from "@cosmediate/auth";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import {
  TREATMENT_RESULT_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { TreatmentResultForm } from "../../components/form/treatmentResult/TreatmentResultForm";
import { buildTreatmentResultFormData } from "../../lib/buildTreatmentResultFormData";
import { TreatmentResultFormValues } from "../../types/treatmentResult.types";

import { CiMedicalCase } from "react-icons/ci";

const UpdateTreatmentResult = () => {
  const [treatmentResult, setTreatmentResult] =
    useState<TreatmentResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const treatmentResultId = searchParams.id;

  const handleFetchTreatmentResult = useCallback(async () => {
    if (!treatmentResultId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementTreatmentResultApi(
        { id: treatmentResultId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setTreatmentResult(response.item);
      } else {
        showApiFailureToast(response, "Failed to load treatment result");
      }
    } catch (error) {
      console.error("Error fetching treatment result:", error);
      Toaster("An error occurred while loading treatment result data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [treatmentResultId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: TreatmentResultFormValues) => {
    if (!treatmentResultId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await updateTreatmentResultApi(
        buildTreatmentResultFormData(data, { id: treatmentResultId }),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: TREATMENT_RESULT_FORM_FIELD_MAP,
        successMessage: "Treatment result updated successfully",
        errorTitle: "Failed to update treatment result",
        onSuccess: () => router.push("/treatments/results"),
      });
    } catch (error) {
      console.error(
        "[Treatment_Result_handleSubmit] Error while updating treatment result:",
        error,
      );
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update treatment result",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.treatments.results.update,
    "treatment_result",
  );

  useEffect(() => {
    handleFetchTreatmentResult();
  }, [handleFetchTreatmentResult, treatmentResultId]);

  if (isLoading && !treatmentResult) {
    return <TreatmentResultsFormLoader />;
  }

  if (!treatmentResult && !isLoading) {
    return (
      <NoDataFound
        message="Treatment result data not found"
        description="Please try again or contact support"
        icon={<CiMedicalCase className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Update Treatment Result
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update treatment result for{" "}
          {treatmentResult?.treatmentName}
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      {treatmentResult && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <TreatmentResultForm
            ref={formRef}
            initialData={treatmentResult}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Treatment Result"
            isUpdate
          />
        </div>
      )}
    </div>
  );
};

export default UpdateTreatmentResult;
