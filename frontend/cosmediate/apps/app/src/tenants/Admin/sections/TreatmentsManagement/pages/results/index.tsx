"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { deleteTreatmentResultApi } from "@cosmediate/api";
import { NoDataFound, TreatmentSelectionLoader, Toaster } from "@cosmediate/ui";
import { useAuth } from "@cosmediate/auth";

import {
  handleListDeleteResult,
} from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";
import TreatmentsManagementLayout from "@app/tenants/Clinic/sections/Settings/components/treatments/TreatmentsManagementLayout";

import { useAdminTreatmentResults } from "../../hooks/useAdminTreatmentResults";
import { AdminResultsTreatmentAccordion } from "./components/AdminResultsTreatmentAccordion";

import { LuBriefcaseMedical } from "react-icons/lu";

const RESULTS_BASE_PATH = "/treatments/results";

const TreatmentResults = () => {
  const [minimizedAccordions, setMinimizedAccordions] = useState<string[]>([]);

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const { perms } = usePermissions();
  const router = useRouter();

  const {
    reloadResults,
    setActiveCategory,
    resultsByTreatmentIdMap,
    displayedTreatments,
    allCategories,
    activeCategory,
    isCatalogLoading,
    isContentLoading,
  } = useAdminTreatmentResults();

  useGatedPanelHeader(
    panelHeaderConfig.admin.treatments.results.main,
    "treatment_result",
  );

  const handleDelete = useCallback(
    (resultId: string) => {
      if (!resultId || !accessToken) {
        Toaster("Something went wrong", "error");
        return;
      }

      openDialog({
        dialogType: "delete",
        payload: {
          onConfirm: async () => {
            try {
              const resp = await deleteTreatmentResultApi(
                { id: resultId },
                accessToken,
              );

              await handleListDeleteResult(resp, {
                successMessage: "Treatment result deleted successfully",
                errorTitle: "Failed to delete treatment result",
                refetch: reloadResults,
                closeDialog,
              });
            } catch (error) {
              console.error("[AdminTreatmentResults_handleDelete]", error);
              await handleListDeleteResult(
                {
                  success: false,
                  message:
                    error instanceof Error ? error.message : undefined,
                },
                {
                  successMessage: "Treatment result deleted successfully",
                  errorTitle: "Failed to delete treatment result",
                  refetch: reloadResults,
                  closeDialog,
                },
              );
            }
          },
        },
      });
    },
    [accessToken, closeDialog, openDialog, reloadResults],
  );

  const handleEdit = useCallback(
    (resultId: string) => {
      router.push(`${RESULTS_BASE_PATH}/update/${resultId}`);
    },
    [router],
  );

  const handleToggleMinimize = useCallback((treatmentId: string) => {
    setMinimizedAccordions((prev) =>
      prev.includes(treatmentId)
        ? prev.filter((item) => item !== treatmentId)
        : [...prev, treatmentId],
    );
  }, []);

  const hasTreatments = displayedTreatments.length > 0;
  const hasCategories = allCategories.length > 0;

  return (
    <>
      <TreatmentsManagementLayout
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={allCategories}
        sectionTitle="Treatment Results"
        sectionDecription="Manage catalog before/after results grouped by treatment."
        isLoading={isCatalogLoading && !hasCategories}
        showNoDataFound={!isCatalogLoading && !hasCategories}
      >
        <div className="w-full flex flex-col items-center justify-start gap-2">
          {isContentLoading && <TreatmentSelectionLoader />}

          {!isContentLoading && !hasTreatments && (
            <div className="w-full p-5 flex flex-col items-center justify-center gap-5 border border-stroke rounded-xl bg-ghost-blue/90">
              <NoDataFound
                message="No Treatments Found"
                description="Add treatments to the catalog before creating results"
                icon={<LuBriefcaseMedical className="size-6 text-500" />}
                className="p-0"
              />
            </div>
          )}

          {!isContentLoading &&
            hasTreatments &&
            displayedTreatments.map((treatment) => (
              <AdminResultsTreatmentAccordion
                key={treatment.id}
                treatment={treatment}
                results={resultsByTreatmentIdMap[treatment.id] ?? []}
                isMinimized={minimizedAccordions.includes(treatment.id)}
                perms={perms}
                onToggleMinimize={handleToggleMinimize}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
        </div>
      </TreatmentsManagementLayout>

      <DialogRenderer />
    </>
  );
};

export default TreatmentResults;
