"use client";

import React, { lazy, useMemo } from "react";

import {
  FiltersProvider,
  PaginationProvider,
  PreferencesProvider,
} from "@cosmediate/browse-manager";
import { NoDataFound, ProfilePageLoader } from "@cosmediate/ui";
import { useTranslations } from "@cosmediate/i18n/client";
import { Specialist } from "@cosmediate/type-utils";
import { getSpecialistApi } from "@cosmediate/api";
import { cn } from "@cosmediate/ui/lib/utils";

import { SpecialistProfileBrowseBridge } from "./components/SpecialistProfileBrowseBridge";
import { SearchHeader } from "@web/layout/BrowseLayout/components/SearchHeader";
import { FilterOptionsProvider } from "@web/context/FilterOptionsContext";
import { DetailLayout, useDetailData } from "@web/layout/DetailLayout";
import { getSpecialistProfileConfig } from "../lib/config";

import ContactTab from "../components/profile/tabs/ContactTab";
import AboutTab from "../components/profile/tabs/AboutTab";
import FaqsTab from "../components/profile/tabs/FaqsTab";

const GeneralTab = lazy(() => import("../components/profile/tabs/GeneralTab"));
const PriceTab = lazy(() => import("../components/profile/tabs/PriceTab"));
const TreatmentsTab = lazy(
  () => import("../components/profile/tabs/TreatmentTab"),
);
const ReviewsTab = lazy(() => import("../components/profile/tabs/ReviewsTab"));

const BROWSE_TABS = new Set(["treatments"]);

interface SpecialistsProfileProps {
  initialSpecialist?: Specialist | null;
}

const SpecialistsProfile = ({ initialSpecialist }: SpecialistsProfileProps) => {
  const profile = useTranslations("profile");
  const nav = useTranslations("nav");
  const common = useTranslations("common");
  const {
    entity: specialist,
    isLoading,
    activeTab,
    setActiveTab,
  } = useDetailData<Specialist>({
    fetchFn: getSpecialistApi as (params: {
      id: string;
      from: string;
    }) => Promise<{ success: boolean; item?: Specialist }>,
    defaultTab: "general",
    entityName: "specialist",
    initialEntity: initialSpecialist,
  });

  const isBrowseTab = BROWSE_TABS.has(activeTab);
  const searchDisabled = !isBrowseTab || isLoading;

  const config = useMemo(
    () =>
      getSpecialistProfileConfig({
        specialist,
        tabs: {
          AboutTab,
          GeneralTab,
          PriceTab,
          TreatmentsTab,
          ReviewsTab,
          FaqsTab,
          ContactTab,
        },
        setActiveTab,
        profile,
        listingLabel: nav.specialists,
        homeLabel: nav.home,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [specialist, profile, nav.specialists, nav.home],
  );

  return (
    <>
      <SpecialistProfileBrowseBridge
        specialistId={specialist?.id}
        activeTab={activeTab}
      />
      <DetailLayout
        entity={specialist}
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
            message={profile.empty.specialist}
            description={common.pleaseTryAgain}
            className="my-10"
          />
        }
        loadingComponent={<ProfilePageLoader />}
      />
    </>
  );
};

const SpecialistsProfileWithProviders = ({
  initialSpecialist,
}: SpecialistsProfileProps) => {
  return (
    <FiltersProvider>
      <PreferencesProvider>
        <PaginationProvider>
          <FilterOptionsProvider>
            <SpecialistsProfile initialSpecialist={initialSpecialist} />
          </FilterOptionsProvider>
        </PaginationProvider>
      </PreferencesProvider>
    </FiltersProvider>
  );
};

export default SpecialistsProfileWithProviders;
