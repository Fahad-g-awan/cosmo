"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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
  histograms: {
    clinic?: Histogram[];
    treatment?: Histogram[];
    brand?: Histogram[];
  };
};

interface FilterOptionsContextType {
  clinicCategories: ClinicCategory[];
  treatmentCategories: TreatmentCategory[];
  treatmentBrands: TreatmentBrand[];
  priceData: PriceData | null;
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

const FilterOptionsContext = createContext<FilterOptionsContextType | null>(
  null
);

interface FilterOptionsProviderProps {
  children: React.ReactNode;
}

export const FilterOptionsProvider = ({
  children,
}: FilterOptionsProviderProps) => {
  const [clinicCategories, setClinicCategories] = useState<ClinicCategory[]>(
    []
  );
  const [treatmentCategories, setTreatmentCategories] = useState<
    TreatmentCategory[]
  >([]);
  const [treatmentBrands, setTreatmentBrands] = useState<TreatmentBrand[]>([]);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (
      treatmentCategories.length > 0 &&
      treatmentBrands.length > 0 &&
      clinicCategories.length > 0
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

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
        clinicResult.reason
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
        treatmentResult.reason
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
        brandsResult.reason
      );
    }

    if (priceResult.status === "fulfilled" && priceResult.value) {
      setPriceData(priceResult.value);
    } else if (priceResult.status === "rejected") {
      console.error(
        "[FilterOptionsProvider] Failed to fetch price filter data:",
        priceResult.reason
      );
    }

    setIsLoading(false);
  }, [
    clinicCategories.length,
    treatmentCategories.length,
    treatmentBrands.length,
  ]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const value: FilterOptionsContextType = useMemo(
    () => ({
      clinicCategories,
      treatmentCategories,
      treatmentBrands,
      priceData,
      isLoading,
      error,
      fetchCategories,
    }),
    [
      clinicCategories,
      treatmentCategories,
      treatmentBrands,
      priceData,
      isLoading,
      error,
      fetchCategories,
    ]
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
      "useFilterOptions must be used within FilterOptionsProvider"
    );
  }
  return context;
};
