import {
  applyBooleanFilter,
  applyMultiMatchSearch,
  applyTermOrTerms,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";

const BRAND_SEARCH_FIELDS = ["name^3", "searchableText"];

const BRAND_SORT_FIELD_MAP = {
  name: "name.keyword",
  published: "published",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

const applyBrandFilters = (opsQuery, filters = {}) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyBooleanFilter(opsQuery, "published", filters.published);
  applyTimestampRangeFilters(opsQuery, filters);
};

export const searchTreatmentBrands = async ({
  opsClient,
  query,
  indexAlias,
}) => {
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: BRAND_SEARCH_FIELDS,
  });

  applyBrandFilters(opsQuery, query?.filters ?? {});

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: BRAND_SORT_FIELD_MAP,
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
