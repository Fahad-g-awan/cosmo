import {
  applyBooleanFilter,
  applyMultiMatchSearch,
  applyNumericRangeFilter,
  applyTermFilter,
  applyTermOrTerms,
  applyTermsFilter,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveNumericRangeFilter,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";
import { addRangeFilter } from "/opt/nodejs/lib/search/opensearch-query.utils.mjs";

const SUB_TREATMENT_SEARCH_FIELDS = [
  "name^3",
  "categoryName^2",
  "searchableText",
];

const SUB_TREATMENT_SORT_FIELD_MAP = {
  name: "name.keyword",
  categoryName: "categoryName.keyword",
  price: "price",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

const applySubTreatmentFilters = (
  opsQuery,
  filters = {},
  { publicBrowse = false } = {},
) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyTermFilter(opsQuery, "clinicId", filters.clinicId);
  applyTermFilter(opsQuery, "clinicTreatmentId", filters.clinicTreatmentId);
  applyTermsFilter(
    opsQuery,
    "clinicTreatmentId",
    filters.clinicTreatmentIds,
  );
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
  applyTermsFilter(opsQuery, "brandIds", filters.brands ?? filters.brandIds);
  applyBooleanFilter(opsQuery, "available", filters.available);

  if (publicBrowse) {
    applyTermFilter(opsQuery, "clinicTreatmentStatus", "ACTIVE");
  } else if (filters.clinicTreatmentStatus !== undefined) {
    applyTermOrTerms(
      opsQuery,
      "clinicTreatmentStatus",
      filters.clinicTreatmentStatus,
    );
  } else {
    applyTermFilter(opsQuery, "clinicTreatmentStatus", "ACTIVE");
  }

  applyNumericRangeFilter(
    opsQuery,
    "price",
    resolveNumericRangeFilter(filters, "price"),
  );

  const durationValues = filters.durations ?? filters.duration;
  if (Array.isArray(durationValues) && durationValues.length > 0) {
    applyTermsFilter(opsQuery, "duration", durationValues);
  } else if (Array.isArray(filters.durationRange) && filters.durationRange.length === 2) {
    addRangeFilter(
      opsQuery,
      "duration",
      filters.durationRange[0] ?? null,
      filters.durationRange[1] ?? null,
    );
  }

  applyTimestampRangeFilters(opsQuery, filters);
};

export const searchSubTreatments = async ({
  opsClient,
  query,
  indexAlias,
  publicBrowse = false,
}) => {
  const filters = query?.filters ?? {};
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: SUB_TREATMENT_SEARCH_FIELDS,
  });

  applySubTreatmentFilters(opsQuery, filters, { publicBrowse });

  const pagination = {
    limit: Math.min(Math.max(query?.pagination?.limit ?? 100, 1), 500),
    nextToken: query?.pagination?.nextToken ?? null,
  };

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: SUB_TREATMENT_SORT_FIELD_MAP,
    defaultSort: [
      { "categoryName.keyword": { order: "asc", unmapped_type: "keyword" } },
      { "name.keyword": { order: "asc", unmapped_type: "keyword" } },
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
