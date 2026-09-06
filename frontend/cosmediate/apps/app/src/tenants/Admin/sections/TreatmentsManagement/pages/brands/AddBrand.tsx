"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createBrandsApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  TREATMENT_BRAND_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { BrandForm } from "../../components/form/treatmentBrand/BrandForm";
import { BrandFormValues } from "../../types/brand.types";

const AddTreatmentBrand = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: BrandFormValues) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await createBrandsApi(
        {
          brands: data.names,
          published: data.published,
        },
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: TREATMENT_BRAND_FIELD_MAP,
        successMessage: "Treatment brands created successfully",
        errorTitle: "Failed to create treatment brands",
        onSuccess: () => router.push("/treatments/brands"),
      });
    } catch (error) {
      console.error("Error creating treatment brands:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create treatment brands",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.treatments.brands.add || {
      title: "Add treatment brands",
      description: "Create a new treatment brands",
    },
    "treatment_brand",
  );

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Treatment Brands
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create new treatment brands
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <BrandForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Brands"
          mode="multiple"
        />
      </div>
    </div>
  );
};

export default AddTreatmentBrand;
