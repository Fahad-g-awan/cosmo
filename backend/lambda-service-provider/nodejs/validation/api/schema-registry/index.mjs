import { NOTIFICATIONS_SCHEMAS } from "./notifications.registry.mjs";
import { LAMBDA_TEST_SCHEMAS } from "./lambdaTest.registry.mjs";
import { SPECIALIST_SCHEMAS } from "./specialist.registry.mjs";
import { TREATMENT_SCHEMAS } from "./treatment.registry.mjs";
import { PLATFORM_SCHEMAS } from "./platform.registry.mjs";
import { PATIENT_SCHEMAS } from "./patient.registry.mjs";
import { CLINIC_SCHEMAS } from "./clinic.registry.mjs";
import { REVIEW_SCHEMAS } from "./review.registry.mjs";
import { OAUTH_SCHEMAS } from "./oauth.registry.mjs";
import { ADMIN_SCHEMAS } from "./admin.registry.mjs";
import { AUTH_SCHEMAS } from "./auth.registry.mjs";
import { BLOG_SCHEMAS } from "./blog.registry.mjs";
import { LEAD_SCHEMAS } from "./lead.registry.mjs";

export {
  OAUTH_SCHEMAS,
  AUTH_SCHEMAS,
  ADMIN_SCHEMAS,
  PATIENT_SCHEMAS,
  SPECIALIST_SCHEMAS,
  CLINIC_SCHEMAS,
  TREATMENT_SCHEMAS,
  REVIEW_SCHEMAS,
  BLOG_SCHEMAS,
  NOTIFICATIONS_SCHEMAS,
  LEAD_SCHEMAS,
  LAMBDA_TEST_SCHEMAS,
  PLATFORM_SCHEMAS,
};

export const API_SCHEMAS = {
  ...OAUTH_SCHEMAS,
  ...AUTH_SCHEMAS,
  ...ADMIN_SCHEMAS,
  ...PATIENT_SCHEMAS,
  ...SPECIALIST_SCHEMAS,
  ...CLINIC_SCHEMAS,
  ...TREATMENT_SCHEMAS,
  ...REVIEW_SCHEMAS,
  ...BLOG_SCHEMAS,
  ...NOTIFICATIONS_SCHEMAS,
  ...LEAD_SCHEMAS,
  ...LAMBDA_TEST_SCHEMAS,
  ...PLATFORM_SCHEMAS,
};
