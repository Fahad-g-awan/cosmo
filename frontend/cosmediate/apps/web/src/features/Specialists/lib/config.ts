import type { TreatmentBrand, TreatmentCategory } from "@cosmediate/type-utils";
import type {
  AsyncFilterFetchFn,
  FilterConfig,
} from "@cosmediate/browse-manager";
import type { Specialist } from "@cosmediate/type-utils";
import type { BrowseMessages, ProfileMessages } from "@cosmediate/i18n";

import type { BrowseLayoutConfig } from "@web/layout/BrowseLayout";
import type { DetailLayoutConfig } from "@web/layout/DetailLayout";
import { createDetailBreadcrumbs, resolveProfileTabLabel } from "@web/layout/DetailLayout";
import { PriceData } from "@web/context/FilterOptionsContext";
import {
  buildBrowseSortOptions,
  buildRatingFilterOptions,
} from "@web/lib/i18n/browse-config-helpers";

// Profile config types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TabComponent = any;

interface SpecialistProfileTabs {
  GeneralTab: TabComponent;
  AboutTab: TabComponent;
  PriceTab: TabComponent;
  TreatmentsTab: TabComponent;
  ReviewsTab: TabComponent;
  ContactTab: TabComponent;
  FaqsTab: TabComponent;
}

interface GetSpecialistProfileConfigParams {
  specialist: Specialist | null;
  tabs: SpecialistProfileTabs;
  customHeader?: React.ReactNode;
  setActiveTab?: (tab: string) => void;
  profile: ProfileMessages;
  listingLabel: string;
  homeLabel: string;
}

interface BuildSpecialistsConfigParams {
  treatmentCategories: TreatmentCategory[];
  treatmentBrands: TreatmentBrand[];
  priceData: PriceData | null;
  clinicAsyncFetch?: AsyncFilterFetchFn;
  treatmentAsyncFetch?: AsyncFilterFetchFn;
  browse: BrowseMessages;
}

interface BuildSpecialistBrowseFiltersOptions {
  includeClinicFilter?: boolean;
  includeTreatmentFilter?: boolean;
  includeExperienceFilter?: boolean;
  clinicAsyncFetch?: AsyncFilterFetchFn;
  treatmentAsyncFetch?: AsyncFilterFetchFn;
}

