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

import { TreatmentResultForm } from "../../../components/form/treatmentResult/TreatmentResultForm";
import { UPDATE_ALLOWED_FIELDS } from "../../../constants/treatmentResult.constants";
import { TreatmentResultFormData } from "../../../types/treatmentResult.types";

import { CiMedicalCase } from "react-icons/ci";

const RESULTS_BASE_PATH = "/settings/treatments-management/results";

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
        Toaster("Failed to load treatment result data", "error");
      }
    } catch (error) {
      console.error("Error fetching treatment result:", error);
      Toaster("An error occurred while loading treatment result data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [treatmentResultId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: Partial<TreatmentResultFormData>) => {
    if (!treatmentResultId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const requestData: Record<string, unknown> = {
        id: treatmentResultId,
      };

      Object.entries(data).forEach(([key, value]) => {
        if (
          UPDATE_ALLOWED_FIELDS.has(key) &&
          value !== undefined &&
          value !== null
        ) {
          requestData[key] = value;
        }
      });

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

      const response = await updateTreatmentResultApi(
        formData,
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: TREATMENT_RESULT_FORM_FIELD_MAP,
        successMessage: "Treatment result data updated successfully",
        errorTitle: "Failed to update treatment result",
        onSuccess: () => router.push(RESULTS_BASE_PATH),
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
    panelHeaderConfig.clinic.settings.treatments.results.update,
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
      </div>

      {treatmentResult && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <TreatmentResultForm
            ref={formRef}
            initialData={{
              ...treatmentResult,
              clinicTreatmentId: treatmentResult.clinicTreatmentId,
              treatmentId: treatmentResult.treatmentId,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Treatment Result"
            clinicGalleryMode={Boolean(treatmentResult.clinicTreatmentId)}
          />
        </div>
      )}
    </div>
  );
};

export default UpdateTreatmentResult;
