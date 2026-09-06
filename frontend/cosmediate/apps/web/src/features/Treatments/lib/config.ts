import type { ReactNode } from "react";

import type { TreatmentBrand, TreatmentCategory } from "@cosmediate/type-utils";
import type { FilterConfig } from "@cosmediate/browse-manager";
import type { Treatment } from "@cosmediate/type-utils";
import type { BrowseMessages, ProfileMessages } from "@cosmediate/i18n";

import type { BrowseLayoutConfig } from "@web/layout/BrowseLayout";
import type { DetailLayoutConfig } from "@web/layout/DetailLayout";
import { createDetailBreadcrumbs, resolveProfileTabLabel } from "@web/layout/DetailLayout";
import { PriceData } from "@web/context/FilterOptionsContext";
import { buildBrowseSortOptions } from "@web/lib/i18n/browse-config-helpers";

// Profile config types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TabComponent = any;

interface TreatmentProfileTabs {
  AboutTab: TabComponent;
  ClinicsTab: TabComponent;
  FaqsTab: TabComponent;
}

interface GetTreatmentProfileConfigParams {
  treatment: Treatment | null;
  tabs: TreatmentProfileTabs;
  customHeader?: ReactNode;
  setActiveTab?: (tab: string) => void;
  profile: ProfileMessages;
  listingLabel: string;
  homeLabel: string;
}

interface BuildTreatmentsConfigParams {
  treatmentCategories: TreatmentCategory[];
  treatmentBrands: TreatmentBrand[];
  priceData: PriceData | null;
  browse: BrowseMessages;
}

const buildTreatmentBrowseFilters = ({
  treatmentCategories,
  treatmentBrands,
  priceData,
  browse,
}: BuildTreatmentsConfigParams): FilterConfig[] => {
  const { labels } = browse.filters;
  const priceMin = priceData ? Math.floor(priceData.minPrice) : 0;
  const priceMax = priceData ? Math.ceil(priceData.maxPrice) : 1000;
  const binCount = priceData?.binCount ?? 30;

  return [
    {
      type: "range-bar",
      id: "price",
      label: labels.budget,
      min: priceMin,
      max: priceMax,
      step: 10,
      binCount,
      defaultValue: [priceMin, priceMax],
      histograms: priceData?.histograms?.treatment,
    },
    {
      type: "checkbox",
      id: "treatmentCategories",
      label: labels.treatmentCategories,
      options: treatmentCategories.map((cat) => ({
        label: cat.name,
        value: cat.id,
      })),
      defaultValue: [],
    },
    {
      type: "checkbox",
      id: "brands",
      label: labels.brands,
      options: treatmentBrands.map((brand) => ({
        label: brand.name,
        value: brand.id,
      })),
      defaultValue: [],
    },
  ];
};

const buildTreatmentBrowsePreferences = (
  browse: BrowseMessages,
): BrowseLayoutConfig["preferences"] => ({
  scope: "treatments",
  pageType: "treatments",
  sortOptions: buildBrowseSortOptions(browse, { includeTopSearched: true }),
  viewModes: ["grid", "list"],
  itemsPerPage: 12,
  syncToUrl: true,
});

const buildTreatmentBrowseLayout = (
  params: BuildTreatmentsConfigParams,
): BrowseLayoutConfig => {
  const filters = buildTreatmentBrowseFilters(params);
  const { browse } = params;

  return {
    filters: {
      scope: "treatments",
      pageType: "treatments",
      searchField: {
        id: "query",
        type: "text",
        label: browse.search.label,
        placeholder: browse.search.treatments,
      },
      filters,
      syncToUrl: true,
    },
    preferences: buildTreatmentBrowsePreferences(browse),
  };
};

export const buildTreatmentsConfig = (
  params: BuildTreatmentsConfigParams,
): BrowseLayoutConfig => buildTreatmentBrowseLayout(params);

export const buildClinicTreatmentsTabConfig = (
  params: BuildTreatmentsConfigParams,
): BrowseLayoutConfig => buildTreatmentBrowseLayout(params);

export const getTreatmentProfileConfig = ({
  treatment,
  tabs,
  customHeader,
  setActiveTab,
  profile,
  listingLabel,
  homeLabel,
}: GetTreatmentProfileConfigParams): DetailLayoutConfig<Treatment> => ({
  breadcrumbs: (tab: string, entity: Treatment | null) =>
    createDetailBreadcrumbs(
      "/treatments",
      listingLabel,
      entity?.name || "",
      `/treatments/${entity?.id}`,
      tab,
      {
        home: homeLabel,
        tabLabel: (tabId) => resolveProfileTabLabel(profile, tabId),
      },
    ),
  header: customHeader
    ? { type: "custom" as const, content: customHeader }
    : (entity: Treatment | null) => ({
        type: "entity" as const,
        entity: {
          name: entity?.name || "",
          image: entity?.image || "",
        },
        entityType: "treatment" as const,
      }),
  tabs: [
    {
      id: "about",
      label: profile.tabs.about,
      component: tabs.AboutTab,
      props: { treatment, setActiveTab },
    },
    {
      id: "clinics",
      label: profile.tabs.clinics,
      component: tabs.ClinicsTab,
      props: { treatment, setActiveTab },
    },
    {
      id: "faqs",
      label: profile.tabs.faqs,
      component: tabs.FaqsTab,
      props: { treatment, setActiveTab },
    },
  ],
  defaultTab: "about",
});
