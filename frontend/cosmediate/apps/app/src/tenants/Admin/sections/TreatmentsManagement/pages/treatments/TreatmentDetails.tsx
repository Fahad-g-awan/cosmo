"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { NoDataFound, Toaster, DetailPageLoader } from "@cosmediate/ui";
import { deleteTreatmentApi, getManagementTreatmentApi } from "@cosmediate/api";
import { Treatment } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";

import {
  handleDetailDeleteResult,
  showApiFailureToast,
} from "@app/lib/api-errors";

import { AuthorInfoSection } from "@app/components/detail/AuthorInfoSection";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";

import { TreatmentInfoSection } from "../../components/detailPage/treatment/TreatmentInfoSection";
import { SystemInfoSection } from "../../components/detailPage/treatment/SystemInfoSection";
import { ContentSection } from "../../components/detailPage/treatment/ContentSection";
import { HeaderSection } from "../../components/detailPage/treatment/HeaderSection";
import { ImageSection } from "../../components/detailPage/treatment/ImageSection";
import { TagsSection } from "../../components/detailPage/treatment/TagsSection";
import FaqsSection from "../../components/detailPage/treatment/FaqsSection";

import { CiMedicalCase } from "react-icons/ci";

const TreatmentDetails = () => {
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();
  const { perms } = usePermissions();
  const router = useRouter();

  const params = useParams<{ id: string }>();
  const treatmentId = params.id;

  const handleFetchTreatment = useCallback(async () => {
    if (!treatmentId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementTreatmentApi(
        { id: treatmentId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setTreatment(response.item);
      } else {
        showApiFailureToast(response, "Failed to load treatment");
      }
    } catch (error) {
      console.error("Error fetching treatment:", error);
      Toaster("An error occurred while loading treatment data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [treatmentId, session?.tokens?.accessToken]);

  const handleDelete = useCallback(() => {
    if (!treatmentId) {
      console.log("[Treatments_handleDelete] Error treatment id not provided");
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
            const resp = await deleteTreatmentApi(
              { id: treatmentId },
              session?.tokens?.accessToken as string,
            );

            await handleDetailDeleteResult(resp, {
              successMessage: "Treatment record deleted successfully",
              errorTitle: "Failed to delete treatment",
              closeDialog,
              onSuccess: () => router.push("/treatments"),
            });
          } catch (error) {
            console.log(
              "[Treatments_handleDelete] Error deleting treatment record:",
              error,
            );
            await handleDetailDeleteResult(
              {
                success: false,
                message:
                  error instanceof Error ? error.message : undefined,
              },
              {
                successMessage: "Treatment record deleted successfully",
                errorTitle: "Failed to delete treatment",
                closeDialog,
                onSuccess: () => router.push("/treatments"),
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
    treatmentId,
  ]);

  useGatedPanelHeader(panelHeaderConfig.admin.treatments.record, "treatment");

  useEffect(() => {
    handleFetchTreatment();
  }, [handleFetchTreatment]);

  if (isLoading && !treatment) {
    return <DetailPageLoader />;
  }

  if (!treatment && !isLoading) {
    return (
      <NoDataFound
        message="Treatment data not found"
        description="Please try again or contact support"
        icon={<CiMedicalCase className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {treatment && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6 overflow-hidden",
            "bg-white rounded-xl sm:border sm:border-gray-200",
          )}
        >
          <HeaderSection
            treatment={treatment}
            handleDelete={handleDelete}
            perms={perms}
          />

          <div className="w-full flex flex-col items-center justify-start gap-6 sm:p-6">
            <div className="w-full grid grid-cols-3 max-xl:grid-cols-1 gap-6">
              <div className="w-full col-span-1">
                <div className="w-full xl:sticky xl:top-6 space-y-6">
                  <ImageSection
                    image={treatment?.image || "/placeholder.jpg"}
                    alt={treatment.name}
                  />
                  <TreatmentInfoSection treatment={treatment} />
                  <TagsSection tags={treatment?.tags || []} />
                </div>
              </div>

              <div className="xl:col-span-2 w-full space-y-6">
                <ContentSection treatment={treatment} />
                <FaqsSection faqs={treatment?.faqs || []} />
                <AuthorInfoSection
                  authorName={treatment.authorName}
                  authorEmail={treatment.authorEmail}
                  authorId={treatment.authorId}
                />
                <SystemInfoSection treatment={treatment} />
              </div>
            </div>
          </div>
        </div>
      )}
      <DialogRenderer />
    </div>
  );
};

export default TreatmentDetails;
