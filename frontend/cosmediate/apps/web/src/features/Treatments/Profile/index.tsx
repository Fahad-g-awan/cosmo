"use client";

import React, { lazy, useMemo } from "react";

import {
  FiltersProvider,
  PaginationProvider,
  PreferencesProvider,
} from "@cosmediate/browse-manager";
import { NoDataFound, ProfilePageLoader } from "@cosmediate/ui";
import { useTranslations } from "@cosmediate/i18n/client";
import type { Treatment } from "@cosmediate/type-utils";
import { getTreatmentApi } from "@cosmediate/api";
import { cn } from "@cosmediate/ui/lib/utils";

import { SearchHeader } from "@web/layout/BrowseLayout/components/SearchHeader";
import { FilterOptionsProvider } from "@web/context/FilterOptionsContext";
import { DetailLayout, useDetailData } from "@web/layout/DetailLayout";
import { getTreatmentProfileConfig } from "../lib/config";

import AboutTab from "../components/profile/tabs/AboutTab";
import FaqsTab from "../components/profile/tabs/FaqsTab";
import SubHeader from "@web/layout/SubHeader";

const ClinicsTab = lazy(() => import("../components/profile/tabs/ClinicsTab"));

interface TreatmentsProfileProps {
  initialTreatment?: Treatment | null;
}

const TreatmentsProfile = ({ initialTreatment }: TreatmentsProfileProps) => {
  const profile = useTranslations("profile");
  const nav = useTranslations("nav");
  const common = useTranslations("common");
  const {
    entity: treatment,
    isLoading,
    activeTab,
    setActiveTab,
  } = useDetailData<Treatment>({
    fetchFn: getTreatmentApi as (params: {
      id: string;
      from: string;
    }) => Promise<{ success: boolean; item?: Treatment }>,
    defaultTab: "about",
    entityName: "treatment",
    initialEntity: initialTreatment,
  });

  const customHeader = useMemo(
    () => <SubHeader.Title>{treatment?.name || ""}</SubHeader.Title>,
    [treatment],
  );

  const config = useMemo(
    () =>
      getTreatmentProfileConfig({
        treatment,
        tabs: { AboutTab, ClinicsTab, FaqsTab },
        customHeader,
        setActiveTab,
        profile,
        listingLabel: nav.treatments,
        homeLabel: nav.home,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [treatment, customHeader, profile, nav.treatments, nav.home],
  );

  return (
    <DetailLayout
      entity={treatment}
      isLoading={isLoading}
      config={config}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      SearchHeader={
        <div
          className={cn(
            "w-full",
            isLoading && "pointer-events-none opacity-50",
          )}
          onClick={() => setActiveTab("clinics")}
        >
          <SearchHeader />
        </div>
      }
      emptyComponent={
        <NoDataFound
          message={profile.empty.treatment}
          description={common.pleaseTryAgain}
          className="my-10"
        />
      }
      loadingComponent={<ProfilePageLoader />}
    />
  );
};

const TreatmentsProfileWithProviders = ({
  initialTreatment,
}: TreatmentsProfileProps) => {
  return (
    <FiltersProvider>
      <PreferencesProvider>
        <PaginationProvider>
          <FilterOptionsProvider>
            <TreatmentsProfile initialTreatment={initialTreatment} />
          </FilterOptionsProvider>
        </PaginationProvider>
      </PreferencesProvider>
    </FiltersProvider>
  );
};

export default TreatmentsProfileWithProviders;
