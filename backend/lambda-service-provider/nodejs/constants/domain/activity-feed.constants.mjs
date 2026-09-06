import { ACTIVITY_MONITORING_ACTION } from "../db/activity-monitoring.actions.mjs";
import { ENTITY_TYPE } from "../db/entity-types.mjs";

/** Short resource label for activity feed UI copy. */
export const ACTIVITY_SCOPE_LABEL = {
  [ENTITY_TYPE.ADMIN]: "admin",
  [ENTITY_TYPE.PATIENT]: "patient",
  [ENTITY_TYPE.SPECIALIST]: "specialist",
  [ENTITY_TYPE.CLINIC_MANAGER]: "clinic manager",
  [ENTITY_TYPE.CLINIC]: "clinic",
  [ENTITY_TYPE.CLINIC_CATEGORY]: "clinic category",
  [ENTITY_TYPE.TREATMENT]: "treatment",
  [ENTITY_TYPE.TREATMENT_CATEGORY]: "treatment category",
  [ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT]: "clinic specialist treatment",
  [ENTITY_TYPE.SUB_TREATMENT]: "sub-treatment",
  [ENTITY_TYPE.TREATMENT_RESULT]: "treatment result",
  [ENTITY_TYPE.TREATMENT_BRAND]: "treatment brand",
  [ENTITY_TYPE.REVIEW]: "review",
  [ENTITY_TYPE.REVIEW_REPLY]: "review reply",
  [ENTITY_TYPE.BLOG]: "blog",
  [ENTITY_TYPE.BLOG_CATEGORY]: "blog category",
  [ENTITY_TYPE.LEAD]: "lead",
  [ENTITY_TYPE.IDENTITY]: "account",
};

/** Past-tense verb keyed by activity action. */
export const ACTIVITY_ACTION_VERB = {
  [ACTIVITY_MONITORING_ACTION.CREATE]: "created",
  [ACTIVITY_MONITORING_ACTION.UPDATE]: "updated",
  [ACTIVITY_MONITORING_ACTION.DELETE]: "deleted",
  [ACTIVITY_MONITORING_ACTION.SOFT_DELETE]: "deactivated",
  [ACTIVITY_MONITORING_ACTION.REGISTER]: "registered",
  [ACTIVITY_MONITORING_ACTION.TREATMENT_SELECTION]: "updated treatments for",
  [ACTIVITY_MONITORING_ACTION.PASSWORD_UPDATE]: "changed password for",
  [ACTIVITY_MONITORING_ACTION.PASSWORD_SET]: "set password for",
  [ACTIVITY_MONITORING_ACTION.LINK_OAUTH_PROVIDER]: "linked a provider for",
  [ACTIVITY_MONITORING_ACTION.SIGN_IN]: "signed in",
};
