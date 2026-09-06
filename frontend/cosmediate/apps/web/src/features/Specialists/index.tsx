"use client";

import React, { useCallback, useMemo } from "react";

import type {
  FetchParams,
  FetchResponse,
  ViewModes,
} from "@cosmediate/browse-manager";
import { mapListApiResponse } from "@cosmediate/browse-manager";
import type { Specialist } from "@cosmediate/type-utils";
import { getSpecialistsApi } from "@cosmediate/api";
import { useTranslations } from "@cosmediate/i18n/client";
import { MainFeaturesLoader } from "@cosmediate/ui";
import { NoDataFound } from "@cosmediate/ui";

import {
  FilterOptionsProvider,
  useFilterOptions,
} from "@web/context/FilterOptionsContext";
import { BrowseLayout } from "@web/layout/BrowseLayout";
import { buildSpecialistsConfig } from "./lib/config";
import { normalizeSpecialistBrowseFilters } from "@web/lib/filters/specialist-list-filters";
import {
  useClinicBrowseFetcher,
  useTreatmentBrowseFetcher,
} from "@web/lib/filters/public-browse-fetchers";
import { GridView } from "./components/views/GridView";
import { ListView } from "./components/views/ListView";

const Specialists = () => {
  const browse = useTranslations("browse");
  const {
    treatmentCategories,
    treatmentBrands,
    priceData,
    isLoading,
  } = useFilterOptions();

  const clinicAsyncFetch = useClinicBrowseFetcher();
  const treatmentAsyncFetch = useTreatmentBrowseFetcher();

  const config = useMemo(
    () =>
      buildSpecialistsConfig({
        treatmentCategories,
        treatmentBrands,
        priceData,
        clinicAsyncFetch,
        treatmentAsyncFetch,
        browse,
      }),
    [
      treatmentCategories,
      treatmentBrands,
      priceData,
      clinicAsyncFetch,
      treatmentAsyncFetch,
      browse,
    ],
  );

  const fetchSpecialists = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Specialist>> => {
      try {
        const response = await getSpecialistsApi({
          ...params,
          filters: normalizeSpecialistBrowseFilters(params.filters),
        });
        return mapListApiResponse(response);
      } catch (error) {
        console.error("Error fetching specialists:", error);
        return {
          items: [],
          total: 0,
        };
      }
    },
    [],
  );

  const renderSpecialistCard = useCallback(
    (item: Specialist, viewMode: ViewModes) => {
      if (viewMode === "list") {
        return <ListView specialist={item} />;
      }
      return <GridView specialist={item} />;
    },
    [],
  );

  if (isLoading || !config) return <MainFeaturesLoader />;

  return (
    <BrowseLayout
      config={config}
      fetchData={fetchSpecialists}
      renderItem={renderSpecialistCard}
      emptyComponent={
        <NoDataFound
          message={browse.empty.specialists}
          description={browse.empty.refreshHint}
        />
      }
      noResultsComponent={
        <NoDataFound
          message={browse.empty.specialists}
          description={browse.empty.noResultsHint}
        />
      }
      entity="specialists"
    />
  );
};

const SpecialistsPage = () => {
  return (
    <FilterOptionsProvider>
      <Specialists />
    </FilterOptionsProvider>
  );
};

export default SpecialistsPage;
