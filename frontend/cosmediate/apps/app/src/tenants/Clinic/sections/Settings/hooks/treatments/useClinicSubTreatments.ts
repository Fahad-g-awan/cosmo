"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getManagementSubTreatmentsApi,
  syncClinicSubTreatmentsApi,
} from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";
import { Toaster } from "@cosmediate/ui";

import {
  canSaveSubTreatments,
  isIncompleteSubTreatmentRow,
  isValidSubTreatment,
} from "../../defaults/treatment.defaults";
import { mapApiSubTreatment, withSubTreatmentPlaceholder } from "./shared";
import { SubTreatmentType } from "../../types/treatment.types";
import { useClinicOfferings } from "./useClinicOfferings";

/**
 * Manager-only: per clinicTreatmentId sub-treatment sync.
 */
export function useClinicSubTreatments() {
  const [
    subTreatmentsByClinicTreatmentIdMap,
    setSubTreatmentsByClinicTreatmentIdMap,
  ] = useState<Record<string, SubTreatmentType[]>>({});
  const [
    baselineByClinicTreatmentIdMap,
    setBaselineByClinicTreatmentIdMap,
  ] = useState<Record<string, SubTreatmentType[]>>({});
  const [savingClinicTreatmentId, setSavingClinicTreatmentId] = useState<
    string | null
  >(null);
  const [isSubTreatmentsLoading, setIsSubTreatmentsLoading] = useState(false);

  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const {
    allCategories,
    activeCategory,
    setActiveCategory,
    clinicTreatments,
    displayedOfferings,
    treatmentBrandOptions,
    activeClinicId,
    refetchOfferings,
    isLoading: isOfferingsLoading,
  } = useClinicOfferings({ loadBrands: true });

  const cloneRowsMap = (map: Record<string, SubTreatmentType[]>) =>
    Object.fromEntries(
      Object.entries(map).map(([id, rows]) => [
        id,
        rows.map((row) => ({
          ...row,
          brandIds: [...(row.brandIds ?? [])],
        })),
      ]),
    );

  const applySubTreatmentsToOfferings = useCallback(
    (apiSubTreatments: SubTreatmentType[]) => {
      const grouped = clinicTreatments.reduce(
        (acc, offering) => {
          acc[offering.id] = [];
          return acc;
        },
        {} as Record<string, SubTreatmentType[]>,
      );

      apiSubTreatments.forEach((subTreatment) => {
        const clinicTreatmentId = subTreatment.clinicTreatmentId;
        if (!clinicTreatmentId || !grouped[clinicTreatmentId]) return;
        grouped[clinicTreatmentId].push(subTreatment);
      });

      Object.keys(grouped).forEach((clinicTreatmentId) => {
        grouped[clinicTreatmentId] = withSubTreatmentPlaceholder(
          grouped[clinicTreatmentId] ?? [],
        );
      });

      setSubTreatmentsByClinicTreatmentIdMap(grouped);
      setBaselineByClinicTreatmentIdMap(cloneRowsMap(grouped));
    },
    [clinicTreatments],
  );

  const loadSubTreatments = useCallback(async () => {
    if (!activeClinicId || !accessToken) return;

    try {
      setIsSubTreatmentsLoading(true);

      const response = await getManagementSubTreatmentsApi(
        { filters: { clinicId: activeClinicId } },
        accessToken,
      );

      applySubTreatmentsToOfferings(
        (response.items ?? []).map(mapApiSubTreatment),
      );
    } catch (error) {
      console.error("Error loading sub-treatments:", error);
      Toaster("Something went wrong, please try again.", "error");
    } finally {
      setIsSubTreatmentsLoading(false);
    }
  }, [accessToken, activeClinicId, applySubTreatmentsToOfferings]);

  const syncSubTreatments = useCallback(
    async (clinicTreatmentId: string) => {
      if (!accessToken || !activeClinicId) {
        Toaster("Unauthorized Access", "error");
        return false;
      }

      const rows = subTreatmentsByClinicTreatmentIdMap[clinicTreatmentId] ?? [];
      const baseline = baselineByClinicTreatmentIdMap[clinicTreatmentId] ?? [];

      if (rows.some(isIncompleteSubTreatmentRow)) {
        Toaster(
          "Incomplete sub-treatment",
          "error",
          "Each row needs name, price, duration, and at least one brand — or leave the row empty",
        );
        return false;
      }

      if (!canSaveSubTreatments(rows, baseline)) {
        return false;
      }

      const payload = rows.filter(isValidSubTreatment).map((row) => ({
        ...(row.id ? { id: row.id } : {}),
        name: row.name.trim(),
        price: Number(row.price),
        duration: row.duration.trim(),
        available: Boolean(row.available),
        brandIds: row.brandIds,
      }));

      try {
        setSavingClinicTreatmentId(clinicTreatmentId);

        const response = await syncClinicSubTreatmentsApi(
          {
            clinicTreatmentId,
            subTreatments: payload,
          },
          accessToken,
        );

        if (response.success) {
          const nextRows = withSubTreatmentPlaceholder(
            (response.items ?? []).map(mapApiSubTreatment),
          );

          setSubTreatmentsByClinicTreatmentIdMap((prev) => ({
            ...prev,
            [clinicTreatmentId]: nextRows,
          }));
          setBaselineByClinicTreatmentIdMap((prev) => ({
            ...prev,
            [clinicTreatmentId]: nextRows.map((row) => ({
              ...row,
              brandIds: [...(row.brandIds ?? [])],
            })),
          }));
          Toaster("Sub-treatments updated successfully", "success");
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error syncing sub-treatments:", error);
        Toaster("Something went wrong, please try again.", "error");
        return false;
      } finally {
        setSavingClinicTreatmentId(null);
      }
    },
    [
      accessToken,
      activeClinicId,
      subTreatmentsByClinicTreatmentIdMap,
      baselineByClinicTreatmentIdMap,
    ],
  );

  const revertSubTreatments = useCallback(
    (clinicTreatmentId: string) => {
      setSubTreatmentsByClinicTreatmentIdMap((prev) => {
        const snapshot = baselineByClinicTreatmentIdMap[clinicTreatmentId];
        if (!snapshot) return prev;

        return {
          ...prev,
          [clinicTreatmentId]: snapshot.map((row) => ({
            ...row,
            brandIds: [...(row.brandIds ?? [])],
          })),
        };
      });
    },
    [baselineByClinicTreatmentIdMap],
  );

  const canSaveClinicTreatment = useCallback(
    (clinicTreatmentId: string) =>
      canSaveSubTreatments(
        subTreatmentsByClinicTreatmentIdMap[clinicTreatmentId] ?? [],
        baselineByClinicTreatmentIdMap[clinicTreatmentId] ?? [],
      ),
    [subTreatmentsByClinicTreatmentIdMap, baselineByClinicTreatmentIdMap],
  );

  useEffect(() => {
    if (!clinicTreatments.length) return;
    void loadSubTreatments();
  }, [clinicTreatments, loadSubTreatments]);

  return {
    syncSubTreatments,
    revertSubTreatments,
    canSaveClinicTreatment,
    savingClinicTreatmentId,
    setSubTreatmentsByClinicTreatmentIdMap,
    setActiveCategory,
    treatmentBrandOptions,
    subTreatmentsByClinicTreatmentIdMap,
    displayedOfferings,
    clinicTreatments,
    allCategories,
    activeCategory,
    refetchOfferings,
    isLoading: isOfferingsLoading || isSubTreatmentsLoading,
  };
}
