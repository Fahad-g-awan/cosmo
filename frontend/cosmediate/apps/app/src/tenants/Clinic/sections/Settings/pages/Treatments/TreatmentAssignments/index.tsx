"use client";

import React, { useCallback, useEffect, useState } from "react";

import { NoDataFound } from "@cosmediate/ui";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";

import ManageTreatmentsLayout from "../../../components/treatments/TreatmentsManagementLayout";
import { AssignmentOfferingAccordion } from "./components/AssignmentOfferingAccordion";
import {
  isValidTreatmentAssignment,
  newTreatmentAssignment,
} from "../../../defaults/treatment.defaults";
import { TreatmentAssignmentType } from "../../../types/treatment.types";
import { useClinicAssignments } from "../../../hooks/treatments";

import { LuBriefcaseMedical } from "react-icons/lu";

const TreatmentAssignments = () => {
  const [minimizedAccordions, setMinimizedAccordions] = useState<string[]>([]);

  const { setPanelHeaderConfig } = usePanelHeader();

  const {
    syncAssignments,
    revertAssignments,
    canSaveClinicTreatment,
    savingClinicTreatmentId,
    setAssignmentsByClinicTreatmentIdMap,
    setActiveCategory,
    allCategories,
    activeCategory,
    assignmentsByClinicTreatmentIdMap,
    displayedOfferings,
    specialistOptions,
    isLoading,
  } = useClinicAssignments();

  const handleAddAssignment = useCallback(
    (clinicTreatmentId: string) => {
      setAssignmentsByClinicTreatmentIdMap((prev) => {
        const rows = prev[clinicTreatmentId] ?? [];
        const last = rows[rows.length - 1];
        if (last && !isValidTreatmentAssignment(last)) return prev;

        return {
          ...prev,
          [clinicTreatmentId]: [...rows, { ...newTreatmentAssignment }],
        };
      });
    },
    [setAssignmentsByClinicTreatmentIdMap],
  );

  const handleAssignmentChange = useCallback(
    (
      clinicTreatmentId: string,
      rowIndex: number,
      field: keyof TreatmentAssignmentType,
      value: string,
    ) => {
      setAssignmentsByClinicTreatmentIdMap((prev) => {
        const rows = prev[clinicTreatmentId] ?? [];
        if (!rows[rowIndex]) return prev;

        return {
          ...prev,
          [clinicTreatmentId]: rows.map((row, idx) =>
            idx === rowIndex ? { ...row, [field]: value } : row,
          ),
        };
      });
    },
    [setAssignmentsByClinicTreatmentIdMap],
  );

  const handleAssignmentRemove = useCallback(
    (clinicTreatmentId: string, rowIndex: number) => {
      setAssignmentsByClinicTreatmentIdMap((prev) => {
        const rows = prev[clinicTreatmentId];
        if (!rows) return prev;

        const nextRows = rows.filter((_, idx) => idx !== rowIndex);
        return {
          ...prev,
          [clinicTreatmentId]:
            nextRows.length > 0 ? nextRows : [{ ...newTreatmentAssignment }],
        };
      });
    },
    [setAssignmentsByClinicTreatmentIdMap],
  );

  const handleToggleMinimize = useCallback((clinicTreatmentId: string) => {
    setMinimizedAccordions((prev) =>
      prev.includes(clinicTreatmentId)
        ? prev.filter((item) => item !== clinicTreatmentId)
        : [...prev, clinicTreatmentId],
    );
  }, []);

  useEffect(() => {
    setPanelHeaderConfig(panelHeaderConfig.clinic.settings.treatments.assign);
  }, [setPanelHeaderConfig]);

  const hasOfferings = displayedOfferings.length > 0;

  return (
    <ManageTreatmentsLayout
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      categories={allCategories}
      sectionTitle="Assign Specialists"
      sectionDecription="Assign specialists to clinic treatments and set their experience."
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
              description="Please select treatments before assigning specialists"
              icon={<LuBriefcaseMedical className="size-6 text-500" />}
              className="p-0"
            />
          </div>
        )}

        {hasOfferings &&
          displayedOfferings.map((offering) => {
            const clinicTreatmentId = offering.id;

            return (
              <AssignmentOfferingAccordion
                key={clinicTreatmentId}
                offering={offering}
                rows={
                  assignmentsByClinicTreatmentIdMap[clinicTreatmentId] ?? []
                }
                specialistOptions={specialistOptions}
                isMinimized={minimizedAccordions.includes(clinicTreatmentId)}
                isSaving={savingClinicTreatmentId === clinicTreatmentId}
                canSave={canSaveClinicTreatment(clinicTreatmentId)}
                onToggleMinimize={handleToggleMinimize}
                onFieldChange={handleAssignmentChange}
                onRemove={handleAssignmentRemove}
                onAdd={handleAddAssignment}
                onSave={syncAssignments}
                onCancel={revertAssignments}
              />
            );
          })}
      </div>
    </ManageTreatmentsLayout>
  );
};

export default TreatmentAssignments;
