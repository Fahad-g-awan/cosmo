import {
  applyBooleanFilter,
  applyMultiMatchSearch,
  applyNumericRangeFilter,
  applyTermFilter,
  applyTermOrTerms,
  applyTermsFilter,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveNumericRangeFilter,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";
import { addRangeFilter } from "/opt/nodejs/lib/search/opensearch-query.utils.mjs";

const CST_SEARCH_FIELDS = [
  "treatmentName^3",
  "categoryName^2",
  "specialistExperience",
  "searchableText",
];

const CST_SORT_FIELD_MAP = {
  treatmentName: "treatmentName.keyword",
  name: "treatmentName.keyword",
  categoryName: "categoryName.keyword",
  avgPrice: "avgPrice",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  price: "minPrice",
  searchClicks: "searchClicks",
  topSearched: "searchClicks",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  newest: "createdAt",
  oldest: "createdAt",
};

const resolveClinicSpecialistTreatmentSort = ({ sort, fieldMap, defaultSort }) => {
  if (isTopSearchedSort(sort)) {
    const order = sort?.order === "asc" ? "asc" : "desc";
    return [
      { searchClicks: { order, missing: "_last" } },
      { _id: "asc" },
    ];
  }

  return resolveSort({ sort, fieldMap, defaultSort });
};

const isTopSearchedSort = (sort) =>
  sort?.by === "searchClicks" || sort?.by === "topSearched";

const applyPriceFilter = (opsQuery, price) => {
  if (!Array.isArray(price) || price.length === 0) return;

  addRangeFilter(opsQuery, "maxPrice", price[0], null);
  addRangeFilter(opsQuery, "minPrice", null, price[1]);
};

const applyClinicSpecialistTreatmentFilters = (
  opsQuery,
  filters = {},
  { publicBrowse = false } = {},
) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyTermFilter(opsQuery, "clinicId", filters.clinicId);
  applyTermFilter(opsQuery, "specialistId", filters.specialistId);
  applyTermFilter(opsQuery, "clinicTreatmentId", filters.clinicTreatmentId);
  applyTermOrTerms(
    opsQuery,
    "treatmentId",
    filters.treatmentId ?? filters.treatmentIds,
  );
  applyTermOrTerms(
    opsQuery,
    "categoryId",
    filters.categoryId ?? filters.treatmentCategories,
  );
  applyTermsFilter(opsQuery, "brandIds", filters.brands ?? filters.brandIds);
  applyBooleanFilter(opsQuery, "available", filters.available);

  if (publicBrowse) {
    applyTermFilter(opsQuery, "status", "ACTIVE");
    applyTermFilter(opsQuery, "clinicTreatmentStatus", "ACTIVE");
  } else if (filters.status !== undefined) {
    applyTermOrTerms(opsQuery, "status", filters.status);
  } else {
    applyTermFilter(opsQuery, "status", "ACTIVE");
  }

  if (!publicBrowse) {
    if (filters.clinicTreatmentStatus !== undefined) {
      applyTermOrTerms(
        opsQuery,
        "clinicTreatmentStatus",
        filters.clinicTreatmentStatus,
      );
    } else {
      applyTermFilter(opsQuery, "clinicTreatmentStatus", "ACTIVE");
    }
  }

  applyPriceFilter(opsQuery, filters.price);
  applyNumericRangeFilter(opsQuery, "avgPrice", filters.avgPrice);
  applyNumericRangeFilter(
    opsQuery,
    "searchClicks",
    resolveNumericRangeFilter(filters, "searchClicks"),
  );
  applyTimestampRangeFilters(opsQuery, filters);
};

export const searchClinicSpecialistTreatments = async ({
  opsClient,
  query,
  indexAlias,
  publicBrowse = false,
}) => {
  const filters = query?.filters ?? {};
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: CST_SEARCH_FIELDS,
  });

  applyClinicSpecialistTreatmentFilters(opsQuery, filters, { publicBrowse });

  if (isTopSearchedSort(query?.sort) && !filters.allowZeroSearchClicks) {
    opsQuery.bool.filter.push({
      range: { searchClicks: { gte: 1 } },
    });
  }

  const pagination = {
    limit: Math.min(Math.max(query?.pagination?.limit ?? 100, 1), 500),
    nextToken: query?.pagination?.nextToken ?? null,
  };

  const sort = resolveClinicSpecialistTreatmentSort({
    sort: query?.sort,
    fieldMap: CST_SORT_FIELD_MAP,
    defaultSort: [
      { "categoryName.keyword": { order: "asc", unmapped_type: "keyword" } },
      { "treatmentName.keyword": { order: "asc", unmapped_type: "keyword" } },
      { _id: "asc" },
    ],
  });

  return runPaginatedSearch({
    opsClient,
    indexAlias,
    opsQuery,
    sort,
    pagination,
    useLimitPlusOne: true,
  });
};
