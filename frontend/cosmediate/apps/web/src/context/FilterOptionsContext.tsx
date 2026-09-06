"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  getClinicCategoriesApi,
  getTreatmentCategoriesApi,
  getBrandsApi,
  getPriceFiltersDataApi,
} from "@cosmediate/api";
import type {
  ClinicCategory,
  TreatmentBrand,
  TreatmentCategory,
} from "@cosmediate/type-utils";
import { Histogram } from "@cosmediate/browse-manager/filters";

export type PriceData = {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  binCount?: number;
  histograms: {
    clinic?: Histogram[];
    treatment?: Histogram[];
    specialist?: Histogram[];
    brand?: Histogram[];
  };
};

interface FilterOptionsContextType {
  clinicCategories: ClinicCategory[];
  treatmentCategories: TreatmentCategory[];
  treatmentBrands: TreatmentBrand[];
  priceData: PriceData | null;
  isLoading: boolean;
}

const FilterOptionsContext = createContext<FilterOptionsContextType | null>(
  null,
);

interface FilterOptionsProviderProps {
  children: React.ReactNode;
}

export const FilterOptionsProvider = ({
  children,
}: FilterOptionsProviderProps) => {
  const [clinicCategories, setClinicCategories] = useState<ClinicCategory[]>(
    [],
  );
  const [treatmentCategories, setTreatmentCategories] = useState<
    TreatmentCategory[]
  >([]);
  const [treatmentBrands, setTreatmentBrands] = useState<TreatmentBrand[]>([]);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    void (async () => {
      try {
        const [clinicResult, treatmentResult, brandsResult, priceResult] =
          await Promise.allSettled([
            getClinicCategoriesApi({ pagination: { limit: 100 } }),
            getTreatmentCategoriesApi({ pagination: { limit: 100 } }),
            getBrandsApi({ pagination: { limit: 100 } }),
            getPriceFiltersDataApi(),
          ]);

        if (clinicResult.status === "fulfilled") {
          const clinicRes = clinicResult.value;
          if (clinicRes.success && clinicRes.items) {
            setClinicCategories(clinicRes.items);
          }
        } else {
          console.error(
            "[FilterOptionsProvider] Failed to fetch clinic categories:",
            clinicResult.reason,
          );
        }

        if (treatmentResult.status === "fulfilled") {
          const treatmentRes = treatmentResult.value;
          if (treatmentRes.success && treatmentRes.items) {
            setTreatmentCategories(treatmentRes.items);
          }
        } else {
          console.error(
            "[FilterOptionsProvider] Failed to fetch treatment categories:",
            treatmentResult.reason,
          );
        }

        if (brandsResult.status === "fulfilled") {
          const brandsRes = brandsResult.value;
          if (brandsRes.success && brandsRes.items) {
            setTreatmentBrands(brandsRes.items);
          }
        } else {
          console.error(
            "[FilterOptionsProvider] Failed to fetch brands:",
            brandsResult.reason,
          );
        }

        if (priceResult.status === "fulfilled" && priceResult.value) {
          setPriceData(priceResult.value);
        } else if (priceResult.status === "rejected") {
          console.error(
            "[FilterOptionsProvider] Failed to fetch price filter data:",
            priceResult.reason,
          );
        }
      } catch (error) {
        console.error("[FilterOptionsProvider] Failed to load filter data:", error);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    })();
  }, []);

  const value: FilterOptionsContextType = useMemo(
    () => ({
      clinicCategories,
      treatmentCategories,
      treatmentBrands,
      priceData,
      isLoading,
    }),
    [
      clinicCategories,
      treatmentCategories,
      treatmentBrands,
      priceData,
      isLoading,
    ],
  );

  return (
    <FilterOptionsContext.Provider value={value}>
      {children}
    </FilterOptionsContext.Provider>
  );
};

export const useFilterOptions = (): FilterOptionsContextType => {
  const context = useContext(FilterOptionsContext);
  if (!context) {
    throw new Error(
      "useFilterOptions must be used within FilterOptionsProvider",
    );
  }
  return context;
};
