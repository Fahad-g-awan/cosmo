import {
  applyBooleanFilter,
  applyMultiMatchSearch,
  applyNumericRangeFilter,
  applyTermOrTerms,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveNumericRangeFilter,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";

const CATEGORY_SEARCH_FIELDS = ["name^3", "searchableText"];

const CATEGORY_SORT_FIELD_MAP = {
  name: "name.keyword",
  treatmentCount: "treatmentCount",
  published: "published",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

const applyCategoryFilters = (opsQuery, filters = {}) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyBooleanFilter(opsQuery, "published", filters.published);
  applyNumericRangeFilter(
    opsQuery,
    "treatmentCount",
    resolveNumericRangeFilter(filters, "treatmentCount"),
  );
  applyTimestampRangeFilters(opsQuery, filters);
};

export const searchTreatmentCategories = async ({
  opsClient,
  query,
  indexAlias,
}) => {
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: CATEGORY_SEARCH_FIELDS,
  });

  applyCategoryFilters(opsQuery, query?.filters ?? {});

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: CATEGORY_SORT_FIELD_MAP,
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
