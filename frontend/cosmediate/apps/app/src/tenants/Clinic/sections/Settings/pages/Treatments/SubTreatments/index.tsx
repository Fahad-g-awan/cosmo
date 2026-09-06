"use client";

import React, { useCallback, useEffect, useState } from "react";

import { NoDataFound } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";

import ManageTreatmentsLayout from "../../../components/treatments/TreatmentsManagementLayout";
import {
  isValidSubTreatment,
  newSubTreatment,
} from "../../../defaults/treatment.defaults";
import { useClinicSubTreatments } from "../../../hooks/treatments";
import SubTreatmentsHeader, {
  SubTreatmentsColumnHeader,
} from "./components/SubTreatmentsHeader";
import SubTreatmentsFooter from "./components/SubTreatmentsFooter";
import { SubTreatmentType } from "../../../types/treatment.types";
import SubTreatmentRow from "./components/SubTreatmentRow";

import { LuBriefcaseMedical } from "react-icons/lu";

const ManageTreatmentsPrice = () => {
  const [minimizedSubcategories, setMinimizedSubcategories] = useState<
    string[]
  >([]);

  const { setPanelHeaderConfig } = usePanelHeader();

  const {
    syncSubTreatments,
    revertSubTreatments,
    canSaveClinicTreatment,
    savingClinicTreatmentId,

    setSubTreatmentsByClinicTreatmentIdMap,
    setActiveCategory,

    allCategories,
    activeCategory,

    subTreatmentsByClinicTreatmentIdMap,
    displayedOfferings,

    treatmentBrandOptions,

    isLoading,
  } = useClinicSubTreatments();

  const handleAddNewSubTreatment = useCallback(
    (clinicTreatmentId: string) => {
      setSubTreatmentsByClinicTreatmentIdMap((prev) => {
        const subTrts = prev[clinicTreatmentId] ?? [];
        const last = subTrts[subTrts.length - 1];
        if (last && !isValidSubTreatment(last)) return prev;

        return {
          ...prev,
          [clinicTreatmentId]: [...subTrts, { ...newSubTreatment }],
        };
      });
    },
    [setSubTreatmentsByClinicTreatmentIdMap],
  );

  const handleSubTreatmentChange = useCallback(
    (
      clinicTreatmentId: string,
      subTrtIndex: number,
      field: string,
      value: string | string[] | boolean | number,
    ) => {
      setSubTreatmentsByClinicTreatmentIdMap((prev) => {
        const subTrts = prev[clinicTreatmentId] ?? [];

        if (!subTrts[subTrtIndex]) return prev;

        const updatedSubTreatments = subTrts.map((st, idx) =>
          idx === subTrtIndex ? { ...st, [field]: value } : st,
        );

        return {
          ...prev,
          [clinicTreatmentId]: updatedSubTreatments,
        };
      });
    },
    [setSubTreatmentsByClinicTreatmentIdMap],
  );

  const handleSubTreatmentRemove = useCallback(
    (clinicTreatmentId: string, subTrtIndex: number) => {
      setSubTreatmentsByClinicTreatmentIdMap((prev) => {
        const list = prev[clinicTreatmentId];
        if (!list) return prev;

        const nextRows = list.filter((_, idx) => idx !== subTrtIndex);
        return {
          ...prev,
          [clinicTreatmentId]:
            nextRows.length > 0 ? nextRows : [{ ...newSubTreatment }],
        };
      });
    },
    [setSubTreatmentsByClinicTreatmentIdMap],
  );

  const handleMinimize = (clinicTreatmentId: string) => {
    setMinimizedSubcategories((prev: string[]) => {
      if (prev.includes(clinicTreatmentId)) {
        return prev.filter((id: string) => id !== clinicTreatmentId);
      }

      return [...prev, clinicTreatmentId];
    });
  };

  useEffect(() => {
    setPanelHeaderConfig(
      panelHeaderConfig.clinic.settings.treatments.subTreatments,
    );
  }, [setPanelHeaderConfig]);

  const hasOfferings = displayedOfferings.length > 0;

  return (
    <ManageTreatmentsLayout
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      categories={allCategories}
      sectionTitle={"Manage Sub-Treatments"}
      sectionDecription={
        "Define sub-treatments with details like name, price, and specifications."
      }
      isLoading={
        isLoading &&
        displayedOfferings.length === 0 &&
        allCategories.length === 0
      }
      showNoDataFound={
        !isLoading &&
        displayedOfferings.length === 0 &&
        allCategories.length === 0
      }
    >
      <div
        className={cn("w-full flex flex-col items-center justify-start gap-2")}
      >
        {!hasOfferings && (
          <div
            className={cn(
              "w-full p-5 flex flex-col items-center justify-center gap-5 border border-stroke rounded-xl bg-ghost-blue/90",
            )}
          >
            <NoDataFound
              message={"No Selected Treatments Found"}
              description={
                "Please select treatments to add sub-treatments here"
              }
              icon={<LuBriefcaseMedical className="size-6 text-500" />}
              className="p-0"
            />
          </div>
        )}

        {hasOfferings &&
          displayedOfferings.map((offering) => {
            const clinicTreatmentId = offering.id;
            const displayedSubTreatments =
              subTreatmentsByClinicTreatmentIdMap[clinicTreatmentId] ?? [];
            const lastRow =
              displayedSubTreatments[displayedSubTreatments.length - 1];
            const canAddRow = isValidSubTreatment(lastRow);

            return (
              <div
                key={clinicTreatmentId}
                className={cn(
                  "w-full flex flex-col items-center justify-start gap-2.5 p-2 py-4",
                  "bg-ghost-blue rounded-xl",
                )}
              >
                <SubTreatmentsHeader
                  handleMinimize={handleMinimize}
                  treatmentName={offering.treatmentName}
                  clinicTreatmentId={clinicTreatmentId}
                />

                {!minimizedSubcategories.includes(clinicTreatmentId) && (
                  <div className="w-full flex flex-col border border-stroke rounded-xl bg-white overflow-hidden">
                    <div className="h-[200px] w-full overflow-auto">
                      <SubTreatmentsColumnHeader />

                      {displayedSubTreatments.length > 0 &&
                        displayedSubTreatments.map(
                          (subTreatment: SubTreatmentType, subTrtIndex) => (
                            <SubTreatmentRow
                              key={`${subTreatment?.id ?? subTrtIndex + 1}-${subTrtIndex}`}
                              subTreatment={subTreatment}
                              clinicTreatmentId={clinicTreatmentId}
                              subTrtIndex={subTrtIndex}
                              isLast={
                                subTrtIndex ===
                                displayedSubTreatments.length - 1
                              }
                              canAdd={canAddRow}
                              treatmentBrandOptions={
                                treatmentBrandOptions ?? []
                              }
                              onFieldChange={handleSubTreatmentChange}
                              onRemove={handleSubTreatmentRemove}
                              onAdd={handleAddNewSubTreatment}
                            />
                          ),
                        )}
                    </div>
                  </div>
                )}

                <SubTreatmentsFooter
                  handleUpsertSubTreatmentsAPI={() =>
                    syncSubTreatments(clinicTreatmentId)
                  }
                  handleCancel={() => revertSubTreatments(clinicTreatmentId)}
                  isLoading={savingClinicTreatmentId === clinicTreatmentId}
                  canSave={canSaveClinicTreatment(clinicTreatmentId)}
                />
              </div>
            );
          })}
      </div>
    </ManageTreatmentsLayout>
  );
};

export default ManageTreatmentsPrice;
