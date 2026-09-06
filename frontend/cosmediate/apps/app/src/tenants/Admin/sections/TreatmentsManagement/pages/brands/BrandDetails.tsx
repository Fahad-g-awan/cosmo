"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { deleteBrandApi, getManagementBrandApi } from "@cosmediate/api";
import { Toaster, CategoryLoader, NoDataFound } from "@cosmediate/ui";
import { TreatmentBrand } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";

import {
  handleDetailDeleteResult,
  showApiFailureToast,
} from "@app/lib/api-errors";

import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";

import { BrandDetailSection } from "../../components/detailPage/treatmentBrand/BrandDetailSection";
import { SystemInfoSection } from "../../components/detailPage/treatmentBrand/SystemInfoSection";
import { HeaderSection } from "../../components/detailPage/treatmentBrand/HeaderSection";

import { CiMedicalCase } from "react-icons/ci";

const BrandDetails = () => {
  const [brand, setBrand] = useState<TreatmentBrand | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();
  const { perms } = usePermissions();
  const router = useRouter();

  const params = useParams<{ id: string }>();
  const brandId = params.id;

  const handleFetchTreatmentBrand = useCallback(async () => {
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

  const handleDelete = useCallback(() => {
    if (!brandId) {
      console.log(
        "[Treatments_Brands_HandleDelete] Error treatment brand id not provided",
      );
      Toaster(
        "Something went wrong",
        "error",
        "Please try again or contact support",
      );
      return;
    }

    openDialog({
      dialogType: "delete",
      payload: {
        onConfirm: async () => {
          try {
            const resp = await deleteBrandApi(
              { id: brandId },
              session?.tokens?.accessToken as string,
            );

            await handleDetailDeleteResult(resp, {
              successMessage: "Treatment brand deleted successfully",
              errorTitle: "Failed to delete treatment brand",
              closeDialog,
              onSuccess: () => router.push("/treatments/brands"),
            });
          } catch (error) {
            console.log(
              "[Treatments_Brands_HandleDelete] Error deleting treatment brand:",
              error,
            );
            await handleDetailDeleteResult(
              {
                success: false,
                message:
                  error instanceof Error ? error.message : undefined,
              },
              {
                successMessage: "Treatment brand deleted successfully",
                errorTitle: "Failed to delete treatment brand",
                closeDialog,
                onSuccess: () => router.push("/treatments/brands"),
              },
            );
          }
        },
      },
    });
  }, [closeDialog, openDialog, session?.tokens?.accessToken, router, brandId]);

  useGatedPanelHeader(
    panelHeaderConfig.admin.treatments.brands.record,
    "treatment_brand",
  );

  useEffect(() => {
    handleFetchTreatmentBrand();
  }, [handleFetchTreatmentBrand]);

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
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {brand && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6 overflow-hidden",
            "bg-white rounded-xl sm:border sm:border-gray-200",
          )}
        >
          <HeaderSection
            brand={brand}
            handleDelete={handleDelete}
            perms={perms}
          />

          <div className="w-full flex flex-col items-center justify-start gap-10 sm:p-6">
            <BrandDetailSection brand={brand} />
            <SystemInfoSection brand={brand} />
          </div>
        </div>
      )}
      <DialogRenderer />
    </div>
  );
};

export default BrandDetails;
