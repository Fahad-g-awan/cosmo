"use client";

import React, { useCallback, useMemo } from "react";

import {
  mapListApiResponse,
  type FetchParams,
  type FetchResponse,
  type ViewModes,
} from "@cosmediate/browse-manager";
import { MainFeaturesLoader, NoDataFound } from "@cosmediate/ui";
import type { Clinic, Treatment } from "@cosmediate/type-utils";
import { getClinicsByTreatmentIdApi } from "@cosmediate/api/";
import { useTranslations } from "@cosmediate/i18n/client";

import { ProfileBrowseTab } from "@web/components/profile/ProfileBrowseTab";
import { normalizeClinicBrowseFilters } from "@web/lib/filters/clinic-list-filters";
import { buildTreatmentClinicsTabConfig } from "@web/features/Clinics/lib/config";
import { GridView } from "@web/features/Clinics/components/views/GridView";
import { ListView } from "@web/features/Clinics/components/views/ListView";
import { useFilterOptions } from "@web/context/FilterOptionsContext";

const ClinicsTab = ({ treatment }: { treatment: Treatment }) => {
  const browse = useTranslations("browse");
  const profile = useTranslations("profile");
  const common = useTranslations("common");
  const {
    clinicCategories,
    treatmentCategories,
    treatmentBrands,
    priceData,
    isLoading,
  } = useFilterOptions();

  const config = useMemo(() => {
    const baseConfig = buildTreatmentClinicsTabConfig({
      clinicCategories,
      treatmentCategories,
      treatmentBrands,
      priceData,
      browse,
    });

    const scope = `detail:treatments:${treatment.id}:clinics`;

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
    clinicCategories,
    treatmentCategories,
    treatmentBrands,
    priceData,
    treatment.id,
    browse,
  ]);

  const fetchClinics = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Clinic>> => {
      try {
        const normalizedFilters = normalizeClinicBrowseFilters(
          params.filters as Record<string, unknown> | undefined,
        );

        const response = await getClinicsByTreatmentIdApi({
          ...params,
          filters: {
            ...normalizedFilters,
            treatmentId: treatment.id,
          },
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
    [treatment.id],
  );

  const renderClinicCard = useCallback((item: Clinic, viewMode: ViewModes) => {
    if (viewMode === "list") return <ListView clinic={item} />;
    return <GridView clinic={item} />;
  }, []);

  if (isLoading || !config) return <MainFeaturesLoader />;

  return (
    <ProfileBrowseTab
      config={config}
      fetchData={fetchClinics}
      renderItem={renderClinicCard}
      emptyComponent={
        <NoDataFound
          message={profile.empty.clinics}
          description={common.pleaseTryAgain}
        />
      }
      noResultsComponent={
        <NoDataFound
          message={profile.empty.clinics}
          description={profile.empty.filterHint}
        />
      }
      entity="clinics"
    />
  );
};

export default ClinicsTab;
