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

const PATIENT_SEARCH_FIELDS = [
  "firstName^3",
  "lastName^3",
  "fullName^3",
  "email^2",
  "phone",
  "city^2",
  "completeAddress",
  "searchableText",
];

const PATIENT_SORT_FIELD_MAP = {
  name: "fullName.keyword",
  firstName: "firstName.keyword",
  lastName: "lastName.keyword",
  fullName: "fullName.keyword",
  email: "email",
  phone: "phone",
  status: "status",
  age: "age",
  country: "country.keyword",
  state: "state.keyword",
  city: "city.keyword",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  distance: "distance",
};

const applyPatientClinicFilter = (opsQuery, clinicId) => {
  applyTermOrTerms(opsQuery, "patientClinicIds", clinicId);
};

const applyPatientSpecialistFilter = (opsQuery, specialistId) => {
  applyTermOrTerms(opsQuery, "patientSpecialistIds", specialistId);
};

const applyPatientOrgRootFilter = (opsQuery, orgRootId) => {
  applyTermOrTerms(opsQuery, "patientOrgRootIds", orgRootId);
};

const applyPatientFilters = (opsQuery, filters = {}) => {
  applyTermOrTerms(opsQuery, "id", filters.id ?? filters.ids);
  applyTermOrTerms(opsQuery, "status", filters.status);
  applyTermOrTerms(opsQuery, "gender", filters.gender);
  applyTermOrTerms(opsQuery, "country.keyword", filters.country);
  applyTermOrTerms(opsQuery, "state.keyword", filters.state);
  applyTermOrTerms(opsQuery, "city.keyword", filters.city);
  applyTermFilter(opsQuery, "postalCode", filters.postalCode);
  applyTermFilter(opsQuery, "phone", filters.phone);
  applyTermFilter(opsQuery, "email", filters.email);

  applyPatientClinicFilter(opsQuery, filters.clinicId);
  applyPatientSpecialistFilter(opsQuery, filters.specialistId);
  applyPatientOrgRootFilter(opsQuery, filters.orgRootId);

  applyTermOrTerms(opsQuery, "creationSource", filters.creationSource);

  applyBooleanFilter(opsQuery, "defaultPasswordUsed", filters.defaultPasswordUsed);
  applyBooleanFilter(opsQuery, "passwordSet", filters.passwordSet);

  applyNumericRangeFilter(opsQuery, "age", filters.age);
  applyGeoDistanceFilter(opsQuery, filters);
  applyTimestampRangeFilters(opsQuery, filters);
};

export const searchPatients = async ({ opsClient, query, indexAlias }) => {
  const { filters = {} } = query ?? {};

  const opsQuery = createActiveDocsQuery();

  applyMultiMatchSearch(opsQuery, {
    query: query?.search?.query,
    fields: PATIENT_SEARCH_FIELDS,
  });

  applyPatientFilters(opsQuery, filters);

  const hasGeoFilter = Boolean(
    filters?.userLocation?.lat != null &&
      filters?.userLocation?.lon != null &&
      resolveDistanceKm(filters?.distance) != null,
  );

  const sort = resolveSort({
    sort: query?.sort,
    fieldMap: PATIENT_SORT_FIELD_MAP,
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
    pagination: query?.pagination,
    useLimitPlusOne: true,
  });
};
