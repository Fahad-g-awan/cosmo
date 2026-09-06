import { TREATMENT_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/treatment.routes.mjs";
import { ROUTE_ACCESS } from "/opt/nodejs/config/routes/route-access.constants.mjs";

const MANAGEMENT_ROUTE_KEYS = new Set(
  Object.values(R)
    .filter((def) => def.key?.includes("/management/"))
    .map((def) => def.key),
);

export const PUBLIC_ROUTE_KEYS = new Set(
  Object.values(R)
    .filter((def) => def.access === ROUTE_ACCESS.PUBLIC)
    .map((def) => def.key),
);

/** @param {string|null|undefined} routeKey */
export const isManagementRoute = (routeKey) =>
  MANAGEMENT_ROUTE_KEYS.has(routeKey ?? "");

/** @param {string|null|undefined} routeKey */
export const isPublicRoute = (routeKey) =>
  PUBLIC_ROUTE_KEYS.has(routeKey ?? "");

/** Public treatment list/top-searched enforce published catalog only. */
export const resolveTreatmentListFilters = (routeKey, filters = {}) => {
  if (routeKey === R.LIST.key || routeKey === R.TOP_SEARCHED.key) {
    return { ...filters, published: true };
  }
  return filters;
};

/** Public list responses omit rich content fields. */
export const shouldOmitTreatmentRichContent = (routeKey) =>
  routeKey === R.LIST.key || routeKey === R.TOP_SEARCHED.key;

/** Public assignment list enforces active assignment + active hub offering. */
export const resolveClinicSpecialistTreatmentListFilters = (
  routeKey,
  filters = {},
) => {
  if (routeKey === R.CLINIC_SPECIALIST_TREATMENT_LIST.key) {
    return { ...filters, status: "ACTIVE", clinicTreatmentStatus: "ACTIVE" };
  }
  return filters;
};

/** Public sub-treatment list enforces active hub offering. */
export const resolveSubTreatmentListFilters = (routeKey, filters = {}) => {
  if (routeKey === R.SUB_LIST.key) {
    return { ...filters, clinicTreatmentStatus: "ACTIVE" };
  }
  return filters;
};

/** Clinic offering list defaults to ACTIVE hubs (selection tab). */
export const resolveClinicTreatmentListFilters = (filters = {}) => ({
  ...filters,
  status: filters.status ?? "ACTIVE",
});
