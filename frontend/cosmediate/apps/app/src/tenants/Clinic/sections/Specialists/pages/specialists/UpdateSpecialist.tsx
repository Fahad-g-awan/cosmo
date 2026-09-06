"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  NoDataFound,
  Toaster,
  EntityFormLoader,
  InfoMessage,
} from "@cosmediate/ui";
import {
  getManagementSpecialistApi,
  updateSpecialistApi,
} from "@cosmediate/api";
import { Specialist } from "@cosmediate/type-utils/";
import { useAuth } from "@cosmediate/auth";

import {
  handleCrudMutationResult,
  showApiFailureToast,
  SPECIALIST_FORM_FIELD_MAP,
} from "@app/lib/api-errors";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { withSpecialistImagePlaceholder } from "@app/lib/form-field-limits";
import type { FormApiRef } from "@app/lib/form-api-ref";
import { useWorkspaceListScope } from "@app/hooks/useWorkspaceListScope";

import { SpecialistForm } from "../../components/form/specialist/SpecialistForm";
import { buildSpecialistFormData } from "../../lib/buildSpecialistFormData";
import { SpecialistFormValues } from "../../types/specialist.types";

import { CiMedicalCase } from "react-icons/ci";

const UpdateSpecialist = () => {
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const specialistId = searchParams.id;
  const { createScope } = useWorkspaceListScope({ tab: "specialists" });
  const activeClinicId =
    typeof createScope.clinicId === "string" ? createScope.clinicId : undefined;

  const handleFetchSpecialist = useCallback(async () => {
    if (!specialistId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementSpecialistApi(
        { id: specialistId, from: "listing" },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setSpecialist(response.item);
      } else {
        showApiFailureToast(response, "Failed to load specialist");
      }
    } catch (error) {
      console.error("Error fetching specialist:", error);
      Toaster("An error occurred while loading specialist data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [specialistId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: Partial<SpecialistFormValues>) => {
    if (!specialistId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const payload = await withSpecialistImagePlaceholder(data);
      const response = await updateSpecialistApi(
        buildSpecialistFormData(
          payload,
          { id: specialistId },
          { clinicDashboard: true, activeClinicId, isUpdate: true },
        ),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: SPECIALIST_FORM_FIELD_MAP,
        successMessage: "Specialist updated successfully",
        errorTitle: "Failed to update specialist",
        onSuccess: () => router.push("/specialists"),
      });
    } catch (error) {
      console.error(
        "[Specialist_handleSubmit] Error while updating specialist:",
        error,
      );
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update specialist",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.clinic.specialists.update,
    "specialist",
  );

  useEffect(() => {
    handleFetchSpecialist();
  }, [handleFetchSpecialist, specialistId]);

  if (isLoading && !specialist) {
    return <EntityFormLoader />;
  }

  if (!specialist && !isLoading) {
    return (
      <NoDataFound
        message="Specialist data not found"
        description="Please try again or contact support"
        icon={<CiMedicalCase className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  if (specialist?.workingType === "FREELANCE") {
    return (
      <div className="w-full flex flex-col items-center justify-start gap-5">
        <InfoMessage
          title="View only"
          message="Freelance specialists are managed by platform admin. You can view their profile but cannot edit them from the clinic dashboard."
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
          Update Specialist
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update {specialist?.name}
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      {specialist && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <SpecialistForm
            ref={formRef}
            initialData={specialist}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Specialist"
            isUpdate
            clinicDashboard
          />
        </div>
      )}
    </div>
  );
};

export default UpdateSpecialist;
