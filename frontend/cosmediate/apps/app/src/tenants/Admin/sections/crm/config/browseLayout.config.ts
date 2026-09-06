import { BrowseLayoutConfig } from "@app/layout/BrowseLayout/types";
import { FilterConfig } from "@cosmediate/browse-manager";

export const buildCRMLeadsBrowseLayoutConfig = (): BrowseLayoutConfig => {
  const filters: FilterConfig[] = [
    {
      type: "range-date",
      id: "createdAt",
      label: "Create Date",
      defaultValue: [null, null],
    },
    {
      type: "select",
      id: "status",
      label: "Status",
      options: [
        { label: "New", value: "NEW" },
        { label: "Pending Review", value: "PENDING_REVIEW" },
        { label: "Contacted", value: "CONTACTED" },
        { label: "Qualified", value: "QUALIFIED" },
        { label: "Converted", value: "CONVERTED" },
        { label: "Archived", value: "ARCHIVED" },
        { label: "Rejected", value: "REJECTED" },
      ],
      defaultValue: [],
    },
    {
      type: "select",
      id: "type",
      label: "Type",
      options: [
        { label: "Subscription", value: "SUBSCRIPTION" },
        { label: "Contact", value: "CONTACT" },
        { label: "Doctor", value: "DOCTOR" },
        { label: "Clinic", value: "CLINIC" },
      ],
      defaultValue: [],
    },
    {
      type: "select",
      id: "source",
      label: "Source",
      options: [
        { label: "Contact Us Page", value: "CONTACT_US_PAGE" },
        { label: "Subscription", value: "SUBSCRIPTION" },
        { label: "Register Doctor Form", value: "REGISTER_DOCTOR_FORM" },
        { label: "Register Clinic Form", value: "REGISTER_CLINIC_FORM" },
        { label: "Facebook Ad", value: "FACEBOOK_AD" },
        { label: "Google Ad", value: "GOOGLE_AD" },
        { label: "Organic Search", value: "ORGANIC_SEARCH" },
        { label: "Partner Referral", value: "PARTNER_REFERRAL" },
        { label: "Newsletter Campaign", value: "NEWSLETTER_CAMPAIGN" },
      ],
      defaultValue: [],
    },
  ];

  const browseConfig = {
    filters: {
      scope: "admin-crm-leads",
      pageType: "admin-crm-leads",
      searchField: {
        id: "search",
        type: "text" as const,
        label: "Search",
        placeholder: "Search data...",
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope: "admin-crm-leads",
      pageType: "admin-crm-leads",
      viewModes: ["table", "grid"] as ("grid" | "list" | "table")[],
      forceGridViewBelowTab: true,
      itemsPerPage: 10,
      tableViewConfig: {
        defaultPageSize: 10,
        enableColumnPinning: true,
        enableColumnResize: true,
        persistSettings: true,
      },
      sortOptions: [
        {
          label: "Name (A-Z)",
          value: "name-asc",
          sortBy: "fullName",
          order: "asc" as const,
        },
        {
          label: "Name (Z-A)",
          value: "name-desc",
          sortBy: "fullName",
          order: "desc" as const,
        },
        {
          label: "Newest",
          value: "createdAt-desc",
          sortBy: "createdAt",
          order: "desc" as const,
        },
        {
          label: "Oldest",
          value: "createdAt-asc",
          sortBy: "createdAt",
          order: "asc" as const,
        },
      ],
      syncToUrl: true,
    },
    showItemCount: true,
  };

  return browseConfig;
};
