import {
  applyBooleanFilter,
  applyGeoDistanceFilter,
  applyLocationTextFilter,
  applyMultiMatchSearch,
  applyNumericRangeFilter,
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

const CLINIC_SEARCH_FIELDS = ["name^3", "email^2", "searchableText"];

const CLINIC_SORT_FIELD_MAP = {
  name: "name.keyword",
  rating: "avgRating",
  avgRating: "avgRating",
  createdAt: "createdAt",
  newest: "createdAt",
  oldest: "createdAt",
  price: "minPrice",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  distance: "distance",
  searchClicks: "searchClicks",
  reviewCount: "reviewCount",
  topSearched: "searchClicks",
  popular: "avgRating",
};

const applyNestedTermsFilter = (opsQuery, path, field, values) => {
  if (!Array.isArray(values) || !values.length) return;

  opsQuery.bool.filter.push({
    nested: {
      path,
      query: { terms: { [field]: values } },
    },
  });
};

const applyClinicIdScopeFilter = (opsQuery, clinicId) => {
  if (!clinicId) return;

  opsQuery.bool.filter.push({
    bool: {
      should: [
        { term: { parentClinicId: clinicId } },
        { term: { id: clinicId } },
      ],
      minimum_should_match: 1,
    },
  });
};

const applyClinicPriceFilter = (opsQuery, price) => {
  if (!Array.isArray(price) || price.length === 0) return;

  addRangeFilter(opsQuery, "maxPrice", price[0], null);
  addRangeFilter(opsQuery, "minPrice", null, price[1]);
};

const applyClinicRatingMinFilter = (opsQuery, rating) => {
  if (rating === undefined || rating === null) return;
  addRangeFilter(opsQuery, "avgRating", rating, null);
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

const applyClinicFilters = (opsQuery, filters = {}, query = {}) => {
  applyNestedTermsFilter(
    opsQuery,
    "categories",
    "categories.id",
    filters.clinicCategories,
  );
  applyTermsFilter(
    opsQuery,
    "treatmentCategoryIds",
    filters.treatmentCategories,
  );
  applyTermsFilter(
    opsQuery,
    "treatmentIds",
    resolveTreatmentIdFilter(filters, query),
  );
  applyTermsFilter(opsQuery, "brandIds", filters.brands ?? filters.brandIds);
  applyTermsFilter(opsQuery, "clinicTreatmentIds", filters.clinicTreatmentIds);
  applyTermsFilter(
    opsQuery,
    "clinicSpecialistTreatmentIds",
    filters.clinicSpecialistTreatmentIds,
  );

  applyTermFilter(opsQuery, "parentClinicId", filters.parentClinicId);
  applyTermFilter(opsQuery, "clinicType", filters.clinicType);
  applyBooleanFilter(opsQuery, "available", filters.available);
  applyTermOrTerms(opsQuery, "status", filters.status);
  applyTermsFilter(opsQuery, "id", filters.clinicIds);
  applyClinicIdScopeFilter(opsQuery, filters.clinicId);
  applyTermFilter(opsQuery, "specialistIds", filters.specialistId);

  applyClinicRatingMinFilter(opsQuery, filters.rating);

  applyNumericRangeFilter(
    opsQuery,
    "specialistCount",
    resolveNumericRangeFilter(filters, "specialistCount"),
  );
  applyNumericRangeFilter(
    opsQuery,
    "treatmentCount",
    resolveNumericRangeFilter(filters, "treatmentCount"),
  );
  applyNumericRangeFilter(
    opsQuery,
    "clinicTreatmentCount",
    resolveNumericRangeFilter(filters, "clinicTreatmentCount"),
  );
  applyNumericRangeFilter(
    opsQuery,
    "reviewCount",
    resolveNumericRangeFilter(filters, "reviewCount"),
  );
  applyNumericRangeFilter(
    opsQuery,
    "clinicAge",
    resolveNumericRangeFilter(filters, "clinicAge"),
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

export const isPopularSort = (sort) =>
  sort?.by === "popular" || sort?.by === "rating" || sort?.by === "avgRating";

const resolveClinicListSort = ({ query, filters }) => {
  const hasGeoFilter = Boolean(
    filters?.userLocation?.lat != null &&
    filters?.userLocation?.lon != null &&
    resolveDistanceKm(filters?.distance) != null,
  );

  if (isPopularSort(query?.sort)) {
    const order = query?.sort?.order === "asc" ? "asc" : "desc";
    return [
      { avgRating: { order, missing: "_last" } },
      { reviewCount: { order: "desc", missing: "_last" } },
      { _id: "asc" },
    ];
  }

  if (isTopSearchedSort(query?.sort)) {
    const order = query?.sort?.order === "asc" ? "asc" : "desc";
    return [{ searchClicks: { order, missing: "_last" } }, { _id: "asc" }];
  }

  return resolveSort({
    sort: query?.sort,
    fieldMap: CLINIC_SORT_FIELD_MAP,
    defaultSort: [{ createdAt: "desc" }, { _id: "asc" }],
    geo: {
      userLocation: filters?.userLocation,
      whenFiltered: hasGeoFilter,
    },
  });
};

/**
 * Paginated OpenSearch query for clinic list endpoints.
 *
 * @param {object} params
 * @param {import("@aws-sdk/client-opensearchserverless").Client} params.opsClient
 * @param {object} params.query
 * @param {string} params.indexAlias
 * @param {string} params.indexAlias
 */
export const searchClinics = async ({ opsClient, query, indexAlias }) => {
  const filters = { ...(query?.filters ?? {}) };
  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: CLINIC_SEARCH_FIELDS,
  });

  applyLocationTextFilter(opsQuery, filters.location);
  applyClinicFilters(opsQuery, filters, query);
  applyClinicPriceFilter(opsQuery, filters.price);
  applyGeoDistanceFilter(opsQuery, filters);

  if (isPopularSort(query?.sort) && !filters.allowZeroRating) {
    opsQuery.bool.filter.push({ range: { reviewCount: { gte: 1 } } });
  } else if (isTopSearchedSort(query?.sort) && !filters.allowZeroSearchClicks) {
    opsQuery.bool.filter.push({ range: { searchClicks: { gte: 1 } } });
  }

  const sort = resolveClinicListSort({ query, filters });

  return runPaginatedSearch({
    opsClient,
    indexAlias,
    opsQuery,
    sort,
    pagination: query?.pagination,
    useLimitPlusOne: true,
  });
};
