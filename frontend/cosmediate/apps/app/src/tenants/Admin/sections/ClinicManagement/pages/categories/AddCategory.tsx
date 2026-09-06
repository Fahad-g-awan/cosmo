"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClinicCategoryApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  BULK_NAMES_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { CategoryFormValues } from "../../types/clinicCategory.types";
import { CategoryForm } from "../../components/form/clinicCategory/CategoryForm";

const AddClinicCategory = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  useGatedPanelHeader(
    panelHeaderConfig.admin.clinicManagement.categories.add,
    "clinic_category",
  );
  const { session } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: CategoryFormValues) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await createClinicCategoryApi(
        {
          categories: data.names,
          published: data.published,
        },
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: BULK_NAMES_FIELD_MAP,
        successMessage: "Clinic categories created successfully",
        errorTitle: "Failed to create clinic categories",
        onSuccess: () => router.push("/clinic-management/categories"),
      });
    } catch (error) {
      console.error("Error creating clinic categories:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create clinic categories",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Clinic Categories
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create new clinic categories
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <CategoryForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Categories"
          mode="multiple"
        />
      </div>
    </div>
  );
};

export default AddClinicCategory;
