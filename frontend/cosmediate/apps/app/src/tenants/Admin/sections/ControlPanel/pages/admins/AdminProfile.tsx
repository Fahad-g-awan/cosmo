"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import type { Admin } from "@cosmediate/type-utils/auth";

import { ProfileLoader, NoDataFound, Toaster } from "@cosmediate/ui";
import { deleteAdminApi, getAdminApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth/index";
import { cn } from "@cosmediate/ui/lib/utils";

import {
  handleDetailDeleteResult,
  showApiFailureToast,
} from "@app/lib/api-errors";

import { buildAdminProfileSectionsData } from "../../config/adminProfileSections.config";
import { HeaderSection } from "../../components/profile/HeaderSection";

import { ProfileInfoSection } from "@app/components/ProfileInfoSection";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";

import { LiaUserAltSlashSolid } from "react-icons/lia";

const AdminProfile = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useParams<{ id: string }>();
  const adminId = searchParams.id;

  const { openDialog, closeDialog } = useDialog();
  const { session, sessionUser } = useAuth();
  const { perms } = usePermissions();
  const router = useRouter();

  const isSelf = Boolean(
    adminId && sessionUser?.profileId && adminId === sessionUser.profileId,
  );

  const handleFetchAdmin = useCallback(async () => {
    if (!adminId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getAdminApi(
        { id: adminId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setAdmin(response.item);
      } else {
        showApiFailureToast(response, "Failed to load admin");
      }
    } catch (error) {
      console.error("Error fetching admin:", error);
      Toaster("An error occurred while loading admin data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [adminId, session?.tokens?.accessToken]);

  const handleDelete = useCallback(() => {
    if (!adminId) {
      Toaster(
        "Failed to delete admin",
        "error",
        "Something went wrong, please try again.",
      );
      return;
    }

    if (sessionUser?.profileId && adminId === sessionUser.profileId) {
      Toaster(
        "Cannot delete your own account",
        "error",
        "Ask another admin to remove this account if needed.",
      );
      return;
    }

    openDialog({
      dialogType: "delete",
      payload: {
        onConfirm: async () => {
          try {
            const resp = await deleteAdminApi(
              { id: adminId },
              session?.tokens?.accessToken as string,
            );

            await handleDetailDeleteResult(resp, {
              successMessage: "Admin record deleted successfully",
              errorTitle: "Failed to delete admin",
              closeDialog,
              onSuccess: () => router.push("/control-panel/admins"),
            });
          } catch (error) {
            console.log(
              "[ControlPanel_Admins_handleDelete] Error while admin delete: ",
              error,
            );
            await handleDetailDeleteResult(
              {
                success: false,
                message:
                  error instanceof Error ? error.message : undefined,
              },
              {
                successMessage: "Admin record deleted successfully",
                errorTitle: "Failed to delete admin",
                closeDialog,
                onSuccess: () => router.push("/control-panel/admins"),
              },
            );
          }
        },
      },
    });
  }, [
    adminId,
    openDialog,
    closeDialog,
    router,
    session?.tokens?.accessToken,
    sessionUser?.profileId,
  ]);

  useGatedPanelHeader(
    panelHeaderConfig.admin.controlPanel.admins.record,
    "admin",
  );

  useEffect(() => {
    handleFetchAdmin();
  }, [handleFetchAdmin, adminId]);

  if (isLoading && !admin) {
    return <ProfileLoader />;
  }

  if (!admin && !isLoading) {
    return (
      <NoDataFound
        message="Admin profile data not found"
        description="Please try again or contact support"
        icon={
          <LiaUserAltSlashSolid className="size-7 text-300" strokeWidth={1.5} />
        }
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {admin && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6",
            "bg-white rounded-xl sm:border sm:border-gray-200",
          )}
        >
          <HeaderSection
            admin={admin}
            handleDelete={isSelf ? undefined : handleDelete}
            perms={perms}
          />

          <div className="w-full flex flex-col items-center justify-start gap-6 sm:p-6">
            <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 gap-6">
              {buildAdminProfileSectionsData(admin).map((section) => (
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

export default AdminProfile;
