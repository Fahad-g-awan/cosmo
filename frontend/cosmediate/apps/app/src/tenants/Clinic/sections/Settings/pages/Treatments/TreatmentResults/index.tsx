"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { deleteTreatmentResultApi } from "@cosmediate/api";
import { NoDataFound, Toaster } from "@cosmediate/ui";
import { useAuth } from "@cosmediate/auth";

import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";

import ManageTreatmentsLayout from "../../../components/treatments/TreatmentsManagementLayout";
import { useClinicResults } from "../../../hooks/treatments";
import { ResultsOfferingAccordion } from "./components/ResultsOfferingAccordion";

import { LuBriefcaseMedical } from "react-icons/lu";

const RESULTS_BASE_PATH = "/settings/treatments-management/results";

const TreatmentResults = () => {
  const [minimizedAccordions, setMinimizedAccordions] = useState<string[]>([]);

  const router = useRouter();

  const { openDialog, closeDialog, updateDialogPayload } = useDialog();
  const { perms } = usePermissions();
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const {
    reloadResults,
    setActiveCategory,
    resultsByClinicTreatmentIdMap,
    displayedOfferings,
    allCategories,
    activeCategory,
    isLoading,
  } = useClinicResults();

  useGatedPanelHeader(
    panelHeaderConfig.clinic.settings.treatments.results.main,
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
              updateDialogPayload({ payload: { isLoading: true } });

              const resp = await deleteTreatmentResultApi(
                { id: resultId },
                accessToken,
              );

              if (resp.success) {
                Toaster("Treatment result deleted successfully", "success");
                await reloadResults();
                closeDialog();
              } else {
                Toaster("Something went wrong", "error");
              }
            } catch (error) {
              console.error("[TreatmentResults_handleDelete]", error);
              Toaster("Something went wrong", "error");
            } finally {
              updateDialogPayload({ payload: { isLoading: false } });
            }
          },
        },
      });
    },
    [closeDialog, reloadResults, openDialog, accessToken, updateDialogPayload],
  );

  const handleEdit = useCallback(
    (resultId: string) => {
      router.push(`${RESULTS_BASE_PATH}/update/${resultId}`);
    },
    [router],
  );

  const handleToggleMinimize = useCallback((clinicTreatmentId: string) => {
    setMinimizedAccordions((prev) =>
      prev.includes(clinicTreatmentId)
        ? prev.filter((item) => item !== clinicTreatmentId)
        : [...prev, clinicTreatmentId],
    );
  }, []);

  const hasOfferings = displayedOfferings.length > 0;

  return (
    <>
      <ManageTreatmentsLayout
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={allCategories}
        sectionTitle="Before/After Results"
        sectionDecription="Manage before and after images for each clinic treatment offering."
        isLoading={isLoading && !hasOfferings && allCategories.length === 0}
        showNoDataFound={
          !isLoading && !hasOfferings && allCategories.length === 0
        }
      >
        <div className="w-full flex flex-col items-center justify-start gap-2">
          {!hasOfferings && (
            <div className="w-full p-5 flex flex-col items-center justify-center gap-5 border border-stroke rounded-xl bg-ghost-blue/90">
              <NoDataFound
                message="No Selected Treatments Found"
                description="Please select treatments before adding results"
                icon={<LuBriefcaseMedical className="size-6 text-500" />}
                className="p-0"
              />
            </div>
          )}

          {hasOfferings &&
            displayedOfferings.map((offering) => (
              <ResultsOfferingAccordion
                key={offering.id}
                offering={offering}
                results={resultsByClinicTreatmentIdMap[offering.id] ?? []}
                isMinimized={minimizedAccordions.includes(offering.id)}
                perms={perms}
                onToggleMinimize={handleToggleMinimize}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
        </div>
      </ManageTreatmentsLayout>

      <DialogRenderer />
    </>
  );
};

export default TreatmentResults;
