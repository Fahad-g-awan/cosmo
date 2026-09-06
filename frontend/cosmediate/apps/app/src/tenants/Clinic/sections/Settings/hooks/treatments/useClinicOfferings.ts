"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { listClinicTreatmentsApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";
import { Toaster } from "@cosmediate/ui";

import { useWorkspace } from "@app/context/WorkspaceContext";

import { ClinicTreatmentOffering } from "../../types/treatment.types";
import type { TreatmentCategoryTab } from "../../types/treatment.types";
import { useTreatmentCatalog } from "./useTreatmentCatalog";

/**
 * Clinic offerings for manager treatments-management tabs.
 * Loads catalog + clinic treatments scoped to activeClinicId.
 */
export function useClinicOfferings(options?: { loadBrands?: boolean }) {
  const [clinicTreatments, setClinicTreatments] = useState<
    ClinicTreatmentOffering[]
  >([]);
  const [activeCategory, setActiveCategory] = useState<TreatmentCategoryTab>();
  const [isOfferingsLoading, setIsOfferingsLoading] = useState(false);

  const catalog = useTreatmentCatalog({ loadBrands: options?.loadBrands });
  const { activeClinicId, scopeVersion } = useWorkspace();
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const refetchOfferings = useCallback(async () => {
    if (!activeClinicId || !accessToken) return [];

    try {
      setIsOfferingsLoading(true);

      const response = await listClinicTreatmentsApi(
        { clinicId: activeClinicId },
        accessToken,
      );
      const offerings = response.items ?? [];
      setClinicTreatments(offerings);
      return offerings;
    } catch (error) {
      console.error("Error loading clinic offerings:", error);
      Toaster(
        "Something went wrong while loading clinic treatments",
        "error",
        "Please try again or contact support",
      );
      return [];
    } finally {
      setIsOfferingsLoading(false);
    }
  }, [activeClinicId, accessToken]);

  useEffect(() => {
    if (catalog.isCatalogLoading) return;
    void refetchOfferings();
  }, [catalog.isCatalogLoading, refetchOfferings, scopeVersion]);

  useEffect(() => {
    if (!activeCategory && catalog.allCategories.length > 0) {
      setActiveCategory(catalog.allCategories[0]);
    }
  }, [catalog.allCategories, activeCategory]);

  const displayedOfferings = useMemo(() => {
    if (!activeCategory) return [];

    return clinicTreatments.filter(
      (offering) => offering.categoryId === activeCategory.id,
    );
  }, [activeCategory, clinicTreatments]);

  return {
    ...catalog,
    clinicTreatments,
    displayedOfferings,
    activeCategory,
    setActiveCategory,
    activeClinicId,
    refetchOfferings,
    isLoading: catalog.isCatalogLoading || isOfferingsLoading,
  };
}
