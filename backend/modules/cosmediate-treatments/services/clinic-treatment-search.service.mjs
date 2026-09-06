import {
  applyMultiMatchSearch,
  applyNumericRangeFilter,
  applyTermFilter,
  applyTermOrTerms,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";

const CLINIC_TREATMENT_SEARCH_FIELDS = [
  "treatmentName^3",
  "categoryName^2",
  "searchableText",
];

const CLINIC_TREATMENT_SORT_FIELD_MAP = {
  treatmentName: "treatmentName.keyword",
  categoryName: "categoryName.keyword",
  status: "status",
  avgPrice: "avgPrice",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

const applyClinicTreatmentFilters = (opsQuery, filters = {}) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyTermFilter(opsQuery, "clinicId", filters.clinicId);
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
  applyTermOrTerms(opsQuery, "status", filters.status);
  applyNumericRangeFilter(opsQuery, "avgPrice", filters.avgPrice);
  applyNumericRangeFilter(opsQuery, "minPrice", filters.minPrice);
  applyNumericRangeFilter(opsQuery, "maxPrice", filters.maxPrice);
  applyTimestampRangeFilters(opsQuery, filters);
};

export const searchClinicTreatments = async ({
  opsClient,
  query,
  indexAlias,
}) => {
  const filters = query?.filters ?? {};
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: CLINIC_TREATMENT_SEARCH_FIELDS,
  });

  applyClinicTreatmentFilters(opsQuery, filters);

  const pagination = {
    limit: Math.min(Math.max(query?.pagination?.limit ?? 100, 1), 500),
    nextToken: query?.pagination?.nextToken ?? null,
  };

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: CLINIC_TREATMENT_SORT_FIELD_MAP,
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
