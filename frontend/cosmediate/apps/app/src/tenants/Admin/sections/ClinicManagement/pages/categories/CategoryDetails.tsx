"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  deleteClinicCategoryApi,
  getManagementClinicCategoryApi,
} from "@cosmediate/api";
import { ClinicCategory } from "@cosmediate/type-utils";
import { Toaster, CategoryLoader, NoDataFound } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";

import {
  handleDetailDeleteResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";

import { CategoryDetailSection } from "../../components/detailPage/clinicCategory/CategoryDetailSection";
import { SystemInfoSection } from "../../components/detailPage/clinicCategory/SystemInfoSection";
import { HeaderSection } from "../../components/detailPage/clinicCategory/HeaderSection";

import { CiMedicalCase } from "react-icons/ci";

const CategoryDetails = () => {
  const [category, setCategory] = useState<ClinicCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { openDialog, closeDialog } = useDialog();
  const { perms } = usePermissions();
  const { session } = useAuth();
  const router = useRouter();

  const params = useParams<{ id: string }>();
  const categoryId = params.id;

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

  const handleDelete = useCallback(() => {
    if (!categoryId) {
      console.log(
        "[Clinic_Categories_HandleDelete] Error clinic category id not provided",
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
            const resp = await deleteClinicCategoryApi(
              { id: categoryId },
              session?.tokens?.accessToken as string,
            );

            await handleDetailDeleteResult(resp, {
              successMessage: "Clinic category deleted successfully",
              errorTitle: "Failed to delete clinic category",
              notFoundTitle: "Clinic category no longer exists",
              closeDialog,
              onSuccess: () => router.push("/clinic-management/categories"),
            });
          } catch (error) {
            console.log(
              "[Clinic_Categories_HandleDelete] Error deleting clinic category:",
              error,
            );
            await handleDetailDeleteResult(
              {
                success: false,
                message: error instanceof Error ? error.message : undefined,
              },
              {
                successMessage: "Clinic category deleted successfully",
                errorTitle: "Failed to delete clinic category",
                notFoundTitle: "Clinic category no longer exists",
                closeDialog,
                onSuccess: () => router.push("/clinic-management/categories"),
              },
            );
          }
        },
      },
    });
  }, [
    closeDialog,
    openDialog,
    session?.tokens?.accessToken,
    router,
    categoryId,
  ]);

  useGatedPanelHeader(
    panelHeaderConfig.admin.clinicManagement.categories.record,
    "clinic_category",
  );

  useEffect(() => {
    handleFetchClinicCategory();
  }, [handleFetchClinicCategory]);

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
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {category && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6 overflow-hidden",
            "bg-white rounded-xl sm:border sm:border-gray-200",
          )}
        >
          <HeaderSection
            category={category}
            handleDelete={handleDelete}
            perms={perms}
          />

          <div className="w-full flex flex-col items-center justify-start gap-10 sm:p-6">
            <CategoryDetailSection category={category} />
            <SystemInfoSection category={category} />
          </div>
        </div>
      )}
      <DialogRenderer />
    </div>
  );
};

export default CategoryDetails;
