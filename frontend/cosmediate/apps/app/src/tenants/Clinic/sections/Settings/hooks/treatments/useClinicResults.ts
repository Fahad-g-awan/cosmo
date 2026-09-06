"use client";

import { useCallback, useEffect, useState } from "react";

import { getManagementTreatmentResultsApi } from "@cosmediate/api";
import { TreatmentResult } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";
import { Toaster } from "@cosmediate/ui";

import { useClinicOfferings } from "./useClinicOfferings";

/**
 * Manager-only: treatment results grouped by clinicTreatmentId.
 */
export function useClinicResults() {
  const [resultsByClinicTreatmentIdMap, setResultsByClinicTreatmentIdMap] =
    useState<Record<string, TreatmentResult[]>>({});
  const [isResultsLoading, setIsResultsLoading] = useState(false);

  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const {
    refetchOfferings,
    setActiveCategory,
    displayedOfferings,
    clinicTreatments,
    allCategories,
    activeCategory,
    activeClinicId,
    isLoading: isOfferingsLoading,
  } = useClinicOfferings();

  const loadResults = useCallback(async () => {
    if (!activeClinicId || !accessToken) return;

    try {
      setIsResultsLoading(true);

      const offerings = clinicTreatments.length
        ? clinicTreatments
        : await refetchOfferings();

      const resultsRes = await getManagementTreatmentResultsApi(
        {
          filters: {
            clinicId: activeClinicId,
            ownerType: "CLINIC",
          },
          pagination: { limit: 100 },
        },
        accessToken,
      );

      const grouped = (offerings ?? []).reduce(
        (acc, offering) => {
          acc[offering.id] = [];
          return acc;
        },
        {} as Record<string, TreatmentResult[]>,
      );

      (resultsRes.items ?? []).forEach((result) => {
        const clinicTreatmentId = result.clinicTreatmentId;
        if (!clinicTreatmentId || !grouped[clinicTreatmentId]) return;
        grouped[clinicTreatmentId].push(result);
      });

      setResultsByClinicTreatmentIdMap(grouped);
    } catch (error) {
      console.error("Error loading treatment results:", error);
      Toaster(
        "Something went wrong while loading treatment results",
        "error",
        "Please try again or contact support",
      );
    } finally {
      setIsResultsLoading(false);
    }
  }, [accessToken, activeClinicId, clinicTreatments, refetchOfferings]);

  useEffect(() => {
    if (!activeClinicId) return;
    void loadResults();
  }, [activeClinicId, loadResults, clinicTreatments.length]);

  return {
    setActiveCategory,
    setResultsByClinicTreatmentIdMap,
    reloadResults: loadResults,
    resultsByClinicTreatmentIdMap,
    displayedOfferings,
    clinicTreatments,
    allCategories,
    activeCategory,
    isLoading: isOfferingsLoading || isResultsLoading,
  };
}
