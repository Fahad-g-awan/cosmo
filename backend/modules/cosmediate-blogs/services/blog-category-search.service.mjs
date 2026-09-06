import {
  applyBooleanFilter,
  applyMultiMatchSearch,
  applyNumericRangeFilter,
  applyTermFilter,
  applyTermOrTerms,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveNumericRangeFilter,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";

const BLOG_CATEGORY_SEARCH_FIELDS = ["name^3", "searchableText"];

const BLOG_CATEGORY_SORT_FIELD_MAP = {
  name: "name.keyword",
  published: "published",
  blogCount: "blogCount",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

const applyBlogCategoryFilters = (
  opsQuery,
  filters = {},
  { publicOnly = false } = {},
) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyTermFilter(opsQuery, "name.keyword", filters.name);
  applyBooleanFilter(
    opsQuery,
    "published",
    publicOnly ? true : filters.published,
  );
  applyNumericRangeFilter(
    opsQuery,
    "blogCount",
    resolveNumericRangeFilter(filters, "blogCount"),
  );
  applyTimestampRangeFilters(opsQuery, filters);
};

export const searchBlogCategories = async ({
  opsClient,
  query,
  indexAlias,
  publicOnly = false,
}) => {
  const { filters = {}, search = {}, pagination = {} } = query ?? {};

  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: search?.query,
    fields: BLOG_CATEGORY_SEARCH_FIELDS,
  });

  applyBlogCategoryFilters(opsQuery, filters, { publicOnly });

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: BLOG_CATEGORY_SORT_FIELD_MAP,
    defaultSort: [{ createdAt: "desc" }, { _id: "asc" }],
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
