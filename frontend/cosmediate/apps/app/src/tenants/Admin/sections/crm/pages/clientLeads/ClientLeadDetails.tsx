"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import {
  deleteLeadApi,
  getLeadApi,
  updateLeadStatusApi,
} from "@cosmediate/api/index";
import { Lead, LeadStatus } from "@cosmediate/type-utils";
import { NoDataFound, LeadDetailsLoader, Toaster } from "@cosmediate/ui/index";
import { useAuth } from "@cosmediate/auth/index";
import { cn } from "@cosmediate/ui/lib/utils";

import { ProfileInfoSection } from "@app/components/ProfileInfoSection";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";

import { buildLeadsInfoSectionsData } from "../../config/leadDetailSections.config";
import { HeaderSection } from "../../components/leads/detailPage/HeaderSection";

import { MdOutlineLeaderboard } from "react-icons/md";

const ClientLeadDetails = () => {
  const searchParams = useParams<{ id: string }>();
  const leadId = searchParams.id;

  const { openDialog, closeDialog, updateDialogPayload } = useDialog();
  const { session } = useAuth();
  const { perms } = usePermissions();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchLead = useCallback(async () => {
    if (!leadId || !session?.tokens?.accessToken) {
      if (!leadId) Toaster("Lead ID is required", "error");
      return;
    }

    try {
      setIsLoading(true);
      const response = await getLeadApi(
        {
          id: leadId,
        },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setLead(response.item);
      } else {
        Toaster("Failed to load lead data", "error");
      }
    } catch (error) {
      console.error("Error fetching lead:", error);
      Toaster("An error occurred while loading lead data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [leadId, session?.tokens?.accessToken]);

  useGatedPanelHeader(panelHeaderConfig.admin.leads?.main, "lead");

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || !session?.tokens?.accessToken) return;

    try {
      setIsUpdating(true);
      const response = await updateLeadStatusApi(
        {
          id: lead.id,
          status: newStatus,
        },
        session.tokens.accessToken,
      );

      if (response.success) {
        setLead((prev) => (prev ? { ...prev, status: newStatus } : null));
        Toaster("Status updated successfully", "success");
      } else {
        Toaster("Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Toaster("An error occurred while updating status", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = useCallback(() => {
    if (!leadId) {
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
            updateDialogPayload({ payload: { isLoading: true } });

            const resp = await deleteLeadApi(
              { id: leadId },
              session?.tokens?.accessToken as string,
            );

            if (resp.success) {
              Toaster("Lead deleted successfully", "success");
              closeDialog();
              router.push("/crm/leads");
            } else {
              Toaster(
                "Something went wrong",
                "error",
                "Please try again or contact support",
              );
            }
          } catch (error) {
            console.log("[ClientLeadDetails_handleDelete] Error:", error);
            Toaster(
              "Something went wrong",
              "error",
              "Please try again or contact support",
            );
          } finally {
            updateDialogPayload({ payload: { isLoading: false } });
          }
        },
      },
    });
  }, [
    leadId,
    openDialog,
    closeDialog,
    router,
    session?.tokens?.accessToken,
    updateDialogPayload,
  ]);

  if (isLoading && !lead) {
    return <LeadDetailsLoader />;
  }

  if (!lead && !isLoading) {
    return (
      <NoDataFound
        message="Lead data not found"
        description="Please try again or contact support"
        icon={<MdOutlineLeaderboard className="size-7 text-300" />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {lead && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6 overflow-hidden",
            "bg-white rounded-xl border border-gray-200",
          )}
        >
          <HeaderSection
            lead={lead}
            isUpdating={isUpdating}
            handleStatusChange={handleStatusChange}
            handleDelete={handleDelete}
            perms={perms}
          />

          <div className="w-full flex flex-col items-center justify-start p-6">
            <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 gap-6">
              {buildLeadsInfoSectionsData(lead).map((section) => (
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

export default ClientLeadDetails;
