"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createAdminApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  ADMIN_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import type { FormApiRef } from "@app/lib/form-api-ref";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { withAdminImagePlaceholder } from "@app/lib/form-field-limits";

import { AdminForm } from "../../components/form/AdminForm";
import { buildAdminFormData } from "../../lib/buildAdminFormData";
import { AdminFormValues } from "../../types/admin.types";

const AddAdmin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: Partial<AdminFormValues>) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const payload = await withAdminImagePlaceholder(data);
      const response = await createAdminApi(
        buildAdminFormData(payload),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: ADMIN_FORM_FIELD_MAP,
        successMessage: "Admin created successfully",
        errorTitle: "Failed to create admin",
        onSuccess: () => router.push("/control-panel/admins"),
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create admin",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.controlPanel.admins.add || {
      title: "Add Admin",
      description: "Create a new admin account",
    },
    "admin",
  );

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Admin
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create a new admin
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <AdminForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Admin"
        />
      </div>
    </div>
  );
};

export default AddAdmin;
