"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClinicManagerApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";
import { InfoMessage } from "@cosmediate/ui";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { useWorkspaceListScope } from "@app/hooks/useWorkspaceListScope";
import {
  handleCrudMutationResult,
  MANAGER_FORM_FIELD_MAP,
  showApiFailureToast,
} from "@app/lib/api-errors";
import type { FormApiRef } from "@app/lib/form-api-ref";
import { withManagerImagePlaceholder } from "@app/lib/form-field-limits";

import { buildManagerFormData } from "../../lib/buildManagerFormData";
import { ManagerForm } from "../../components/form/ManagerForm";
import { ManagerFormValues } from "../../types/manager.types";

const AddManager = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();
  const { isScopeReady, scopeBlockedReason, createScope } =
    useWorkspaceListScope({
      tab: "managers",
    });

  const activeClinicId =
    typeof createScope.clinicId === "string" ? createScope.clinicId : undefined;

  const handleSubmit = async (data: Partial<ManagerFormValues>) => {
    if (!session?.tokens?.accessToken || !activeClinicId) return;

    try {
      setIsSubmitting(true);

      const payload = await withManagerImagePlaceholder(data);
      const response = await createClinicManagerApi(
        buildManagerFormData(payload, { clinicIds: [activeClinicId] }),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: MANAGER_FORM_FIELD_MAP,
        successMessage: "Manager created successfully",
        errorTitle: "Failed to create manager",
        onSuccess: () => router.push("/control-panel/managers"),
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
    panelHeaderConfig.clinic.controlPanel.managers.add || {
      title: "Add Manager",
      description: "Create a new manager account",
    },
    "clinic_manager",
  );

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

  if (!activeClinicId) {
    return (
      <div className="w-full my-5">
        <InfoMessage
          title="Clinic scope required"
          message="Select an active clinic to add a manager"
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
