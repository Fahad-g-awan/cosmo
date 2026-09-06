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

const MANAGER_SEARCH_FIELDS = [
  "firstName^3",
  "lastName^3",
  "fullName^3",
  "email^2",
  "searchableText",
];

const MANAGER_SORT_FIELD_MAP = {
  name: "fullName.keyword",
  firstName: "firstName.keyword",
  lastName: "lastName.keyword",
  fullName: "fullName.keyword",
  clinicCount: "clinicCount",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

const applyManagerClinicIdsFilter = (opsQuery, clinicIds) => {
  if (clinicIds === undefined) return;

  if (!Array.isArray(clinicIds) || clinicIds.length === 0) {
    opsQuery.bool.filter.push({ bool: { must_not: { match_all: {} } } });
    return;
  }

  applyTermsFilter(opsQuery, "clinicIds", clinicIds);
};

const applyManagerFilters = (opsQuery, filters = {}) => {
  applyManagerClinicIdsFilter(opsQuery, filters.clinicIds);
  applyTermOrTerms(opsQuery, "status", filters.status);

  applyNumericRangeFilter(opsQuery, "age", filters.age);
  applyBooleanFilter(opsQuery, "passwordSet", filters.passwordSet);
  applyBooleanFilter(
    opsQuery,
    "defaultPasswordUsed",
    filters.defaultPasswordUsed,
  );
  applyNumericRangeFilter(
    opsQuery,
    "clinicCount",
    resolveNumericRangeFilter(filters, "clinicCount"),
  );

  applyTimestampRangeFilters(opsQuery, filters);
};

/**
 * Paginated OpenSearch list for clinic managers.
 *
 * @param {object} params
 * @param {import("@aws-sdk/client-opensearchserverless").Client} params.opsClient
 * @param {object} params.query
 * @param {string} params.indexAlias
 */
export const searchManagers = async ({ opsClient, query, indexAlias }) => {
  const filters = query?.filters ?? {};
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: MANAGER_SEARCH_FIELDS,
  });

  applyManagerFilters(opsQuery, filters);

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: MANAGER_SORT_FIELD_MAP,
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
