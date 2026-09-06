import {
  addRangeFilter,
  normalizeDate,
} from "/opt/nodejs/lib/search/opensearch-query.utils.mjs";
import {
  applyMultiMatchSearch,
  applyTermFilter,
  applyTermOrTerms,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";
import { BLOG_STATUS } from "/opt/nodejs/constants/domain/blog.constants.mjs";

const BLOG_SEARCH_FIELDS = [
  "title^3",
  "overview^2",
  "tags",
  "categoryName^2",
  "authorName",
  "authorEmail",
  "searchableText",
];

const BLOG_SORT_FIELD_MAP = {
  title: "title.keyword",
  name: "title.keyword",
  newest: "publishedAt",
  oldest: "publishedAt",
  status: "status",
  publishedAt: "publishedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  searchClicks: "searchClicks",
  topSearched: "searchClicks",
  authorName: "authorName.keyword",
  categoryName: "categoryName.keyword",
};

const applyPublishedAtRangeFilter = (opsQuery, filters = {}) => {
  const publishedFrom = normalizeDate({
    input: filters?.publishedAt?.[0] ?? null,
    isStartOfDay: true,
    isEndOfDay: false,
  });
  const publishedTo = normalizeDate({
    input: filters?.publishedAt?.[1] ?? null,
    isStartOfDay: false,
    isEndOfDay: true,
  });

  addRangeFilter(opsQuery, "publishedAt", publishedFrom, publishedTo);
};

const applyRelatedMatchFilter = (opsQuery, relatedMatch) => {
  if (!relatedMatch) return;

  const should = [];

  if (relatedMatch.categoryId) {
    should.push({ term: { categoryId: relatedMatch.categoryId } });
  }

  if (Array.isArray(relatedMatch.tags) && relatedMatch.tags.length > 0) {
    should.push({ terms: { tags: relatedMatch.tags } });
  }

  if (should.length === 0) return;

  opsQuery.bool.filter.push({
    bool: {
      should,
      minimum_should_match: 1,
    },
  });
};

const applyBlogFilters = (
  opsQuery,
  filters = {},
  { publicOnly = false, tagsAsShould = false, relatedMatch = null } = {},
) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyTermOrTerms(
    opsQuery,
    "status",
    publicOnly ? BLOG_STATUS.PUBLISHED : filters.status,
  );

  if (relatedMatch) {
    applyRelatedMatchFilter(opsQuery, relatedMatch);
  } else {
    applyTermOrTerms(
      opsQuery,
      "categoryId",
      filters.blogCategories ?? filters.categoryId ?? filters.categoryIds,
    );

    if (Array.isArray(filters?.tags) && filters.tags.length > 0) {
      if (tagsAsShould) {
        opsQuery.bool.should.push({ terms: { tags: filters.tags } });
      } else {
        applyTermOrTerms(opsQuery, "tags", filters.tags);
      }
    }
  }

  applyTermOrTerms(opsQuery, "authorId", filters.authorId ?? filters.authorIds);

  applyTermFilter(opsQuery, "categoryName.keyword", filters.categoryName);
  applyTimestampRangeFilters(opsQuery, filters);
  applyPublishedAtRangeFilter(opsQuery, filters);
};

const ensureMustNot = (opsQuery) => {
  if (!opsQuery.bool.must_not) {
    opsQuery.bool.must_not = [];
  }
};

const applyExcludeIds = (opsQuery, excludeIds = []) => {
  if (!Array.isArray(excludeIds) || excludeIds.length === 0) return;
  ensureMustNot(opsQuery);

  for (const id of excludeIds) {
    if (!id) continue;
    opsQuery.bool.must_not.push({ term: { id } });
  }
};

const applyMustNot = (opsQuery, mustNot = []) => {
  if (!Array.isArray(mustNot) || mustNot.length === 0) return;
  ensureMustNot(opsQuery);

  for (const clause of mustNot) {
    if (clause?.id) {
      opsQuery.bool.must_not.push({ term: { id: clause.id } });
    }
  }
};

export const isTopSearchedSort = (sort) =>
  sort?.by === "searchClicks" || sort?.by === "topSearched";

const resolveBlogListSort = ({ sort, fieldMap, defaultSort }) => {
  if (isTopSearchedSort(sort)) {
    const order = sort?.order === "asc" ? "asc" : "desc";
    return [{ searchClicks: { order, missing: "_last" } }, { _id: "asc" }];
  }

  return resolveSort({ sort, fieldMap, defaultSort });
};

export const searchBlogs = async ({
  opsClient,
  query,
  indexAlias,
  publicOnly = false,
  excludeIds = [],
  tagsAsShould = false,
  relatedMatch = null,
}) => {
  const { filters = {}, search = {}, pagination = {} } = query ?? {};

  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: search?.query,
    fields: BLOG_SEARCH_FIELDS,
  });

  applyBlogFilters(opsQuery, filters, {
    publicOnly,
    tagsAsShould,
    relatedMatch,
  });
  applyExcludeIds(opsQuery, excludeIds);
  applyMustNot(opsQuery, query?.must_not);

  if (isTopSearchedSort(query?.sort) && !filters.allowZeroSearchClicks) {
    opsQuery.bool.filter.push({
      range: { searchClicks: { gte: 1 } },
    });
  }

  const sort = resolveBlogListSort({
    sort: query?.sort,
    fieldMap: BLOG_SORT_FIELD_MAP,
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
