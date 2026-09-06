/** Dynamo entity type → OpenSearch index base name. */

export const ENTITY_TO_BASE = {
  "ENTITY_TYPE#OAUTH_CLIENT_APP": "oauth_client_apps",

  "ENTITY_TYPE#ADMIN": "admins",
  "ENTITY_TYPE#PATIENT": "patients",

  "ENTITY_TYPE#TREATMENT_BRAND": "treatment_brands",
  "ENTITY_TYPE#TREATMENT_CATEGORY": "treatment_categories",
  "ENTITY_TYPE#TREATMENT": "treatments",
  "ENTITY_TYPE#CLINIC_TREATMENT": "clinic_treatments",
  "ENTITY_TYPE#CLINIC_SPECIALIST_TREATMENT": "clinic_specialist_treatments",
  "ENTITY_TYPE#SUB_TREATMENT": "sub_treatments",
  "ENTITY_TYPE#TREATMENT_RESULT": "treatment_results",
  "ENTITY_TYPE#CLINIC_CATEGORY": "clinic_categories",
  "ENTITY_TYPE#CLINIC_MANAGER": "clinic_managers",
  "ENTITY_TYPE#CLINIC": "clinics",
  "ENTITY_TYPE#SPECIALIST": "specialists",
  "ENTITY_TYPE#REVIEW": "reviews",
  "ENTITY_TYPE#REVIEW_REPLY": "review_replies",
  "ENTITY_TYPE#BLOG": "blogs",
  "ENTITY_TYPE#BLOG_CATEGORY": "blog_categories",
  "ENTITY_TYPE#ANNOUNCEMENT": "announcements",
  "ENTITY_TYPE#ENTITY_SEARCH_STATS": "entity_search_stats",
  "ENTITY_TYPE#LEAD": "leads",
};
