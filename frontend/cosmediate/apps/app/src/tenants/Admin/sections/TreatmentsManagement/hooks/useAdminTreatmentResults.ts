"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getManagementTreatmentCategoriesApi,
  getManagementTreatmentResultsApi,
  getManagementTreatmentsApi,
} from "@cosmediate/api";
import { Treatment, TreatmentResult } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";
import { Toaster } from "@cosmediate/ui";

import type { TreatmentCategoryTab } from "@app/tenants/Clinic/sections/Settings/types/treatment.types";

type CancelFlag = { cancelled: boolean };

function groupResultsByTreatmentId(
  catalogTreatments: Treatment[],
  results: TreatmentResult[],
): Record<string, TreatmentResult[]> {
  const grouped = catalogTreatments.reduce(
    (acc, treatment) => {
      acc[treatment.id] = [];
      return acc;
    },
    {} as Record<string, TreatmentResult[]>,
  );

  results.forEach((result) => {
    const treatmentId = result.treatmentId;
    if (!treatmentId || !grouped[treatmentId]) return;
    grouped[treatmentId].push(result);
  });

  return grouped;
}

/**
 * Admin catalog-scoped treatment results grouped by master treatmentId.
 */
export function useAdminTreatmentResults() {
  const [allCategories, setAllCategories] = useState<TreatmentCategoryTab[]>(
    [],
  );
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [activeCategory, setActiveCategory] = useState<TreatmentCategoryTab>();
  const [resultsByTreatmentIdMap, setResultsByTreatmentIdMap] = useState<
    Record<string, TreatmentResult[]>
  >({});
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);

  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const activeCategoryIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    activeCategoryIdRef.current = activeCategory?.id;
  }, [activeCategory?.id]);

  useEffect(() => {
    if (!accessToken) {
      setIsCatalogLoading(false);
      return;
    }

    const cancel: CancelFlag = { cancelled: false };

    const loadCategories = async () => {
      try {
        setIsCatalogLoading(true);

        const response = await getManagementTreatmentCategoriesApi(
          { pagination: { limit: 100 } },
          accessToken,
        );

        if (cancel.cancelled) return;

        const categories = (response.items ?? [])
          .map((category) => ({ id: category.id, name: category.name }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setAllCategories(categories);
        setActiveCategory((current) => current ?? categories[0]);
      } catch (error) {
        console.error("Error loading treatment categories:", error);
        Toaster(
          "Something went wrong while loading treatment categories",
          "error",
        );
      } finally {
        if (!cancel.cancelled) setIsCatalogLoading(false);
      }
    };

    void loadCategories();

    return () => {
      cancel.cancelled = true;
    };
  }, [accessToken]);

  const loadCategoryData = useCallback(
    async (category: TreatmentCategoryTab, cancel: CancelFlag) => {
      if (!accessToken) return;

      try {
        setIsContentLoading(true);
        setTreatments([]);
        setResultsByTreatmentIdMap({});

        const treatmentsRes = await getManagementTreatmentsApi(
          {
            filters: { categoryId: category.id },
            pagination: { limit: 100 },
          },
          accessToken,
        );

        if (cancel.cancelled) return;

        const catalogTreatments = treatmentsRes.items ?? [];
        setTreatments(catalogTreatments);

        if (catalogTreatments.length === 0) {
          setResultsByTreatmentIdMap({});
          return;
        }

        const treatmentIds = catalogTreatments.map((treatment) => treatment.id);

        const resultsRes = await getManagementTreatmentResultsApi(
          {
            filters: {
              ownerType: "ADMIN",
              treatmentId: treatmentIds,
            },
            pagination: { limit: 100 },
          },
          accessToken,
        );

        if (cancel.cancelled) return;

        setResultsByTreatmentIdMap(
          groupResultsByTreatmentId(
            catalogTreatments,
            resultsRes.items ?? [],
          ),
        );
      } catch (error) {
        console.error("Error loading admin treatment results:", error);
        if (!cancel.cancelled) {
          Toaster(
            "Something went wrong while loading treatment results",
            "error",
          );
          setTreatments([]);
          setResultsByTreatmentIdMap({});
        }
      } finally {
        if (!cancel.cancelled) setIsContentLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (!activeCategory || !accessToken) return;

    const cancel: CancelFlag = { cancelled: false };
    void loadCategoryData(activeCategory, cancel);

    return () => {
      cancel.cancelled = true;
    };
  }, [activeCategory, accessToken, loadCategoryData]);

  const reloadResults = useCallback(async () => {
    const categoryId = activeCategoryIdRef.current;
    if (!categoryId || !accessToken) return;

    const category =
      allCategories.find((item) => item.id === categoryId) ?? activeCategory;
    if (!category) return;

    await loadCategoryData(category, { cancelled: false });
  }, [accessToken, activeCategory, allCategories, loadCategoryData]);

  return {
    setActiveCategory,
    reloadResults,
    resultsByTreatmentIdMap,
    displayedTreatments: treatments,
    allCategories,
    activeCategory,
    isCatalogLoading,
    isContentLoading,
    isLoading: isCatalogLoading || isContentLoading,
  };
}
