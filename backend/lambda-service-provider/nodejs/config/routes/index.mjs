import {
  buildMaintenanceAllowlist,
  buildRoutePolicies,
  buildRouteRegistry,
} from "./_builders.mjs";
import { NOTIFICATIONS_ROUTE_DEFS } from "./notifications.routes.mjs";
import { SPECIALISTS_ROUTE_DEFS } from "./specialists.routes.mjs";
import { LAMBDA_TEST_ROUTE_DEFS } from "./lambdaTest.routes.mjs";
import { TREATMENT_ROUTE_DEFS } from "./treatment.routes.mjs";
import { PATIENTS_ROUTE_DEFS } from "./patients.routes.mjs";
import { PLATFORM_ROUTE_DEFS } from "./platform.routes.mjs";
import { CLINIC_ROUTE_DEFS } from "./clinic.routes.mjs";
import { REVIEW_ROUTE_DEFS } from "./review.routes.mjs";
import { ADMIN_ROUTE_DEFS } from "./admin.routes.mjs";
import { OAUTH_ROUTE_DEFS } from "./oauth.routes.mjs";
import { IMAGE_ROUTE_DEFS } from "./image.routes.mjs";
import { AUTH_ROUTE_DEFS } from "./auth.routes.mjs";
import { BLOG_ROUTE_DEFS } from "./blog.routes.mjs";
import { LEAD_ROUTE_DEFS } from "./lead.routes.mjs";

export { NOTIFICATIONS_ROUTE_DEFS } from "./notifications.routes.mjs";
export { SPECIALISTS_ROUTE_DEFS } from "./specialists.routes.mjs";
export { LAMBDA_TEST_ROUTE_DEFS } from "./lambdaTest.routes.mjs";
export { TREATMENT_ROUTE_DEFS } from "./treatment.routes.mjs";
export { PATIENTS_ROUTE_DEFS } from "./patients.routes.mjs";
export { PLATFORM_ROUTE_DEFS } from "./platform.routes.mjs";
export { CLINIC_ROUTE_DEFS } from "./clinic.routes.mjs";
export { REVIEW_ROUTE_DEFS } from "./review.routes.mjs";
export { ADMIN_ROUTE_DEFS } from "./admin.routes.mjs";
export { OAUTH_ROUTE_DEFS } from "./oauth.routes.mjs";
export { IMAGE_ROUTE_DEFS } from "./image.routes.mjs";
export { AUTH_ROUTE_DEFS } from "./auth.routes.mjs";
export { BLOG_ROUTE_DEFS } from "./blog.routes.mjs";
export { LEAD_ROUTE_DEFS } from "./lead.routes.mjs";

export {
  ROUTE_ACCESS,
  ROUTE_ACCESS_VALUES,
} from "./route-access.constants.mjs";
export { anyOf, allOf } from "./_policy.helpers.mjs";

const ROUTE_DEF_GROUPS = [
  ADMIN_ROUTE_DEFS,
  AUTH_ROUTE_DEFS,
  PLATFORM_ROUTE_DEFS,
  OAUTH_ROUTE_DEFS,
  IMAGE_ROUTE_DEFS,
  PATIENTS_ROUTE_DEFS,
  SPECIALISTS_ROUTE_DEFS,
  CLINIC_ROUTE_DEFS,
  TREATMENT_ROUTE_DEFS,
  REVIEW_ROUTE_DEFS,
  BLOG_ROUTE_DEFS,
  NOTIFICATIONS_ROUTE_DEFS,
  LEAD_ROUTE_DEFS,
  LAMBDA_TEST_ROUTE_DEFS,
];

export const ROUTE_REGISTRY = buildRouteRegistry(ROUTE_DEF_GROUPS);
export const ALL_ROUTE_KEYS = Object.freeze(Object.keys(ROUTE_REGISTRY));
export const ROUTE_POLICIES = buildRoutePolicies(ROUTE_DEF_GROUPS);
export const MAINTENANCE_ALLOWLIST_ROUTE_KEYS =
  buildMaintenanceAllowlist(ROUTE_DEF_GROUPS);
