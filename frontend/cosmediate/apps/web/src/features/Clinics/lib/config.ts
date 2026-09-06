import type {
  ClinicCategory,
  TreatmentBrand,
  TreatmentCategory,
} from "@cosmediate/type-utils";
import type {
  AsyncFilterFetchFn,
  FilterConfig,
} from "@cosmediate/browse-manager";
import type { Clinic } from "@cosmediate/type-utils";
import type { BrowseMessages, ProfileMessages } from "@cosmediate/i18n";
import type { BrowseLayoutConfig } from "@web/layout/BrowseLayout";
import {
  createDetailBreadcrumbs,
  DetailLayoutConfig,
  resolveProfileTabLabel,
} from "@web/layout/DetailLayout";
import { PriceData } from "@web/context/FilterOptionsContext";
import {
  buildBrowseSortOptions,
  buildRatingFilterOptions,
} from "@web/lib/i18n/browse-config-helpers";

// Profile config types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TabComponent = any;

interface ClinicProfileTabs {
  GeneralTab: TabComponent;
  TreatmentsTab: TabComponent;
  AboutTab: TabComponent;
  PriceTab: TabComponent;
  DoctorsTab: TabComponent;
  ReviewsTab: TabComponent;
  FaqsTab: TabComponent;
  ContactTab: TabComponent;
}

interface GetClinicProfileConfigParams {
  clinic: Clinic | null;
  tabs: ClinicProfileTabs;
  customHeader?: React.ReactNode;
  setActiveTab: (tab: string) => void;
  profile: ProfileMessages;
  listingLabel: string;
  homeLabel: string;
}

interface BuildClinicsConfigParams {
  clinicCategories: ClinicCategory[];
  treatmentCategories: TreatmentCategory[];
  treatmentBrands: TreatmentBrand[];
  priceData: PriceData | null;
  treatmentAsyncFetch?: AsyncFilterFetchFn;
  browse: BrowseMessages;
}

interface BuildTreatmentClinicsTabConfigParams {
  clinicCategories: ClinicCategory[];
  treatmentCategories: TreatmentCategory[];
  treatmentBrands: TreatmentBrand[];
  priceData: PriceData | null;
  browse: BrowseMessages;
}

interface BuildClinicBrowseFiltersOptions {
  includePublicEntityFilters?: boolean;
  treatmentAsyncFetch?: AsyncFilterFetchFn;
}

const buildClinicBrowseFilters = (
  {
    clinicCategories,
    treatmentCategories,
    treatmentBrands,
    priceData,
    browse,
  }: Omit<BuildClinicsConfigParams, "treatmentAsyncFetch">,
  {
    includePublicEntityFilters = false,
    treatmentAsyncFetch,
  }: BuildClinicBrowseFiltersOptions = {},
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
      histograms: priceData?.histograms?.clinic,
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
      id: "clinicCategories",
      label: labels.clinicCategories,
      options: clinicCategories.map((cat) => ({
        label: cat.name,
        value: cat.id,
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
    ...(includePublicEntityFilters && treatmentAsyncFetch
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
    ...(includePublicEntityFilters
      ? [
          {
            type: "range-slider" as const,
            id: "clinicAge",
            label: labels.clinicAge,
            min: 0,
            max: 100,
            step: 1,
            defaultValue: [0, 100] as [number, number],
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

const buildClinicBrowsePreferences = (
  browse: BrowseMessages,
): BrowseLayoutConfig["preferences"] => ({
  scope: "clinics",
  pageType: "clinics",
  sortOptions: buildBrowseSortOptions(browse),
  viewModes: ["grid", "list"],
  itemsPerPage: 12,
  syncToUrl: true,
});

export const buildClinicsConfig = ({
  clinicCategories,
  treatmentCategories,
  treatmentBrands,
  priceData,
  treatmentAsyncFetch,
  browse,
}: BuildClinicsConfigParams): BrowseLayoutConfig => {
  const filters = buildClinicBrowseFilters(
    {
      clinicCategories,
      treatmentCategories,
      treatmentBrands,
      priceData,
      browse,
    },
    {
      includePublicEntityFilters: true,
      treatmentAsyncFetch,
    },
  );

  return {
    filters: {
      scope: "clinics",
      pageType: "clinics",
      searchField: {
        id: "query",
        type: "text",
        label: browse.search.label,
        placeholder: browse.search.clinics,
      },
      filters,
      syncToUrl: true,
      enableGeolocation: true,
    },
    preferences: buildClinicBrowsePreferences(browse),
  };
};

export const buildTreatmentClinicsTabConfig = ({
  clinicCategories,
  treatmentCategories,
  treatmentBrands,
  priceData,
  browse,
}: BuildTreatmentClinicsTabConfigParams): BrowseLayoutConfig => {
  const filters = buildClinicBrowseFilters({
    clinicCategories,
    treatmentCategories,
    treatmentBrands,
    priceData,
    browse,
  });

  return {
    filters: {
      scope: "clinics",
      pageType: "clinics",
      searchField: {
        id: "query",
        type: "text",
        label: browse.search.label,
        placeholder: browse.search.clinics,
      },
      filters,
      syncToUrl: true,
      enableGeolocation: true,
    },
    preferences: buildClinicBrowsePreferences(browse),
  };
};

export const getClinicProfileConfig = ({
  clinic,
  tabs,
  customHeader,
  setActiveTab,
  profile,
  listingLabel,
  homeLabel,
}: GetClinicProfileConfigParams): DetailLayoutConfig<Clinic> => ({
  breadcrumbs: (tab: string, entity: Clinic | null) =>
    createDetailBreadcrumbs(
      "/clinics",
      listingLabel,
      entity?.name || "",
      `/clinics/${entity?.id}`,
      tab,
      {
        home: homeLabel,
        tabLabel: (tabId) => resolveProfileTabLabel(profile, tabId),
      },
    ),
  header: customHeader
    ? { type: "custom" as const, content: customHeader }
    : (entity: Clinic | null) => ({
        type: "entity" as const,
        entity: {
          name: entity?.name || "",
          image: entity?.logo || "",
          rating: entity?.avgRating?.toString() || "",
          reviewCount: entity?.reviewCount?.toString() || "",
          address: entity?.completeAddress || "",
        },
        entityType: "clinic" as const,
      }),
  tabs: [
    {
      id: "general",
      label: profile.tabs.general,
      component: tabs.GeneralTab,
      props: { clinic, setActiveTab },
    },
    {
      id: "about",
      label: profile.tabs.about,
      component: tabs.AboutTab,
      props: { clinic, setActiveTab },
    },
    {
      id: "treatments",
      label: profile.tabs.treatments,
      component: tabs.TreatmentsTab,
      props: { clinic, setActiveTab },
    },
    {
      id: "price",
      label: profile.tabs.price,
      component: tabs.PriceTab,
      props: { clinic, setActiveTab },
    },
    {
      id: "doctors",
      label: profile.tabs.doctors,
      component: tabs.DoctorsTab,
      props: { clinic, setActiveTab },
    },
    {
      id: "reviews",
      label: profile.tabs.reviews,
      component: tabs.ReviewsTab,
      props: { clinic, setActiveTab },
    },
    {
      id: "faqs",
      label: profile.tabs.faqs,
      component: tabs.FaqsTab,
      props: { clinic, setActiveTab },
    },
    {
      id: "contact",
      label: profile.tabs.contact,
      component: tabs.ContactTab,
      props: { clinic, setActiveTab },
    },
  ],
  defaultTab: "general",
});
