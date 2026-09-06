"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  listClinicTreatmentsApi,
  syncClinicTreatmentsApi,
} from "@cosmediate/api";
import { Treatment } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";
import { Toaster } from "@cosmediate/ui";

import { useWorkspace } from "@app/context/WorkspaceContext";

import type { TreatmentCategoryTab } from "../../types/treatment.types";
import { useTreatmentCatalog } from "./useTreatmentCatalog";

/**
 * Manager-only: sync main catalog treatments to clinic offerings.
 */
export function useTreatmentSelection() {
  const [selectedTreatments, setSelectedTreatments] = useState<Treatment[]>([]);
  const [activeCategory, setActiveCategory] = useState<TreatmentCategoryTab>();
  const [isSelectionLoading, setIsSelectionLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { session } = useAuth();
  const { activeClinicId, scopeVersion } = useWorkspace();
  const accessToken = session?.tokens?.accessToken;

  const { allCategories, allMainTreatments, isCatalogLoading } =
    useTreatmentCatalog();

  const selectedTreatmentsByCategory = useMemo(() => {
    if (!activeCategory) return [];

    return selectedTreatments.filter(
      (treatment) => treatment.categoryId === activeCategory.id,
    );
  }, [selectedTreatments, activeCategory]);

  const selectableMainTreatments = useMemo(() => {
    if (!activeCategory) return [];

    return allMainTreatments
      .filter((treatment) => treatment.categoryId === activeCategory.id)
      .filter(
        (treatment) =>
          !selectedTreatments.some((selected) => selected.id === treatment.id),
      );
  }, [allMainTreatments, selectedTreatments, activeCategory]);

  const loadSelectedTreatments = useCallback(async () => {
    if (!activeClinicId || !accessToken || !allMainTreatments.length) return;

    try {
      setIsSelectionLoading(true);

      const response = await listClinicTreatmentsApi(
        { clinicId: activeClinicId },
        accessToken,
      );

      const treatmentIds = new Set(
        (response.items ?? []).map((item) => item.treatmentId),
      );

      setSelectedTreatments(
        allMainTreatments.filter((treatment) => treatmentIds.has(treatment.id)),
      );
    } catch (error) {
      console.error("Error loading clinic treatment selection:", error);
      Toaster(
        "Something went wrong while loading treatments data",
        "error",
        "Please try again or contact support",
      );
    } finally {
      setIsSelectionLoading(false);
    }
  }, [activeClinicId, accessToken, allMainTreatments]);

  const syncSelection = useCallback(async () => {
    if (!activeClinicId || !accessToken) {
      Toaster("Unauthorized", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      await syncClinicTreatmentsApi(
        {
          clinicId: activeClinicId,
          treatmentIds: selectedTreatments.map((treatment) => treatment.id),
        },
        accessToken,
      );

      Toaster("Treatments updated successfully", "success");
    } catch (error) {
      console.error("Error syncing clinic treatments:", error);
      Toaster("Something went wrong, please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [activeClinicId, accessToken, selectedTreatments]);

  useEffect(() => {
    if (!activeCategory && allCategories.length > 0) {
      setActiveCategory(allCategories[0]);
    }
  }, [allCategories, activeCategory]);

  useEffect(() => {
    if (isCatalogLoading || !allMainTreatments.length) return;
    void loadSelectedTreatments();
  }, [
    isCatalogLoading,
    allMainTreatments.length,
    loadSelectedTreatments,
    scopeVersion,
  ]);

  return {
    syncSelection,
    setActiveCategory,
    setSelectedTreatments,
    selectedTreatmentsByCategory,
    allCategories,
    activeCategory,
    selectedTreatments,
    selectableMainTreatments,
    allMainTreatments,
    isLoading: isCatalogLoading || isSelectionLoading,
    isSubmitting,
  };
}
