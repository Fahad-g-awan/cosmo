import {
  applyGeoDistanceFilter,
  applyLocationTextFilter,
  applyMultiMatchSearch,
  applyNumericRangeFilter,
  applyBooleanFilter,
  applyTermFilter,
  applyTermOrTerms,
  applyTermsFilter,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveDistanceKm,
  resolveNumericRangeFilter,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";
import { addRangeFilter } from "/opt/nodejs/lib/search/opensearch-query.utils.mjs";

const SPECIALIST_SEARCH_FIELDS = [
  "firstName^3",
  "lastName^3",
  "fullName^3",
  "email^2",
  "searchableText",
];

const SPECIALIST_SORT_FIELD_MAP = {
  name: "fullName.keyword",
  firstName: "firstName.keyword",
  lastName: "lastName.keyword",
  fullName: "fullName.keyword",
  rating: "avgRating",
  avgRating: "avgRating",
  createdAt: "createdAt",
  newest: "createdAt",
  oldest: "createdAt",
  price: "minPrice",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  topSearched: "searchClicks",
  distance: "distance",
  searchClicks: "searchClicks",
};

const applySpecialistClinicFilter = (opsQuery, clinicId) => {
  if (!clinicId) return;

  opsQuery.bool.filter.push({
    bool: {
      should: [
        { term: { parentClinicId: clinicId } },
        { term: { clinicIds: clinicId } },
      ],
      minimum_should_match: 1,
    },
  });
};

const applySpecialistPriceFilter = (opsQuery, price) => {
  if (!Array.isArray(price) || price.length === 0) return;

  addRangeFilter(opsQuery, "maxPrice", price[0], null);
  addRangeFilter(opsQuery, "minPrice", null, price[1]);
};

const applySpecialistRatingMinFilter = (opsQuery, rating) => {
  if (rating === undefined || rating === null) return;
  addRangeFilter(opsQuery, "avgRating", rating, null);
};

const applySpecialistAgeFilter = (opsQuery, filters = {}) => {
  const ageRange = resolveNumericRangeFilter(filters, "age");
  if (ageRange) {
    applyNumericRangeFilter(opsQuery, "age", ageRange);
    return;
  }

  if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
    addRangeFilter(
      opsQuery,
      "age",
      filters.ageMin ?? null,
      filters.ageMax ?? null,
    );
  }
};

const resolveTreatmentIdFilter = (filters = {}, query = {}) => {
  if (Array.isArray(filters.treatmentIds) && filters.treatmentIds.length) {
    return filters.treatmentIds;
  }
  if (filters.treatmentId) {
    return [filters.treatmentId];
  }
  if (query.treatmentId) {
    return [query.treatmentId];
  }
  return null;
};

const applySpecialistFilters = (opsQuery, filters = {}, query = {}) => {
  const clinicId = filters.clinicId ?? query.clinicId;
  applySpecialistClinicFilter(opsQuery, clinicId);
  applyTermFilter(opsQuery, "workingType", filters.workingType);
  applyTermOrTerms(opsQuery, "status", filters.status);
  applyTermOrTerms(opsQuery, "gender", filters.gender);
  applyBooleanFilter(opsQuery, "available", filters.available);
  applyBooleanFilter(opsQuery, "passwordSet", filters.passwordSet);
  applyBooleanFilter(
    opsQuery,
    "defaultPasswordUsed",
    filters.defaultPasswordUsed,
  );

  applyTermsFilter(
    opsQuery,
    "treatmentCategoryIds",
    filters.treatmentCategories,
  );
  applyTermsFilter(opsQuery, "treatmentIds", resolveTreatmentIdFilter(filters, query));
  applyTermsFilter(opsQuery, "brandIds", filters.brands ?? filters.brandIds);
  applyTermsFilter(
    opsQuery,
    "clinicSpecialistTreatmentIds",
    filters.clinicSpecialistTreatmentIds,
  );

  applySpecialistRatingMinFilter(opsQuery, filters.rating);

  applyNumericRangeFilter(
    opsQuery,
    "treatmentCount",
    resolveNumericRangeFilter(filters, "treatmentCount"),
  );
  applyNumericRangeFilter(
    opsQuery,
    "reviewCount",
    resolveNumericRangeFilter(filters, "reviewCount"),
  );
  applySpecialistAgeFilter(opsQuery, filters);
  applyNumericRangeFilter(
    opsQuery,
    "totalExperience",
    resolveNumericRangeFilter(filters, "totalExperience"),
  );
  applyNumericRangeFilter(
    opsQuery,
    "searchClicks",
    resolveNumericRangeFilter(filters, "searchClicks"),
  );

  applyTimestampRangeFilters(opsQuery, filters);
};

export const isTopSearchedSort = (sort) =>
  sort?.by === "searchClicks" || sort?.by === "topSearched";

const resolveSpecialistListSort = ({ query, filters }) => {
  const hasGeoFilter = Boolean(
    filters?.userLocation?.lat != null &&
    filters?.userLocation?.lon != null &&
    resolveDistanceKm(filters?.distance) != null,
  );

  if (isTopSearchedSort(query?.sort)) {
    const order = query?.sort?.order === "asc" ? "asc" : "desc";
    return [
      { searchClicks: { order, missing: "_last" } },
      { _id: "asc" },
    ];
  }

  if (query?.sort?.by === "rating" || query?.sort?.by === "avgRating") {
    const order = query?.sort?.order === "asc" ? "asc" : "desc";
    return [{ avgRating: { order, missing: "_last" } }, { _id: "asc" }];
  }

  return resolveSort({
    sort: query?.sort,
    fieldMap: SPECIALIST_SORT_FIELD_MAP,
    defaultSort: [{ createdAt: "desc" }, { _id: "asc" }],
    geo: {
      userLocation: filters?.userLocation,
      whenFiltered: hasGeoFilter,
    },
  });
};

/**
 * Paginated OpenSearch list for specialists.
 *
 * @param {object} params
 * @param {import("@aws-sdk/client-opensearchserverless").Client} params.opsClient
 * @param {object} params.query
 * @param {string} params.indexAlias
 * @param {string} params.indexAlias
 */
export const searchSpecialists = async ({
  opsClient,
  query,
  indexAlias,
}) => {
  const filters = { ...(query?.filters ?? {}) };
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: SPECIALIST_SEARCH_FIELDS,
  });

  applyLocationTextFilter(opsQuery, filters.location);

  applySpecialistFilters(opsQuery, filters, query);
  applySpecialistPriceFilter(opsQuery, filters.price);
  applyGeoDistanceFilter(opsQuery, filters);

  if (isTopSearchedSort(query?.sort) && !filters.allowZeroSearchClicks) {
    opsQuery.bool.filter.push({ range: { searchClicks: { gte: 1 } } });
  }

  const sort = resolveSpecialistListSort({
    query,
    filters,
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
