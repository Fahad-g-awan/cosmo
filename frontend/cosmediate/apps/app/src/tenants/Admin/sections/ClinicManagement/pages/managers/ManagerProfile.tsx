"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { ProfileLoader, NoDataFound, Toaster } from "@cosmediate/ui";
import { deleteClinicManagerApi, getClinicManagerApi } from "@cosmediate/api";
import type { ClinicManager } from "@cosmediate/type-utils/auth";
import { useAuth } from "@cosmediate/auth/index";
import { cn } from "@cosmediate/ui/lib/utils";

import { buildManagerProfileSectionsData } from "../../config/profileSections.config";
import { HeaderSection } from "../../components/detailPage/manager/HeaderSection";

import { ProfileInfoSection } from "@app/components/ProfileInfoSection";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import {
  handleDetailDeleteResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { usePermissions } from "@app/hooks/usePermissions";

import { LiaUserAltSlashSolid } from "react-icons/lia";

const ManagerProfile = () => {
  const [manager, setManager] = useState<ClinicManager | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useParams<{ id: string }>();
  const managerId = searchParams.id;

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();
  const { perms } = usePermissions();
  const router = useRouter();

  const handleFetchManager = useCallback(async () => {
    if (!managerId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getClinicManagerApi(
        { id: managerId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setManager(response.item);
      } else {
        showApiFailureToast(response, "Failed to load manager");
      }
    } catch (error) {
      console.error("Error fetching manager record:", error);
      Toaster("An error occurred while loading manager record data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [managerId, session?.tokens?.accessToken]);

  const handleDelete = useCallback(() => {
    if (!managerId) {
      Toaster(
        "Failed to delete manager",
        "error",
        "Something went wrong, please try again.",
      );
      return;
    }

    openDialog({
      dialogType: "delete",
      payload: {
        onConfirm: async () => {
          try {
            const resp = await deleteClinicManagerApi(
              { id: managerId },
              session?.tokens?.accessToken as string,
            );

            await handleDetailDeleteResult(resp, {
              successMessage: "Manager deleted successfully",
              errorTitle: "Failed to delete manager",
              closeDialog,
              onSuccess: () => router.push("/clinic-management/managers"),
            });
          } catch (error) {
            console.log(
              "[ClinicManagement_Managers_handleDelete] Error while manager delete:",
              error,
            );
            await handleDetailDeleteResult(
              {
                success: false,
                message: error instanceof Error ? error.message : undefined,
              },
              {
                successMessage: "Manager deleted successfully",
                errorTitle: "Failed to delete manager",
                closeDialog,
                onSuccess: () => router.push("/clinic-management/managers"),
              },
            );
          }
        },
      },
    });
  }, [
    managerId,
    openDialog,
    closeDialog,
    router,
    session?.tokens?.accessToken,
  ]);

  useGatedPanelHeader(
    panelHeaderConfig.admin.clinicManagement.managers.record,
    "clinic_manager",
  );

  useEffect(() => {
    handleFetchManager();
  }, [handleFetchManager, managerId]);

  if (isLoading && !manager) {
    return <ProfileLoader />;
  }

  if (!manager && !isLoading) {
    return (
      <NoDataFound
        message="Manager profile data not found"
        description="Please try again or contact support"
        icon={
          <LiaUserAltSlashSolid className="size-7 text-300" strokeWidth={1.5} />
        }
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {manager && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6",
            "bg-white rounded-xl sm:border sm:border-gray-200",
          )}
        >
          <HeaderSection
            manager={manager}
            handleDelete={handleDelete}
            perms={perms}
          />

          <div className="w-full flex flex-col items-center justify-start gap-6 sm:p-6">
            <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 gap-6">
              {buildManagerProfileSectionsData(manager).map((section) => (
                <ProfileInfoSection key={section.title} {...section} />
              ))}
            </div>
          </div>
        </div>
      )}

      <DialogRenderer />
    </div>
  );
};

export default ManagerProfile;
