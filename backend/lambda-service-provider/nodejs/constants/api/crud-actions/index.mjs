import {
  TREATMENT_CATEGORY,
  TREATMENT,
  SUB_TREATMENT,
  TREATMENT_BRAND,
  TREATMENT_RESULT,
} from "./treatment.actions.mjs";
import { CLINIC_CATEGORY, CLINIC_MANAGER, CLINIC } from "./clinic.actions.mjs";
import { CONVERSATION, CONVERSATION_CHAT } from "./conversation.actions.mjs";
import { REVIEW, REVIEW_REPLY } from "./review.actions.mjs";
import { ANNOUNCEMENT } from "./announcement.actions.mjs";
import { BLOG, BLOG_CATEGORY } from "./blog.actions.mjs";
import { OAUTH_CLIENT_APP } from "./oauth.actions.mjs";
import { LAMBDA_TEST } from "./lambdaTest.actions.mjs";
import { SPECIALIST } from "./specialist.actions.mjs";
import { PLATFORM } from "./platform.actions.mjs";
import { PATIENT } from "./patient.actions.mjs";
import { ADMIN } from "./admin.actions.mjs";
import { AUTH } from "./auth.actions.mjs";
import { LEAD } from "./lead.actions.mjs";

export const CRUD_ACTIONS = {
  OAUTH_CLIENT_APP,
  AUTH,
  ADMIN,
  PATIENT,
  TREATMENT_CATEGORY,
  TREATMENT,
  SUB_TREATMENT,
  TREATMENT_BRAND,
  TREATMENT_RESULT,
  CLINIC_CATEGORY,
  CLINIC_MANAGER,
  CLINIC,
  SPECIALIST,
  REVIEW,
  REVIEW_REPLY,
  BLOG,
  BLOG_CATEGORY,
  ANNOUNCEMENT,
  LEAD,
  CONVERSATION,
  CONVERSATION_CHAT,
  LAMBDA_TEST,
  PLATFORM,
};
