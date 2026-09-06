import {
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
import { addRangeFilter } from "/opt/nodejs/lib/search/opensearch-query.utils.mjs";

const REVIEW_SEARCH_FIELDS = [
  "comment",
  "targetEmail",
  "targetName",
  "authorName",
  "authorEmail",
  "searchableText",
];

const REVIEW_SORT_FIELD_MAP = {
  rating: "rating",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  newest: "createdAt",
  oldest: "createdAt",
};

const applyReviewFilters = (opsQuery, query = {}) => {
  const filters = query.filters ?? {};

  applyTermOrTerms(
    opsQuery,
    "targetEntityId",
    query.targetEntityId ?? filters.targetEntityId,
  );
  applyTermOrTerms(
    opsQuery,
    "targetEntityType",
    query.targetEntityType ?? filters.targetEntityType,
  );
  applyTermOrTerms(opsQuery, "authorId", query.authorId ?? filters.authorId);
  applyTermOrTerms(opsQuery, "reviewId", query.reviewId ?? filters.reviewId);
  applyTermFilter(opsQuery, "status", filters.status);

  const ratingRange = filters.rating;
  if (Array.isArray(ratingRange) && ratingRange.length === 2) {
    applyNumericRangeFilter(opsQuery, "rating", ratingRange);
  } else {
    addRangeFilter(
      opsQuery,
      "rating",
      query.ratingMin ?? filters.ratingMin ?? null,
      query.ratingMax ?? filters.ratingMax ?? null,
    );
  }

  applyNumericRangeFilter(
    opsQuery,
    "replyCount",
    resolveNumericRangeFilter(filters, "replyCount") ??
      (query.replyCountMin !== undefined || query.replyCountMax !== undefined
        ? [query.replyCountMin ?? null, query.replyCountMax ?? null]
        : undefined),
  );

  applyTimestampRangeFilters(opsQuery, filters);
};

export const searchReviews = async ({ opsClient, query, indexAlias }) => {
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: REVIEW_SEARCH_FIELDS,
  });
  applyReviewFilters(opsQuery, query);

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: REVIEW_SORT_FIELD_MAP,
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

export const searchReviewReplies = async ({ opsClient, query, indexAlias }) => {
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: REVIEW_SEARCH_FIELDS,
  });
  applyReviewFilters(opsQuery, query);

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: REVIEW_SORT_FIELD_MAP,
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
