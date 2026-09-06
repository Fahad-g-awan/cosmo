"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { NoDataFound, Toaster, EntityFormLoader } from "@cosmediate/ui";
import { getManagementClinicApi, updateClinicApi } from "@cosmediate/api";
import { Clinic } from "@cosmediate/type-utils/";
import { useAuth } from "@cosmediate/auth";

import {
  CLINIC_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import type { FormApiRef } from "@app/lib/form-api-ref";

import {
  buildClinicFormData,
  withClinicImagePlaceholders,
} from "../../lib/buildClinicFormData";
import { ClinicForm } from "../../components/form/clinic/ClinicForm";
import { ClinicFormValues } from "../../types/clinic.types";

import { CiMedicalCase } from "react-icons/ci";

const UpdateClinic = () => {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const clinicId = searchParams.id;

  const handleFetchClinic = useCallback(async () => {
    if (!clinicId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementClinicApi(
        { id: clinicId, from: "listing" },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setClinic(response.item);
      } else {
        showApiFailureToast(response, "Failed to load clinic");
      }
    } catch (error) {
      console.error("Error fetching clinic:", error);
      Toaster("An error occurred while loading clinic data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [clinicId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: Partial<ClinicFormValues>) => {
    if (!clinicId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const payload = await withClinicImagePlaceholders(data);
      const response = await updateClinicApi(
        buildClinicFormData(payload, { id: clinicId }),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: CLINIC_FORM_FIELD_MAP,
        successMessage: "Clinic updated successfully",
        errorTitle: "Failed to update clinic",
        onSuccess: () => router.push("/clinic-management"),
      });
    } catch (error) {
      console.error(
        "[Clinic_handleSubmit] Error while updating clinic:",
        error,
      );
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update clinic",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.clinicManagement.update,
    "clinic",
  );

  useEffect(() => {
    handleFetchClinic();
  }, [handleFetchClinic, clinicId]);

  if (isLoading && !clinic) {
    return <EntityFormLoader />;
  }

  if (!clinic && !isLoading) {
    return (
      <NoDataFound
        message="Clinic data not found"
        description="Please try again or contact support"
        icon={<CiMedicalCase className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Update Clinic
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update {clinic?.name}
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      {clinic && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <ClinicForm
            ref={formRef}
            initialData={clinic}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Clinic"
            mode="update"
          />
        </div>
      )}
    </div>
  );
};

export default UpdateClinic;
