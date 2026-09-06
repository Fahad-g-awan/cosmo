"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import type { Patient } from "@cosmediate/type-utils/auth";

import { ProfileLoader, NoDataFound, Toaster } from "@cosmediate/ui";
import { deletePatientApi, getPatientApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth/index";
import { cn } from "@cosmediate/ui/lib/utils";

import {
  handleDetailDeleteResult,
  showApiFailureToast,
} from "@app/lib/api-errors";

import { buildPatientProfileSectionsData } from "../../config/patient-profile-sections.config";
import { HeaderSection } from "../../components/profile/HeaderSection";
import { usePermissions } from "@app/hooks/usePermissions";

import { ProfileInfoSection } from "@app/components/ProfileInfoSection";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";

import { LiaUserAltSlashSolid } from "react-icons/lia";

const PatientProfile = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { perms } = usePermissions();

  const searchParams = useParams<{ id: string }>();
  const patientId = searchParams.id;

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();
  const router = useRouter();

  const fetchPatient = useCallback(async () => {
    if (!patientId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getPatientApi(
        { id: patientId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setPatient(response.item);
      } else {
        showApiFailureToast(response, "Failed to load patient");
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      Toaster("An error occurred while loading patient data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [patientId, session?.tokens?.accessToken]);

  const handleDelete = useCallback(() => {
    if (!patientId) {
      Toaster(
        "Failed to delete patient",
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
            const resp = await deletePatientApi(
              { id: patientId },
              session?.tokens?.accessToken as string,
            );

            await handleDetailDeleteResult(resp, {
              successMessage: "Patient deleted successfully",
              errorTitle: "Failed to delete patient",
              closeDialog,
              onSuccess: () => router.push("/patients"),
            });
          } catch (error) {
            console.log("[handleDelete] Error while patient delete: ", error);
            await handleDetailDeleteResult(
              {
                success: false,
                message:
                  error instanceof Error ? error.message : undefined,
              },
              {
                successMessage: "Patient deleted successfully",
                errorTitle: "Failed to delete patient",
                closeDialog,
                onSuccess: () => router.push("/patients"),
              },
            );
          }
        },
      },
    });
  }, [
    patientId,
    openDialog,
    closeDialog,
    router,
    session?.tokens?.accessToken,
  ]);

  useGatedPanelHeader(panelHeaderConfig.admin.patients?.record, "patient");

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient, patientId]);

  if (isLoading && !patient) {
    return <ProfileLoader />;
  }

  if (!patient && !isLoading) {
    return (
      <NoDataFound
        message="Patient profile data not found"
        description="Please try again or contact support"
        icon={
          <LiaUserAltSlashSolid className="size-7 text-300" strokeWidth={1.5} />
        }
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {patient && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6 overflow-hidden",
            "bg-white rounded-xl sm:border sm:border-gray-200",
          )}
        >
          <HeaderSection
            patient={patient}
            handleDelete={handleDelete}
            perms={perms}
          />

          <div className="w-full flex flex-col items-center justify-start gap-6 sm:p-6">
            <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 gap-6">
              {buildPatientProfileSectionsData(patient).map((section) => (
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

export default PatientProfile;
