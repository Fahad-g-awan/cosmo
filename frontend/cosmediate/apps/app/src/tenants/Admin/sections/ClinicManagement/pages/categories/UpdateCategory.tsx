"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getManagementClinicCategoryApi,
  updateClinicCategoryApi,
} from "@cosmediate/api";
import { NoDataFound, CategoryLoader, Toaster } from "@cosmediate/ui";
import { ClinicCategory } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import {
  CLINIC_CATEGORY_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { CategoryForm } from "../../components/form/clinicCategory/CategoryForm";
import { CategoryFormValues } from "../../types/clinicCategory.types";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { CiMedicalCase } from "react-icons/ci";

const UpdateClinicCategory = () => {
  const [category, setCategory] = useState<ClinicCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const categoryId = searchParams.id;

  const handleFetchClinicCategory = useCallback(async () => {
    if (!categoryId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementClinicCategoryApi(
        { id: categoryId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setCategory(response.item);
      } else {
        showApiFailureToast(response, "Failed to load clinic category");
      }
    } catch (error) {
      console.error("Error fetching clinic category:", error);
      Toaster("An error occurred while loading clinic category data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: CategoryFormValues) => {
    if (!categoryId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await updateClinicCategoryApi(
        {
          id: categoryId,
          name: data?.names?.[0]?.trim() ?? "",
          published: data.published,
        },
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: CLINIC_CATEGORY_FIELD_MAP,
        successMessage: "Clinic category updated successfully",
        errorTitle: "Failed to update clinic category",
        onSuccess: () => router.push("/clinic-management/categories"),
      });
    } catch (error) {
      console.error("Error updating clinic category:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update clinic category",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.clinicManagement.categories.update || {
      title: "Update Clinic Category",
      description: "Edit clinic category details",
    },
    "clinic_category",
  );

  useEffect(() => {
    handleFetchClinicCategory();
  }, [handleFetchClinicCategory, categoryId]);

  if (isLoading && !category) {
    return <CategoryLoader />;
  }

  if (!category && !isLoading) {
    return (
      <NoDataFound
        message="Clinic category data not found"
        description="Please try again or contact support"
        icon={<CiMedicalCase className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Update Clinic Category
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update {category?.name}
        </p>
      </div>

      {category && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <CategoryForm
            ref={formRef}
            initialData={category}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Category"
          />
        </div>
      )}
    </div>
  );
};

export default UpdateClinicCategory;
