"use client";

import React, { lazy, useMemo } from "react";

import {
  FiltersProvider,
  PaginationProvider,
  PreferencesProvider,
} from "@cosmediate/browse-manager";
import { NoDataFound, ProfilePageLoader } from "@cosmediate/ui";
import { useTranslations } from "@cosmediate/i18n/client";
import { Clinic } from "@cosmediate/type-utils";
import { getClinicApi } from "@cosmediate/api";
import { cn } from "@cosmediate/ui/lib/utils";

import { ClinicProfileBrowseBridge } from "./components/ClinicProfileBrowseBridge";
import { SearchHeader } from "@web/layout/BrowseLayout/components/SearchHeader";
import { FilterOptionsProvider } from "@web/context/FilterOptionsContext";
import { DetailLayout, useDetailData } from "@web/layout/DetailLayout";
import { getClinicProfileConfig } from "../lib/config";

import ContactTab from "../components/profile/tabs/ContactTab";
import AboutTab from "../components/profile/tabs/AboutTab";
import FaqsTab from "../components/profile/tabs/FaqsTab";

const GeneralTab = lazy(() => import("../components/profile/tabs/GeneralTab"));
const TreatmentsTab = lazy(
  () => import("../components/profile/tabs/TreatmentTab"),
);
const PriceTab = lazy(() => import("../components/profile/tabs/PriceTab"));
const DoctorsTab = lazy(() => import("../components/profile/tabs/DoctorsTab"));
const ReviewsTab = lazy(() => import("../components/profile/tabs/ReviewsTab"));

const BROWSE_TABS = new Set(["treatments", "doctors"]);

interface ClinicsProfileProps {
  initialClinic?: Clinic | null;
}

const ClinicsProfile = ({ initialClinic }: ClinicsProfileProps) => {
  const profile = useTranslations("profile");
  const nav = useTranslations("nav");
  const common = useTranslations("common");
  const {
    entity: clinic,
    isLoading,
    activeTab,
    setActiveTab,
  } = useDetailData<Clinic>({
    fetchFn: getClinicApi as (params: {
      id: string;
      from: string;
    }) => Promise<{ success: boolean; item?: Clinic }>,
    defaultTab: "general",
    entityName: "clinic",
    initialEntity: initialClinic,
  });

  const isBrowseTab = BROWSE_TABS.has(activeTab);
  const searchDisabled = !isBrowseTab || isLoading;

  const config = useMemo(
    () =>
      getClinicProfileConfig({
        clinic,
        tabs: {
          GeneralTab,
          AboutTab,
          TreatmentsTab,
          PriceTab,
          DoctorsTab,
          ReviewsTab,
          FaqsTab,
          ContactTab,
        },
        setActiveTab,
        profile,
        listingLabel: nav.clinics,
        homeLabel: nav.home,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clinic, profile, nav.clinics, nav.home],
  );

  return (
    <>
      <ClinicProfileBrowseBridge clinicId={clinic?.id} activeTab={activeTab} />
      <DetailLayout
        entity={clinic}
        isLoading={isLoading}
        config={config}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        SearchHeader={
          <div
            className={cn(
              "w-full",
              searchDisabled && "pointer-events-none opacity-50",
            )}
          >
            <SearchHeader disabled={searchDisabled} />
          </div>
        }
        emptyComponent={
          <NoDataFound
            message={profile.empty.clinic}
            description={common.pleaseTryAgain}
            className="my-10"
          />
        }
        loadingComponent={<ProfilePageLoader />}
      />
    </>
  );
};

const ClinicsProfileWithProviders = ({
  initialClinic,
}: ClinicsProfileProps) => {
  return (
    <FiltersProvider>
      <PreferencesProvider>
        <PaginationProvider>
          <FilterOptionsProvider>
            <ClinicsProfile initialClinic={initialClinic} />
          </FilterOptionsProvider>
        </PaginationProvider>
      </PreferencesProvider>
    </FiltersProvider>
  );
};

export default ClinicsProfileWithProviders;
