/** Index names, invoke env/action enums, and default cluster sizing for this lambda. */

export const TARGET = {
  OAUTH_CLIENT_APPS: "oauth_client_apps",
  ADMINS: "admins",
  PATIENTS: "patients",
  TREATMENT_BRANDS: "treatment_brands",
  TREATMENT_CATEGORIES: "treatment_categories",
  TREATMENTS: "treatments",
  CLINIC_TREATMENTS: "clinic_treatments",
  CLINIC_SPECIALIST_TREATMENTS: "clinic_specialist_treatments",
  SUB_TREATMENTS: "sub_treatments",
  TREATMENT_RESULTS: "treatment_results",
  CLINIC_CATEGORIES: "clinic_categories",
  CLINIC_MANAGERS: "clinic_managers",
  CLINICS: "clinics",
  SPECIALISTS: "specialists",
  REVIEWS: "reviews",
  REVIEW_REPLIES: "review_replies",
  BLOG_CATEGORIES: "blog_categories",
  BLOGS: "blogs",
  ANNOUNCEMENTS: "announcements",
  ENTITY_SEARCH_STATS: "entity_search_stats",
  LEADS: "leads",
};

export const ENV = {
  DEV: "dev",
  PROD: "prod",
};

export const ACTION = {
  CREATE: "create",
  CREATE_TARGETS: "createTargets",
  MIGRATE: "migrate",
  TRUNCATE: "truncate",
  DELETE_ALL: "deleteAll",
  DELETE_FIELDS: "deleteFields",
  DELETE_TARGET: "deleteTarget",
  DELETE_TARGETS: "deleteTargets",
  DELETE_STRAY: "deleteStray",
  DELETE_DOC: "deleteDoc",
  ADD_FIELDS: "addFields",
  UPDATE_DOC: "updateDoc",
  GET: "get",
};

export const SHARDS = 1;
export const REPLICAS = 0;