const buildSpecialistBrowseFilters = (
  {
    treatmentCategories,
    treatmentBrands,
    priceData,
    browse,
  }: Omit<
    BuildSpecialistsConfigParams,
    "clinicAsyncFetch" | "treatmentAsyncFetch"
  >,
  {
    includeClinicFilter = false,
    includeTreatmentFilter = false,
    includeExperienceFilter = false,
    clinicAsyncFetch,
    treatmentAsyncFetch,
  }: BuildSpecialistBrowseFiltersOptions = {},
): FilterConfig[] => {
  const { labels, placeholders } = browse.filters;
  const priceMin = priceData ? Math.floor(priceData.minPrice) : 0;
  const priceMax = priceData ? Math.ceil(priceData.maxPrice) : 1000;
  const binCount = priceData?.binCount ?? 30;

  const filters: FilterConfig[] = [
    {
      type: "datetime",
      id: "appointment",
      label: labels.appointment,
      placeholder: browse.search.selectDateAndTime,
      disabled: true,
    },
    {
      type: "location",
      id: "location",
      label: labels.location,
      placeholder: browse.search.location,
      defaultValue: "",
    },
    {
      type: "range-bar",
      id: "price",
      label: labels.budget,
      min: priceMin,
      max: priceMax,
      step: 10,
      binCount,
      defaultValue: [priceMin, priceMax],
      histograms:
        priceData?.histograms?.specialist ?? priceData?.histograms?.clinic,
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
    ...(includeTreatmentFilter && treatmentAsyncFetch
      ? [
          {
            type: "async-select" as const,
            id: "treatmentId",
            label: labels.treatment,
            defaultValue: "",
            placeholder: placeholders.allTreatments,
            asyncFetch: treatmentAsyncFetch,
          },
        ]
      : []),
    ...(includeClinicFilter && clinicAsyncFetch
      ? [
          {
            type: "async-select" as const,
            id: "clinicId",
            label: labels.clinic,
            defaultValue: "",
            placeholder: placeholders.allClinics,
            asyncFetch: clinicAsyncFetch,
          },
        ]
      : []),
    ...(includeExperienceFilter
      ? [
          {
            type: "range-slider" as const,
            id: "totalExperience",
            label: labels.experience,
            min: 0,
            max: 60,
            step: 1,
            defaultValue: [0, 60] as [number, number],
          },
        ]
      : []),
    {
      type: "radio",
      id: "rating",
      label: labels.minimumRating,
      options: buildRatingFilterOptions(browse),
      defaultValue: [],
    },
    {
      type: "range-slider",
      id: "distance",
      label: labels.distance,
      min: 0,
      max: 1000,
      step: 5,
      defaultValue: [0, 1000],
    },
  ];

  return filters;
};

const buildSpecialistBrowsePreferences = (
  browse: BrowseMessages,
): BrowseLayoutConfig["preferences"] => ({
  scope: "specialists",
  pageType: "specialists",
  sortOptions: buildBrowseSortOptions(browse, { includeTopSearched: true }),
  viewModes: ["grid", "list"],
  itemsPerPage: 12,
  syncToUrl: true,
});

export const buildSpecialistsConfig = ({
  treatmentCategories,
  treatmentBrands,
  priceData,
  clinicAsyncFetch,
  treatmentAsyncFetch,
  browse,
}: BuildSpecialistsConfigParams): BrowseLayoutConfig => {
  const filters = buildSpecialistBrowseFilters(
    {
      treatmentCategories,
      treatmentBrands,
      priceData,
      browse,
    },
    {
      includeClinicFilter: true,
      includeTreatmentFilter: true,
      includeExperienceFilter: true,
      clinicAsyncFetch,
      treatmentAsyncFetch,
    },
  );

  return {
    filters: {
      scope: "specialists",
      pageType: "specialists",
      searchField: {
        id: "query",
        type: "text",
        label: browse.search.label,
        placeholder: browse.search.specialists,
      },
      filters,
      syncToUrl: true,
      enableGeolocation: true,
    },
    preferences: buildSpecialistBrowsePreferences(browse),
  };
};

export const buildClinicDoctorsTabConfig = ({
  treatmentCategories,
  treatmentBrands,
  priceData,
  treatmentAsyncFetch,
  browse,
}: BuildSpecialistsConfigParams): BrowseLayoutConfig => {
  const filters = buildSpecialistBrowseFilters(
    {
      treatmentCategories,
      treatmentBrands,
      priceData,
      browse,
    },
    {
      includeTreatmentFilter: Boolean(treatmentAsyncFetch),
      includeExperienceFilter: true,
      treatmentAsyncFetch,
    },
  );

  return {
    filters: {
      scope: "specialists",
      pageType: "specialists",
      searchField: {
        id: "query",
        type: "text",
        label: browse.search.label,
        placeholder: browse.search.specialists,
      },
      filters,
      syncToUrl: true,
      enableGeolocation: true,
    },
    preferences: buildSpecialistBrowsePreferences(browse),
  };
};

export const getSpecialistProfileConfig = ({
  specialist,
  tabs,
  customHeader,
  setActiveTab,
  profile,
  listingLabel,
  homeLabel,
}: GetSpecialistProfileConfigParams): DetailLayoutConfig<Specialist> => ({
  breadcrumbs: (tab: string, entity: Specialist | null) =>
    createDetailBreadcrumbs(
      "/specialists",
      listingLabel,
      entity?.fullName || "",
      `/specialists/${entity?.id}`,
      tab,
      {
        home: homeLabel,
        tabLabel: (tabId) => resolveProfileTabLabel(profile, tabId),
      },
    ),
  header: customHeader
    ? { type: "custom" as const, content: customHeader }
    : (entity: Specialist | null) => ({
        type: "entity" as const,
        entity: {
          name: entity?.fullName || "",
          image: entity?.image || "",
          rating: entity?.avgPrice?.toString() || "",
          reviewCount: entity?.reviewCount?.toString() || "",
          address: entity?.completeAddress || "",
        },
        entityType: "specialist" as const,
      }),
  tabs: [
    {
      id: "general",
      label: profile.tabs.general,
      component: tabs.GeneralTab,
      props: { specialist, setActiveTab },
    },
    {
      id: "about",
      label: profile.tabs.about,
      component: tabs.AboutTab,
      props: { specialist, setActiveTab },
    },
    {
      id: "price",
      label: profile.tabs.price,
      component: tabs.PriceTab,
      props: { specialist, setActiveTab },
    },
    {
      id: "treatments",
      label: profile.tabs.treatments,
      component: tabs.TreatmentsTab,
      props: { specialist, setActiveTab },
    },
    {
      id: "reviews",
      label: profile.tabs.reviews,
      component: tabs.ReviewsTab,
      props: { specialist, setActiveTab },
    },
    {
      id: "faqs",
      label: profile.tabs.faqs,
      component: tabs.FaqsTab,
      props: { specialist, setActiveTab },
    },
    {
      id: "contact",
      label: profile.tabs.contact,
      component: tabs.ContactTab,
      props: { specialist, setActiveTab },
    },
  ],
  defaultTab: "about",
});
