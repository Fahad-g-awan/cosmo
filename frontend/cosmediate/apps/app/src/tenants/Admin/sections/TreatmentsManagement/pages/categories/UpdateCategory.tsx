"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { NoDataFound, CategoryLoader, Toaster } from "@cosmediate/ui";
import {
  getManagementTreatmentCategoryApi,
  updateTreatmentCategoryApi,
} from "@cosmediate/api";
import { TreatmentCategory } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import {
  TREATMENT_CATEGORY_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import type { FormApiRef } from "@app/lib/form-api-ref";
import { CategoryForm } from "../../components/form/treatmentCategory/CategoryForm";
import { CategoryFormValues } from "../../types/treatmentCategory.types";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";

import { CiMedicalCase } from "react-icons/ci";

const UpdateTreatmentCategory = () => {
  const [category, setCategory] = useState<TreatmentCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const categoryId = searchParams.id;

  const handleFetchTreatmentCategory = useCallback(async () => {
    if (!categoryId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementTreatmentCategoryApi(
        { id: categoryId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setCategory(response.item);
      } else {
        showApiFailureToast(response, "Failed to load treatment category");
      }
    } catch (error) {
      console.error("Error fetching treatment category:", error);
      Toaster(
        "An error occurred while loading treatment category data",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: CategoryFormValues) => {
    if (!categoryId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await updateTreatmentCategoryApi(
        {
          id: categoryId,
          name: data.names[0] ?? "",
          published: data.published,
        },
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: TREATMENT_CATEGORY_FIELD_MAP,
        successMessage: "Treatment category updated successfully",
        errorTitle: "Failed to update treatment category",
        onSuccess: () => router.push("/treatments/categories"),
      });
    } catch (error) {
      console.error("Error updating treatment category:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update treatment category",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.treatments.categories.record || {
      title: "Update Treatment Category",
      description: "Edit treatment category details",
    },
    "treatment_category",
  );

  useEffect(() => {
    handleFetchTreatmentCategory();
  }, [handleFetchTreatmentCategory, categoryId]);

  if (isLoading && !category) {
    return <CategoryLoader />;
  }

  if (!category && !isLoading) {
    return (
      <NoDataFound
        message="Treatment category data not found"
        description="Please try again or contact support"
        icon={<CiMedicalCase className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Update Treatment Category
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update {category?.name}
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
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
            mode="single"
          />
        </div>
      )}
    </div>
  );
};

export default UpdateTreatmentCategory;
