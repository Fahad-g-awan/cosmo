"use client";

import React, { useCallback, useMemo } from "react";

import type {
  FetchParams,
  FetchResponse,
  ViewModes,
} from "@cosmediate/browse-manager";
import { listClinicSpecialistTreatmentsApi } from "@cosmediate/api";
import { MainFeaturesLoader, NoDataFound } from "@cosmediate/ui";
import type { Clinic, Treatment } from "@cosmediate/type-utils";
import { useTranslations } from "@cosmediate/i18n/client";

import {
  dedupeClinicSpecialistTreatmentsByTreatmentId,
  mapClinicSpecialistTreatmentToTreatment,
} from "@web/lib/mappers/clinic-specialist-treatment.mapper";
import { normalizeClinicSpecialistTreatmentBrowseFilters } from "@web/lib/filters/clinic-specialist-treatment-list-filters";
import { buildClinicTreatmentsTabConfig } from "@web/features/Treatments/lib/config";
import { GridView } from "@web/features/Treatments/components/views/GridView";
import { ListView } from "@web/features/Treatments/components/views/ListView";
import { ProfileBrowseTab } from "@web/components/profile/ProfileBrowseTab";
import { useFilterOptions } from "@web/context/FilterOptionsContext";

const TreatmentsTab = ({ clinic }: { clinic: Clinic }) => {
  const browse = useTranslations("browse");
  const profile = useTranslations("profile");
  const common = useTranslations("common");
  const { treatmentCategories, treatmentBrands, priceData, isLoading } =
    useFilterOptions();

  const config = useMemo(() => {
    const baseConfig = buildClinicTreatmentsTabConfig({
      treatmentCategories,
      treatmentBrands,
      priceData,
      browse,
    });

    const scope = `detail:clinics:${clinic.id}:treatments`;

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
  }, [treatmentCategories, treatmentBrands, priceData, clinic.id, browse]);

  const fetchTreatments = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Treatment>> => {
      try {
        const sortBy = params.sort?.by;
        const isTopSearchedSort =
          sortBy === "searchClicks" || sortBy === "topSearched";

        const response = await listClinicSpecialistTreatmentsApi({
          ...params,
          filters: {
            ...normalizeClinicSpecialistTreatmentBrowseFilters(
              params.filters as Record<string, unknown> | undefined,
            ),
            clinicId: clinic.id,
            ...(isTopSearchedSort ? { allowZeroSearchClicks: true } : {}),
          },
        });

        if (!response.success) {
          return { items: [], total: 0 };
        }

        const uniqueItems = dedupeClinicSpecialistTreatmentsByTreatmentId(
          response.items,
        );

        return {
          items: uniqueItems.map(mapClinicSpecialistTreatmentToTreatment),
          total: response.total,
          nextToken: response.nextToken ?? undefined,
        };
      } catch (error) {
        console.error("Error fetching clinic treatments:", error);
        return {
          items: [],
          total: 0,
        };
      }
    },
    [clinic.id],
  );

  const renderTreatmentCard = useCallback(
    (item: Treatment, viewMode: ViewModes) => {
      if (viewMode === "list") return <ListView treatment={item} />;
      return <GridView treatment={item} />;
    },
    [],
  );

  if (isLoading || !config) return <MainFeaturesLoader />;

  return (
    <ProfileBrowseTab
      config={config}
      fetchData={fetchTreatments}
      renderItem={renderTreatmentCard}
      emptyComponent={
        <NoDataFound
          message={profile.empty.treatments}
          description={common.pleaseTryAgain}
        />
      }
      noResultsComponent={
        <NoDataFound
          message={profile.empty.treatments}
          description={profile.empty.filterHint}
        />
      }
      entity="treatments"
    />
  );
};

export default TreatmentsTab;
