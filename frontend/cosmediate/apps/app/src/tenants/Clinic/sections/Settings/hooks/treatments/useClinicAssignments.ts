"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  listManagementClinicSpecialistTreatmentsApi,
  syncClinicAssignmentsApi,
} from "@cosmediate/api";
import { Specialist } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";
import { Toaster } from "@cosmediate/ui";

import {
  canSaveAssignments,
  isIncompleteAssignmentRow,
  isValidTreatmentAssignment,
  newTreatmentAssignment,
} from "../../defaults/treatment.defaults";
import { TreatmentAssignmentType } from "../../types/treatment.types";
import { useClinicOfferings } from "./useClinicOfferings";

const withAssignmentPlaceholder = (rows: TreatmentAssignmentType[]) => {
  const list = [...rows];
  const hasPlaceholder =
    list.length > 0 && !list[list.length - 1]?.specialistId?.trim();

  if (!hasPlaceholder) {
    list.push({ ...newTreatmentAssignment });
  }

  return list;
};

/**
 * Manager-only: specialist assignment sync per clinicTreatmentId.
 */
export function useClinicAssignments() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [
    assignmentsByClinicTreatmentIdMap,
    setAssignmentsByClinicTreatmentIdMap,
  ] = useState<Record<string, TreatmentAssignmentType[]>>({});
  const [baselineByClinicTreatmentIdMap, setBaselineByClinicTreatmentIdMap] =
    useState<Record<string, TreatmentAssignmentType[]>>({});
  const [savingClinicTreatmentId, setSavingClinicTreatmentId] = useState<
    string | null
  >(null);
  const [isAssignmentsLoading, setIsAssignmentsLoading] = useState(false);

  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const {
    allCategories,
    activeCategory,
    setActiveCategory,
    clinicTreatments,
    displayedOfferings,
    activeClinicId,
    fetchClinicSpecialists,
    isLoading: isOfferingsLoading,
  } = useClinicOfferings();

  const specialistOptions = useMemo(
    () =>
      specialists.map((specialist) => ({
        label: specialist.fullName,
        value: specialist.id,
      })),
    [specialists],
  );

  const loadAssignments = useCallback(async () => {
    if (!activeClinicId || !accessToken || !clinicTreatments.length) return;

    try {
      setIsAssignmentsLoading(true);

      const assignmentsRes = await listManagementClinicSpecialistTreatmentsApi(
        { filters: { clinicId: activeClinicId } },
        accessToken,
      );

      const grouped = clinicTreatments.reduce(
        (acc, offering) => {
          acc[offering.id] = [];
          return acc;
        },
        {} as Record<string, TreatmentAssignmentType[]>,
      );

      (assignmentsRes.items ?? []).forEach((item) => {
        const clinicTreatmentId = item.clinicTreatmentId;
        if (!clinicTreatmentId || !grouped[clinicTreatmentId]) return;

        grouped[clinicTreatmentId].push({
          specialistId: item.specialistId,
          specialistExperience: item.specialistExperience,
        });
      });

      Object.keys(grouped).forEach((clinicTreatmentId) => {
        grouped[clinicTreatmentId] = withAssignmentPlaceholder(
          grouped[clinicTreatmentId] ?? [],
        );
      });

      setAssignmentsByClinicTreatmentIdMap(grouped);
      setBaselineByClinicTreatmentIdMap(
        Object.fromEntries(
          Object.entries(grouped).map(([id, rows]) => [
            id,
            rows.map((row) => ({ ...row })),
          ]),
        ),
      );
    } catch (error) {
      console.error("Error loading assignments:", error);
      Toaster(
        "Something went wrong while loading assignments",
        "error",
        "Please try again or contact support",
      );
    } finally {
      setIsAssignmentsLoading(false);
    }
  }, [activeClinicId, accessToken, clinicTreatments]);

  const syncAssignments = useCallback(
    async (clinicTreatmentId: string) => {
      if (!accessToken || !activeClinicId) {
        Toaster("Unauthorized Access", "error");
        return false;
      }

      const rows = assignmentsByClinicTreatmentIdMap[clinicTreatmentId] ?? [];
      const baseline = baselineByClinicTreatmentIdMap[clinicTreatmentId] ?? [];

      if (rows.some(isIncompleteAssignmentRow)) {
        Toaster(
          "Incomplete assignment",
          "error",
          "Each row needs both a specialist and experience, or leave both empty",
        );
        return false;
      }

      if (!canSaveAssignments(rows, baseline)) {
        return false;
      }

      const payload = rows.filter(isValidTreatmentAssignment).map((row) => ({
        specialistId: row.specialistId.trim(),
        specialistExperience: row.specialistExperience.trim(),
      }));

      try {
        setSavingClinicTreatmentId(clinicTreatmentId);

        const response = await syncClinicAssignmentsApi(
          {
            clinicTreatmentId,
            assignments: payload,
          },
          accessToken,
        );

        if (response.success) {
          const nextRows = withAssignmentPlaceholder(
            (response.items ?? []).map((item) => ({
              specialistId: item.specialistId,
              specialistExperience: item.specialistExperience,
            })),
          );

          setAssignmentsByClinicTreatmentIdMap((prev) => ({
            ...prev,
            [clinicTreatmentId]: nextRows,
          }));
          setBaselineByClinicTreatmentIdMap((prev) => ({
            ...prev,
            [clinicTreatmentId]: nextRows.map((row) => ({ ...row })),
          }));
          Toaster("Assignments updated successfully", "success");
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error syncing assignments:", error);
        Toaster("Something went wrong, please try again.", "error");
        return false;
      } finally {
        setSavingClinicTreatmentId(null);
      }
    },
    [
      accessToken,
      activeClinicId,
      assignmentsByClinicTreatmentIdMap,
      baselineByClinicTreatmentIdMap,
    ],
  );

  const revertAssignments = useCallback((clinicTreatmentId: string) => {
    setAssignmentsByClinicTreatmentIdMap((prev) => {
      const snapshot = baselineByClinicTreatmentIdMap[clinicTreatmentId];
      if (!snapshot) return prev;

      return {
        ...prev,
        [clinicTreatmentId]: snapshot.map((row) => ({ ...row })),
      };
    });
  }, [baselineByClinicTreatmentIdMap]);

  const canSaveClinicTreatment = useCallback(
    (clinicTreatmentId: string) =>
      canSaveAssignments(
        assignmentsByClinicTreatmentIdMap[clinicTreatmentId] ?? [],
        baselineByClinicTreatmentIdMap[clinicTreatmentId] ?? [],
      ),
    [assignmentsByClinicTreatmentIdMap, baselineByClinicTreatmentIdMap],
  );

  useEffect(() => {
    if (!clinicTreatments.length) return;
    void loadAssignments();
  }, [clinicTreatments, loadAssignments]);

  useEffect(() => {
    if (!activeClinicId) return;

    void fetchClinicSpecialists(activeClinicId).then(setSpecialists);
  }, [activeClinicId, fetchClinicSpecialists]);

  return {
    syncAssignments,
    revertAssignments,
    canSaveClinicTreatment,
    savingClinicTreatmentId,
    setAssignmentsByClinicTreatmentIdMap,
    setActiveCategory,
    specialistOptions,
    assignmentsByClinicTreatmentIdMap,
    displayedOfferings,
    clinicTreatments,
    allCategories,
    activeCategory,
    isLoading: isOfferingsLoading || isAssignmentsLoading,
  };
}
