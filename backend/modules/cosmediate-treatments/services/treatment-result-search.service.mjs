import {
  applyMultiMatchSearch,
  applyTermFilter,
  applyTermOrTerms,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";

const TREATMENT_RESULT_SEARCH_FIELDS = [
  "description^2",
  "treatmentName^3",
  "categoryName^2",
  "searchableText",
];

const TREATMENT_RESULT_SORT_FIELD_MAP = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  treatmentName: "treatmentName.keyword",
  categoryName: "categoryName.keyword",
  ownerType: "ownerType",
};

const resolveTreatmentIdFilter = (filters = {}, query = {}) => {
  if (filters.treatmentId) return filters.treatmentId;
  if (query.treatmentId) return query.treatmentId;
  return null;
};

const applyTreatmentResultFilters = (opsQuery, filters = {}, query = {}) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyTermOrTerms(opsQuery, "ownerType", filters.ownerType);
  applyTermFilter(opsQuery, "clinicId", filters.clinicId);
  applyTermFilter(opsQuery, "clinicTreatmentId", filters.clinicTreatmentId);
  applyTermOrTerms(
    opsQuery,
    "treatmentId",
    resolveTreatmentIdFilter(filters, query),
  );
  applyTermOrTerms(
    opsQuery,
    "categoryId",
    filters.categoryId ?? filters.treatmentCategories,
  );
  applyTermOrTerms(
    opsQuery,
    "clinicTreatmentStatus",
    filters.clinicTreatmentStatus,
  );
  applyTimestampRangeFilters(opsQuery, filters);
};

export const searchTreatmentResults = async ({
  opsClient,
  query,
  indexAlias,
}) => {
  const filters = query?.filters ?? {};
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: TREATMENT_RESULT_SEARCH_FIELDS,
  });

  applyTreatmentResultFilters(opsQuery, filters, query);

  const pagination = {
    limit: Math.min(Math.max(query?.pagination?.limit ?? 100, 1), 500),
    nextToken: query?.pagination?.nextToken ?? null,
  };

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: TREATMENT_RESULT_SORT_FIELD_MAP,
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
