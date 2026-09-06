"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { NoDataFound, CategoryLoader, Toaster } from "@cosmediate/ui";
import { getManagementBrandApi, updateBrandApi } from "@cosmediate/api";
import { TreatmentBrand } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import {
  TREATMENT_BRAND_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import type { FormApiRef } from "@app/lib/form-api-ref";
import { BrandForm } from "../../components/form/treatmentBrand/BrandForm";
import { BrandFormValues } from "../../types/brand.types";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";

import { CiMedicalCase } from "react-icons/ci";

const UpdateBrand = () => {
  const [brand, setBrand] = useState<TreatmentBrand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const brandId = searchParams.id;

  const handleFetchBrand = useCallback(async () => {
    if (!brandId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementBrandApi(
        { id: brandId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setBrand(response.item);
      } else {
        showApiFailureToast(response, "Failed to load treatment brand");
      }
    } catch (error) {
      console.error("Error fetching treatment brand:", error);
      Toaster("An error occurred while loading treatment brand data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [brandId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: BrandFormValues) => {
    if (!brandId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await updateBrandApi(
        {
          id: brandId,
          name: data.names[0] ?? "",
          published: data.published,
        },
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: TREATMENT_BRAND_FIELD_MAP,
        successMessage: "Treatment brand updated successfully",
        errorTitle: "Failed to update treatment brand",
        onSuccess: () => router.push("/treatments/brands"),
      });
    } catch (error) {
      console.error("Error updating treatment brand:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update treatment brand",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.treatments.brands.record || {
      title: "Update Treatment Brand",
      description: "Edit treatment brand details",
    },
    "treatment_brand",
  );

  useEffect(() => {
    handleFetchBrand();
  }, [handleFetchBrand, brandId]);

  if (isLoading && !brand) {
    return <CategoryLoader />;
  }

  if (!brand && !isLoading) {
    return (
      <NoDataFound
        message="Treatment brand data not found"
        description="Please try again or contact support"
        icon={<CiMedicalCase className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Update Treatment Brand
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update {brand?.name}
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      {brand && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <BrandForm
            ref={formRef}
            initialData={brand}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Brand"
            mode="single"
          />
        </div>
      )}
    </div>
  );
};

export default UpdateBrand;
