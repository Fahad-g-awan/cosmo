"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { NoDataFound, Toaster, DetailPageLoader } from "@cosmediate/ui";
import {
  deleteSpecialistApi,
  getManagementSpecialistApi,
} from "@cosmediate/api";
import { Specialist } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";

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

import { CertificatesSection } from "../../components/detailPage/specialist/CertificatesSection";
import { WorkingHoursSection } from "../../components/detailPage/specialist/WorkingHoursSection";
import { TreatmentsSection } from "../../components/detailPage/specialist/TreatmentsSection";
import { SystemInfoSection } from "../../components/detailPage/specialist/SystemInfoSection";
import { ContentSection } from "../../components/detailPage/specialist/ContentSection";
import { HeaderSection } from "../../components/detailPage/specialist/HeaderSection";
import { ImageSection } from "../../components/detailPage/specialist/ImageSection";
import { StatsSection } from "../../components/detailPage/specialist/StatsSection";
import { TagsSection } from "../../components/detailPage/specialist/TagsSection";
import { InfoSection } from "../../components/detailPage/specialist/InfoSection";
import FaqsSection from "../../components/detailPage/specialist/FaqsSection";

import { buildSpecialistDetailBasicInfoData } from "../../config/profileSections.config";

import { CiMedicalCase } from "react-icons/ci";
import { ClinicsSection } from "../../components/detailPage/specialist/ClinicsSection";

const SpecialistProfile = () => {
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();
  const { perms } = usePermissions();
  const router = useRouter();

  const params = useParams<{ id: string }>();
  const specialistId = params.id;

  const handleFetchSpecialist = useCallback(async () => {
    if (!specialistId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementSpecialistApi(
        { id: specialistId, from: "listing" },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setSpecialist(response.item);
      } else {
        showApiFailureToast(response, "Failed to load specialist");
      }
    } catch (error) {
      console.error("Error fetching specialist:", error);
      Toaster("An error occurred while loading specialist data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [specialistId, session?.tokens?.accessToken]);

  const handleDelete = useCallback(() => {
    if (!specialistId) {
      Toaster(
        "Failed to delete specialist",
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
            const resp = await deleteSpecialistApi(
              { id: specialistId },
              session?.tokens?.accessToken as string,
            );

            await handleDetailDeleteResult(resp, {
              successMessage: "Specialist deleted successfully",
              errorTitle: "Failed to delete specialist",
              closeDialog,
              onSuccess: () => router.push("/specialists"),
            });
          } catch (error) {
            console.log(
              "[Specialists_handleDelete] Error deleting specialist:",
              error,
            );
            await handleDetailDeleteResult(
              {
                success: false,
                message: error instanceof Error ? error.message : undefined,
              },
              {
                successMessage: "Specialist deleted successfully",
                errorTitle: "Failed to delete specialist",
                closeDialog,
                onSuccess: () => router.push("/specialists"),
              },
            );
          }
        },
      },
    });
  }, [closeDialog, openDialog, router, session?.tokens?.accessToken, specialistId]);

  useGatedPanelHeader(panelHeaderConfig.admin.specialists.record, "specialist");

  useEffect(() => {
    handleFetchSpecialist();
  }, [handleFetchSpecialist, specialistId]);

  if (isLoading && !specialist) {
    return <DetailPageLoader />;
  }

  if (!specialist && !isLoading) {
    return (
      <NoDataFound
        message="Specialist data not found"
        description="Please try again or contact support"
        icon={<CiMedicalCase className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {specialist && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6 overflow-hidden",
            "bg-white rounded-xl sm:border sm:border-gray-200",
          )}
        >
          <HeaderSection
            specialist={specialist}
            handleDelete={handleDelete}
            perms={perms}
          />

          <div className="w-full flex flex-col items-start justify-start gap-6 sm:p-6">
            <StatsSection specialist={specialist} />

            {specialistId && (
              <>
                <TreatmentsSection specialistId={specialistId} />
                <ClinicsSection specialistId={specialistId} />
              </>
            )}
          </div>

          <div className="w-full flex flex-col items-center justify-start gap-6 sm:p-6">
            <div className="w-full grid grid-cols-3 max-xl:grid-cols-1 gap-6">
              <div className="w-full col-span-1">
                <div className="w-full xl:sticky xl:top-6 space-y-6">
                  <ImageSection
                    logo={specialist?.image || "/avatar.jpg"}
                    alt={specialist.name}
                  />
                  <InfoSection specialist={specialist} />
                  <TagsSection tags={specialist?.tags || []} />
                </div>
              </div>

              <div className="xl:col-span-2 w-full space-y-6">
                <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 gap-6">
                  {buildSpecialistDetailBasicInfoData(specialist).map(
                    (section) => (
                      <ProfileInfoSection key={section.title} {...section} />
                    ),
                  )}
                </div>
                <ContentSection specialist={specialist} />
                <WorkingHoursSection
                  workingHours={specialist?.workingHours || []}
                />
                <CertificatesSection
                  certificates={specialist?.certificates || []}
                />
                <FaqsSection faqs={specialist?.faqs || []} />
                <SystemInfoSection specialist={specialist} />
              </div>
            </div>
          </div>
        </div>
      )}
      <DialogRenderer />
    </div>
  );
};

export default SpecialistProfile;
