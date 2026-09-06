import {
  applyMultiMatchSearch,
  applyTermOrTerms,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";
import {
  addRangeFilter,
  normalizeDate,
} from "/opt/nodejs/lib/search/opensearch-query.utils.mjs";

const ANNOUNCEMENT_SEARCH_FIELDS = [
  "title^3",
  "message^2",
  "severity",
  "status",
  "authorName",
  "authorEmail",
  "searchableText",
];

const ANNOUNCEMENT_SORT_FIELD_MAP = {
  title: "title.keyword",
  message: "message.keyword",
  severity: "severity",
  status: "status",
  priority: "priority",
  startsAt: "startsAt",
  endsAt: "endsAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  searchClicks: "searchClicks",
  authorName: "authorName.keyword",
};

const applyScheduleRangeFilter = (opsQuery, filters = {}) => {
  const startsFrom = normalizeDate({
    input: filters?.startsAt?.[0] ?? null,
    isStartOfDay: true,
    isEndOfDay: false,
  });
  const startsTo = normalizeDate({
    input: filters?.startsAt?.[1] ?? null,
    isStartOfDay: false,
    isEndOfDay: true,
  });
  addRangeFilter(opsQuery, "startsAt", startsFrom, startsTo);

  const endsFrom = normalizeDate({
    input: filters?.endsAt?.[0] ?? null,
    isStartOfDay: true,
    isEndOfDay: false,
  });
  const endsTo = normalizeDate({
    input: filters?.endsAt?.[1] ?? null,
    isStartOfDay: false,
    isEndOfDay: true,
  });
  addRangeFilter(opsQuery, "endsAt", endsFrom, endsTo);
};

const applyAnnouncementFilters = (opsQuery, filters = {}) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyTermOrTerms(opsQuery, "status", filters.status);
  applyTermOrTerms(opsQuery, "severity", filters.severity);
  applyTermOrTerms(opsQuery, "targetRoles", filters.targetRoles);
  applyTermOrTerms(opsQuery, "targetSurfaces", filters.targetSurfaces);
  applyTermOrTerms(opsQuery, "authorId", filters.authorId ?? filters.authorIds);
  applyTimestampRangeFilters(opsQuery, filters);
  applyScheduleRangeFilter(opsQuery, filters);
};

/** Search announcements in OpenSearch for admin management lists. */
export const searchAnnouncements = async ({
  opsClient,
  query,
  indexAlias,
}) => {
  const { filters = {}, search = {}, pagination = {} } = query ?? {};
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: search?.query,
    fields: ANNOUNCEMENT_SEARCH_FIELDS,
  });

  applyAnnouncementFilters(opsQuery, filters);

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: ANNOUNCEMENT_SORT_FIELD_MAP,
    defaultSort: [{ priority: "desc" }, { createdAt: "desc" }, { _id: "asc" }],
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
