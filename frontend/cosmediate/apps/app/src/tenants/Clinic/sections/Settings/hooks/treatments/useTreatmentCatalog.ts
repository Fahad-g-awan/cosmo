"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getManagementBrandsApi,
  getManagementSpecialistsApi,
  getManagementTreatmentCategoriesApi,
  getManagementTreatmentsApi,
} from "@cosmediate/api";
import {
  Specialist,
  Treatment,
  TreatmentBrand,
  TreatmentCategory,
} from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";
import { Toaster } from "@cosmediate/ui";

interface UseTreatmentCatalogOptions {
  loadBrands?: boolean;
}

export function useTreatmentCatalog(options: UseTreatmentCatalogOptions = {}) {
  const { loadBrands = false } = options;
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const [allCategories, setAllCategories] = useState<TreatmentCategory[]>([]);
  const [allMainTreatments, setAllMainTreatments] = useState<Treatment[]>([]);
  const [treatmentBrands, setTreatmentBrands] = useState<TreatmentBrand[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setIsCatalogLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsCatalogLoading(true);

        const [categoriesRes, treatmentsRes, brandsRes] = await Promise.all([
          getManagementTreatmentCategoriesApi(
            { pagination: { limit: 100 } },
            accessToken,
          ),
          getManagementTreatmentsApi(
            { pagination: { limit: 100 } },
            accessToken,
          ),
          loadBrands
            ? getManagementBrandsApi(
                { pagination: { limit: 100 } },
                accessToken,
              )
            : Promise.resolve(null),
        ]);

        if (cancelled) return;

        setAllCategories(
          (categoriesRes?.items ?? []).sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
        setAllMainTreatments(treatmentsRes?.items ?? []);

        if (brandsRes?.success) {
          setTreatmentBrands(brandsRes.items ?? []);
        }
      } catch (error) {
        console.error("Error loading treatment catalog:", error);
        Toaster(
          "Something went wrong while loading treatment catalog",
          "error",
          "Please try again or contact support",
        );
      } finally {
        if (!cancelled) setIsCatalogLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [accessToken, loadBrands]);

  const allMainTreatmentsByTrtIdMap = useMemo(() => {
    const map: Record<string, Treatment> = {};
    allMainTreatments.forEach((treatment) => {
      map[treatment.id] = treatment;
    });
    return map;
  }, [allMainTreatments]);

  const treatmentBrandOptions = useMemo(
    () =>
      treatmentBrands.map((brand) => ({
        label: brand.name,
        value: brand.id,
      })),
    [treatmentBrands],
  );

  const fetchClinicSpecialists = useCallback(
    async (clinicId: string): Promise<Specialist[]> => {
      if (!clinicId || !accessToken) return [];

      try {
        const res = await getManagementSpecialistsApi(
          {
            filters: { clinicId },
            pagination: { limit: 100 },
          },
          accessToken,
        );

        if (res.success && res.items.length) {
          return res.items;
        }

        return [];
      } catch (error) {
        console.error("Error fetching clinic specialists:", error);
        Toaster(
          "Something went wrong while loading specialists",
          "error",
          "Please try again or contact support",
        );
        return [];
      }
    },
    [accessToken],
  );

  return {
    allCategories,
    allMainTreatments,
    allMainTreatmentsByTrtIdMap,
    treatmentBrands,
    treatmentBrandOptions,
    isCatalogLoading,
    fetchClinicSpecialists,
  };
}
