"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { NoDataFound, ProfileLoader, Toaster } from "@cosmediate/ui";
import { getClinicManagerApi, updateClinicManagerApi } from "@cosmediate/api";
import { ClinicManager } from "@cosmediate/type-utils/auth";
import { useAuth } from "@cosmediate/auth";

import {
  handleCrudMutationResult,
  MANAGER_FORM_FIELD_MAP,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { ManagerForm } from "../../components/form/manager/ManagerForm";
import { buildManagerFormData } from "../../lib/buildManagerFormData";
import { ManagerFormValues } from "../../types/manager.types";
import { withManagerImagePlaceholder } from "@app/lib/form-field-limits";

import { LiaUserAltSlashSolid } from "react-icons/lia";

const UpdateManager = () => {
  const [manager, setManager] = useState<ClinicManager | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const managerId = searchParams.id;

  const handleFetchManager = useCallback(async () => {
    if (!managerId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getClinicManagerApi(
        { id: managerId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setManager(response.item);
      } else {
        showApiFailureToast(response, "Failed to load manager");
      }
    } catch (error) {
      console.error("Error fetching manager record:", error);
      Toaster("An error occurred while loading manager record data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [managerId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: Partial<ManagerFormValues>) => {
    if (!managerId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const payload = await withManagerImagePlaceholder(data);
      const response = await updateClinicManagerApi(
        buildManagerFormData(payload, { id: managerId }),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: MANAGER_FORM_FIELD_MAP,
        successMessage: "Manager updated successfully",
        errorTitle: "Failed to update manager",
        onSuccess: () => router.push("/clinic-management/managers"),
      });
    } catch (error) {
      console.error("Error updating manager record:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update manager",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.clinicManagement.managers.update,
    "clinic_manager",
  );

  useEffect(() => {
    handleFetchManager();
  }, [handleFetchManager, managerId]);

  if (isLoading && !manager) {
    return <ProfileLoader />;
  }

  if (!manager && !isLoading) {
    return (
      <NoDataFound
        message="Manager profile data not found"
        description="Please try again or contact support"
        icon={
          <LiaUserAltSlashSolid className="size-7 text-300" strokeWidth={1.5} />
        }
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Update Manager
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update {manager?.fullName}
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      {manager && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <ManagerForm
            ref={formRef}
            initialData={manager}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Manager"
            isUpdate={true}
          />
        </div>
      )}
    </div>
  );
};

export default UpdateManager;
