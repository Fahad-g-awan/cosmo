"use client";

import React, { useCallback, useMemo } from "react";

import type {
  FetchParams,
  FetchResponse,
  ViewModes,
} from "@cosmediate/browse-manager";
import { mapListApiResponse } from "@cosmediate/browse-manager";
import { MainFeaturesLoader, NoDataFound } from "@cosmediate/ui";
import type { Clinic, Specialist } from "@cosmediate/type-utils";
import { useTranslations } from "@cosmediate/i18n/client";
import { getSpecialistsApi } from "@cosmediate/api";

import { normalizeSpecialistBrowseFilters } from "@web/lib/filters/specialist-list-filters";
import { useTreatmentBrowseFetcher } from "@web/lib/filters/public-browse-fetchers";
import { buildClinicDoctorsTabConfig } from "@web/features/Specialists/lib/config";
import { GridView } from "@web/features/Specialists/components/views/GridView";
import { ListView } from "@web/features/Specialists/components/views/ListView";
import { ProfileBrowseTab } from "@web/components/profile/ProfileBrowseTab";
import { useFilterOptions } from "@web/context/FilterOptionsContext";

const DoctorsTab = ({ clinic }: { clinic: Clinic }) => {
  const browse = useTranslations("browse");
  const profile = useTranslations("profile");
  const common = useTranslations("common");
  const { treatmentCategories, treatmentBrands, priceData, isLoading } =
    useFilterOptions();

  const treatmentAsyncFetch = useTreatmentBrowseFetcher();

  const config = useMemo(() => {
    const baseConfig = buildClinicDoctorsTabConfig({
      treatmentCategories,
      treatmentBrands,
      priceData,
      treatmentAsyncFetch,
      browse,
    });

    const scope = `detail:clinics:${clinic.id}:doctors`;

    return {
      ...baseConfig,
      filters: {
        ...baseConfig.filters,
        scope,
        syncToUrl: true,
      },
      preferences: {
        ...baseConfig.preferences,
        scope,
        syncToUrl: true,
      },
    };
  }, [
    treatmentCategories,
    treatmentBrands,
    priceData,
    treatmentAsyncFetch,
    clinic.id,
    browse,
  ]);

  const fetchSpecialists = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Specialist>> => {
      try {
        const sortBy = params.sort?.by;
        const isTopSearchedSort =
          sortBy === "searchClicks" || sortBy === "topSearched";

        const response = await getSpecialistsApi({
          ...params,
          filters: {
            ...normalizeSpecialistBrowseFilters(
              params.filters as Record<string, unknown> | undefined,
            ),
            clinicId: clinic.id,
            ...(isTopSearchedSort ? { allowZeroSearchClicks: true } : {}),
          },
        });

        return mapListApiResponse(response);
      } catch (error) {
        console.error("Error fetching clinic specialists:", error);
        return {
          items: [],
          total: 0,
        };
      }
    },
    [clinic.id],
  );

  const renderSpecialistCard = useCallback(
    (item: Specialist, viewMode: ViewModes) => {
      if (viewMode === "list") return <ListView specialist={item} />;
      return <GridView specialist={item} />;
    },
    [],
  );

  if (isLoading || !config) return <MainFeaturesLoader />;

  return (
    <ProfileBrowseTab
      config={config}
      fetchData={fetchSpecialists}
      renderItem={renderSpecialistCard}
      emptyComponent={
        <NoDataFound
          message={profile.empty.doctors}
          description={common.pleaseTryAgain}
        />
      }
      noResultsComponent={
        <NoDataFound
          message={profile.empty.doctors}
          description={profile.empty.filterHint}
        />
      }
      entity="specialists"
    />
  );
};

export default DoctorsTab;
