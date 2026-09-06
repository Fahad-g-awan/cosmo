"use client";

import React, { useCallback, useMemo } from "react";

import { BrowseLayout } from "@web/layout/BrowseLayout";
import type {
  FetchParams,
  FetchResponse,
  ViewModes,
} from "@cosmediate/browse-manager";
import { mapListApiResponse } from "@cosmediate/browse-manager";
import { NoDataFound, MainFeaturesLoader } from "@cosmediate/ui";
import type { Treatment } from "@cosmediate/type-utils";
import { getTreatmentsApi } from "@cosmediate/api";
import { useTranslations } from "@cosmediate/i18n/client";

import {
  FilterOptionsProvider,
  useFilterOptions,
} from "@web/context/FilterOptionsContext";
import { buildTreatmentsConfig } from "./lib/config";
import { normalizeTreatmentBrowseFilters } from "@web/lib/filters/treatment-list-filters";
import { GridView } from "./components/views/GridView";
import { ListView } from "./components/views/ListView";

const Treatments = () => {
  const browse = useTranslations("browse");
  const { treatmentCategories, treatmentBrands, priceData, isLoading } =
    useFilterOptions();

  const config = useMemo(
    () =>
      buildTreatmentsConfig({
        treatmentCategories,
        treatmentBrands,
        priceData,
        browse,
      }),
    [treatmentCategories, treatmentBrands, priceData, browse],
  );

  const fetchTreatments = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Treatment>> => {
      try {
        const response = await getTreatmentsApi({
          ...params,
          filters: normalizeTreatmentBrowseFilters(params.filters),
        });
        return mapListApiResponse(response);
      } catch (error) {
        console.error("Error fetching treatments:", error);
        return {
          items: [],
          total: 0,
        };
      }
    },
    [],
  );

  const renderTreatmentCard = useCallback(
    (item: Treatment, viewMode: ViewModes) => {
      if (viewMode === "list") {
        return <ListView treatment={item} />;
      }
      return <GridView treatment={item} />;
    },
    [],
  );

  if (isLoading || !config) return <MainFeaturesLoader />;

  return (
    <BrowseLayout
      config={config}
      fetchData={fetchTreatments}
      renderItem={renderTreatmentCard}
      emptyComponent={
        <NoDataFound
          message={browse.empty.treatments}
          description={browse.empty.refreshHint}
        />
      }
      noResultsComponent={
        <NoDataFound
          message={browse.empty.treatments}
          description={browse.empty.noResultsHint}
        />
      }
      entity="treatments"
    />
  );
};

const TreatmentsPage = () => {
  return (
    <FilterOptionsProvider>
      <Treatments />
    </FilterOptionsProvider>
  );
};

export default TreatmentsPage;
