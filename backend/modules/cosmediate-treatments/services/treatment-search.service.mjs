import {
  applyBooleanFilter,
  applyMultiMatchSearch,
  applyNumericRangeFilter,
  applyTermOrTerms,
  applyTermsFilter,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveNumericRangeFilter,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";
import { addRangeFilter } from "/opt/nodejs/lib/search/opensearch-query.utils.mjs";

const TREATMENT_SEARCH_FIELDS = ["name^3", "searchableText", "categoryName^2"];

const TREATMENT_SORT_FIELD_MAP = {
  name: "name.keyword",
  categoryName: "categoryName.keyword",
  published: "published",
  searchClicks: "searchClicks",
  clinicCount: "clinicCount",
  specialistCount: "specialistCount",
  avgPrice: "avgPrice",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  createdAt: "createdAt",
  newest: "createdAt",
  oldest: "createdAt",
  topSearched: "searchClicks",
  updatedAt: "updatedAt",
};

const resolveTreatmentListSort = ({ sort, fieldMap, defaultSort }) => {
  if (isTopSearchedSort(sort)) {
    const order = sort?.order === "asc" ? "asc" : "desc";
    return [
      { searchClicks: { order, missing: "_last" } },
      { _id: "asc" },
    ];
  }

  return resolveSort({ sort, fieldMap, defaultSort });
};

export const isTopSearchedSort = (sort) =>
  sort?.by === "searchClicks" || sort?.by === "topSearched";

const applyTreatmentFilters = (opsQuery, filters = {}) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyTermOrTerms(
    opsQuery,
    "categoryId",
    filters.categoryId ?? filters.treatmentCategories,
  );
  applyTermsFilter(opsQuery, "brandIds", filters.brands ?? filters.brandIds);
  applyBooleanFilter(opsQuery, "published", filters.published);
  if (Array.isArray(filters.price) && filters.price.length > 0) {
    addRangeFilter(opsQuery, "maxPrice", filters.price[0], null);
    addRangeFilter(opsQuery, "minPrice", null, filters.price[1]);
  }
  applyNumericRangeFilter(opsQuery, "avgPrice", filters.avgPrice);
  applyNumericRangeFilter(
    opsQuery,
    "specialistCount",
    resolveNumericRangeFilter(filters, "specialistCount"),
  );
  applyNumericRangeFilter(
    opsQuery,
    "clinicCount",
    resolveNumericRangeFilter(filters, "clinicCount"),
  );
  applyNumericRangeFilter(
    opsQuery,
    "searchClicks",
    resolveNumericRangeFilter(filters, "searchClicks"),
  );
  applyTimestampRangeFilters(opsQuery, filters);
};

export const searchTreatments = async ({
  opsClient,
  query,
  indexAlias,
}) => {
  const filters = query?.filters ?? {};
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: TREATMENT_SEARCH_FIELDS,
  });

  applyTreatmentFilters(opsQuery, filters);

  if (isTopSearchedSort(query?.sort) && !filters.allowZeroSearchClicks) {
    opsQuery.bool.filter.push({
      range: { searchClicks: { gte: 1 } },
    });
  }

  const sort = resolveTreatmentListSort({
    sort: query?.sort,
    fieldMap: TREATMENT_SORT_FIELD_MAP,
    defaultSort: [{ createdAt: "desc" }, { _id: "asc" }],
  });

  return runPaginatedSearch({
    opsClient,
    indexAlias,
    opsQuery,
    sort,
    pagination: query?.pagination,
    useLimitPlusOne: true,
  });
};
