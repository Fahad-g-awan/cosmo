"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClinicManagerApi } from "@cosmediate/api";
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

const AddManager = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: Partial<ManagerFormValues>) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const payload = await withManagerImagePlaceholder(data);
      const response = await createClinicManagerApi(
        buildManagerFormData(payload),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: MANAGER_FORM_FIELD_MAP,
        successMessage: "Manager created successfully",
        errorTitle: "Failed to create manager",
        onSuccess: () => router.push("/clinic-management/managers"),
      });
    } catch (error) {
      console.error("Error creating manager:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create manager",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.clinicManagement.managers.add,
    "clinic_manager",
  );

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Manager
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create a new manager
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <ManagerForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Manager"
        />
      </div>
    </div>
  );
};

export default AddManager;
