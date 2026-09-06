import {
  applyBooleanFilter,
  applyGeoDistanceFilter,
  applyMultiMatchSearch,
  applyNumericRangeFilter,
  applyTermFilter,
  applyTermOrTerms,
  applyTimestampRangeFilters,
  createActiveDocsQuery,
  resolveDistanceKm,
  resolveSort,
  runPaginatedSearch,
} from "/opt/nodejs/lib/search/list-query.mjs";

const ADMIN_SEARCH_FIELDS = [
  "firstName^3",
  "lastName^3",
  "fullName^3",
  "email^2",
  "phone",
  "city^2",
  "completeAddress",
  "searchableText",
];

const ADMIN_SORT_FIELD_MAP = {
  name: "fullName.keyword",
  firstName: "firstName.keyword",
  lastName: "lastName.keyword",
  fullName: "fullName.keyword",
  email: "email",
  phone: "phone",
  status: "status",
  role: "role",
  age: "age",
  country: "country.keyword",
  state: "state.keyword",
  city: "city.keyword",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  distance: "distance",
};

const applyAdminFilters = (opsQuery, filters = {}) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyTermOrTerms(opsQuery, "status", filters.status);
  applyTermOrTerms(opsQuery, "role", filters.role);
  applyTermOrTerms(opsQuery, "gender", filters.gender);
  applyTermOrTerms(opsQuery, "country.keyword", filters.country);
  applyTermOrTerms(opsQuery, "state.keyword", filters.state);
  applyTermOrTerms(opsQuery, "city.keyword", filters.city);
  applyTermFilter(opsQuery, "postalCode", filters.postalCode);
  applyTermFilter(opsQuery, "phone", filters.phone);
  applyTermFilter(opsQuery, "email", filters.email);

  applyBooleanFilter(opsQuery, "defaultPasswordUsed", filters.defaultPasswordUsed);
  applyBooleanFilter(opsQuery, "passwordSet", filters.passwordSet);

  applyNumericRangeFilter(opsQuery, "age", filters.age);
  applyGeoDistanceFilter(opsQuery, filters);
  applyTimestampRangeFilters(opsQuery, filters);
};

export const searchAdmins = async ({ opsClient, query, indexAlias }) => {
  const { filters = {}, search = {}, pagination = {} } = query ?? {};

  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: search?.query,
    fields: ADMIN_SEARCH_FIELDS,
  });

  applyAdminFilters(opsQuery, filters);

  const hasGeoFilter = Boolean(
    filters?.userLocation?.lat != null &&
      filters?.userLocation?.lon != null &&
      resolveDistanceKm(filters?.distance) != null,
  );

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: ADMIN_SORT_FIELD_MAP,
    defaultSort: [{ createdAt: "desc" }, { _id: "asc" }],
    geo: {
      userLocation: filters?.userLocation,
      whenFiltered: hasGeoFilter,
    },
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
