"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { NoDataFound, Toaster, DetailPageLoader } from "@cosmediate/ui";
import { deleteClinicApi, getManagementClinicApi } from "@cosmediate/api";
import { Clinic } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";

import { ProfileInfoSection } from "@app/components/ProfileInfoSection";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";
import {
  handleDetailDeleteResult,
  showApiFailureToast,
} from "@app/lib/api-errors";

import { CertificatesSection } from "../../components/detailPage/clinic/CertificatesSection";
import { WorkingHoursSection } from "../../components/detailPage/clinic/WorkingHoursSection";
import { SpecialistsSection } from "../../components/detailPage/clinic/SpecialistsSection";
import { TreatmentsSection } from "../../components/detailPage/clinic/TreatmentsSection";
import { SystemInfoSection } from "../../components/detailPage/clinic/SystemInfoSection";
import { ManagersSection } from "../../components/detailPage/clinic/ManagersSection";
import { ContentSection } from "../../components/detailPage/clinic/ContentSection";
import { HeaderSection } from "../../components/detailPage/clinic/HeaderSection";
import { ImageSection } from "../../components/detailPage/clinic/ImageSection";
import { StatsSection } from "../../components/detailPage/clinic/StatsSection";
import { TagsSection } from "../../components/detailPage/clinic/TagsSection";
import { InfoSection } from "../../components/detailPage/clinic/InfoSection";
import FaqsSection from "../../components/detailPage/clinic/FaqsSection";

import { buildClinicDetailBasicInfoData } from "../../config/profileSections.config";

import { CiMedicalCase } from "react-icons/ci";
import { ClinicsSection } from "../../components/detailPage/clinic/ClinicsSection";

const ClinicProfile = () => {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();
  const { perms } = usePermissions();
  const router = useRouter();

  const params = useParams<{ id: string }>();
  const clinicId = params.id;

  const handleFetchClinic = useCallback(async () => {
    if (!clinicId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementClinicApi(
        { id: clinicId, from: "listing" },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setClinic(response.item);
      } else {
        showApiFailureToast(response, "Failed to load clinic");
      }
    } catch (error) {
      console.error("Error fetching clinic:", error);
      Toaster("An error occurred while loading clinic data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [clinicId, session?.tokens?.accessToken]);

  const handleDelete = useCallback(() => {
    if (!clinicId) {
      console.log("[Clinics_handleDelete] Error clinic id not provided");
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
            const resp = await deleteClinicApi(
              { id: clinicId },
              session?.tokens?.accessToken as string,
            );

            await handleDetailDeleteResult(resp, {
              successMessage: "Clinic deleted successfully",
              errorTitle: "Failed to delete clinic",
              closeDialog,
              onSuccess: () => router.push("/clinic-management"),
            });
          } catch (error) {
            await handleDetailDeleteResult(
              {
                success: false,
                message: error instanceof Error ? error.message : undefined,
              },
              {
                successMessage: "Clinic deleted successfully",
                errorTitle: "Failed to delete clinic",
                closeDialog,
                onSuccess: () => router.push("/clinic-management"),
              },
            );
          }
        },
      },
    });
  }, [closeDialog, openDialog, session?.tokens?.accessToken, router, clinicId]);

  useGatedPanelHeader(
    panelHeaderConfig.admin.clinicManagement.record,
    "clinic",
  );

  useEffect(() => {
    handleFetchClinic();
  }, [handleFetchClinic]);

  if (isLoading && !clinic) {
    return <DetailPageLoader />;
  }

  if (!clinic && !isLoading) {
    return (
      <NoDataFound
        message="Clinic data not found"
        description="Please try again or contact support"
        icon={<CiMedicalCase className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {clinic && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6 overflow-hidden",
            "bg-white rounded-xl sm:border sm:border-gray-200",
          )}
        >
          <HeaderSection
            clinic={clinic}
            handleDelete={handleDelete}
            perms={perms}
          />

          <div className="w-full flex flex-col items-start justify-start gap-6 sm:p-6">
            <StatsSection clinic={clinic} />

            {clinicId && (
              <>
                <TreatmentsSection clinicId={clinicId} />
                <ManagersSection clinicId={clinicId} />
                {clinic.clinicType === "NODE" && (
                  <ClinicsSection clinicId={clinicId} />
                )}
                <SpecialistsSection clinicId={clinicId} />
              </>
            )}
          </div>

          <div className="w-full flex flex-col items-center justify-start gap-6 sm:p-6">
            <div className="w-full grid grid-cols-3 max-xl:grid-cols-1 gap-6">
              <div className="w-full col-span-1">
                <div className="w-full xl:sticky xl:top-6 space-y-6">
                  <ImageSection
                    logo={clinic?.logo || "/placeholder.jpg"}
                    images={clinic?.images || []}
                    alt={clinic.name}
                  />
                  <InfoSection clinic={clinic} />
                  <TagsSection tags={clinic?.tags || []} />
                </div>
              </div>

              <div className="xl:col-span-2 w-full space-y-6">
                <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 gap-6">
                  {buildClinicDetailBasicInfoData(clinic).map((section) => (
                    <ProfileInfoSection key={section.title} {...section} />
                  ))}
                </div>
                <ContentSection clinic={clinic} />
                <WorkingHoursSection
                  workingHours={clinic?.workingHours || []}
                />
                <CertificatesSection
                  certificates={clinic?.certificates || []}
                />
                <FaqsSection faqs={clinic?.faqs || []} />
                <SystemInfoSection clinic={clinic} />
              </div>
            </div>
          </div>
        </div>
      )}
      <DialogRenderer />
    </div>
  );
};

export default ClinicProfile;
