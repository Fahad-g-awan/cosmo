"use client";

import React, { useCallback, useMemo } from "react";

import type {
  FetchParams,
  FetchResponse,
  ViewModes,
} from "@cosmediate/browse-manager";
import { mapListApiResponse } from "@cosmediate/browse-manager";
import { BrowseLayout } from "@web/layout/BrowseLayout";
import { MainFeaturesLoader, NoDataFound } from "@cosmediate/ui";
import type { Clinic } from "@cosmediate/type-utils";
import { getClinicsApi } from "@cosmediate/api";
import { useTranslations } from "@cosmediate/i18n/client";

import {
  FilterOptionsProvider,
  useFilterOptions,
} from "@web/context/FilterOptionsContext";
import { normalizeClinicBrowseFilters } from "@web/lib/filters/clinic-list-filters";
import {
  useTreatmentBrowseFetcher,
} from "@web/lib/filters/public-browse-fetchers";
import { GridView } from "./components/views/GridView";
import { ListView } from "./components/views/ListView";
import { buildClinicsConfig } from "./lib/config";

const Clinics = () => {
  const browse = useTranslations("browse");
  const {
    clinicCategories,
    treatmentCategories,
    treatmentBrands,
    priceData,
    isLoading,
  } = useFilterOptions();

  const treatmentAsyncFetch = useTreatmentBrowseFetcher();

  const config = useMemo(
    () =>
      buildClinicsConfig({
        clinicCategories,
        treatmentCategories,
        treatmentBrands,
        priceData,
        treatmentAsyncFetch,
        browse,
      }),
    [
      clinicCategories,
      treatmentCategories,
      treatmentBrands,
      priceData,
      treatmentAsyncFetch,
      browse,
    ],
  );

  const fetchClinics = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Clinic>> => {
      try {
        const response = await getClinicsApi({
          ...params,
          filters: normalizeClinicBrowseFilters(params.filters),
        });
        return mapListApiResponse(response);
      } catch (error) {
        console.error("Error fetching clinics:", error);
        return {
          items: [],
          total: 0,
        };
      }
    },
    [],
  );

  const renderClinicCard = useCallback((item: Clinic, viewMode: ViewModes) => {
    if (viewMode === "list") return <ListView clinic={item} />;
    return <GridView clinic={item} />;
  }, []);

  if (isLoading || !config) return <MainFeaturesLoader />;

  return (
    <BrowseLayout
      config={config}
      fetchData={fetchClinics}
      renderItem={renderClinicCard}
      emptyComponent={
        <NoDataFound
          message={browse.empty.clinics}
          description={browse.empty.refreshHint}
        />
      }
      noResultsComponent={
        <NoDataFound
          message={browse.empty.clinics}
          description={browse.empty.noResultsHint}
        />
      }
      entity="clinics"
    />
  );
};

const ClinicsPage = () => {
  return (
    <FilterOptionsProvider>
      <Clinics />
    </FilterOptionsProvider>
  );
};

export default ClinicsPage;
