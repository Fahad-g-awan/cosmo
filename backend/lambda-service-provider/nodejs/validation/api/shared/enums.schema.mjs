import { BLOG_STATUS } from "../../../constants/domain/blog.constants.mjs";
import {
  CLINIC_STATUS,
  CLINIC_TYPES,
} from "../../../constants/domain/clinic.constants.mjs";
import { SPECIALIST_STATUS } from "../../../constants/domain/specialist.constants.mjs";
import { WORKING_TYPES } from "../../../constants/domain/shared.constants.mjs";
import {
  LEAD_STATUS,
  LEAD_SOURCE,
  LEAD_TYPE,
} from "../../../constants/domain/lead.constants.mjs";
import { REVIEW_STATUS } from "../../../constants/domain/review.constants.mjs";
import { USER_STATUS } from "../../../constants/auth/status.constants.mjs";
import { USER_ROLES } from "../../../constants/auth/roles.constants.mjs";

export const enums = {
  userStatus: Object.values(USER_STATUS),
  clinicTypes: Object.values(CLINIC_TYPES),
  roles: Object.values(USER_ROLES),
  clinicStatus: Object.values(CLINIC_STATUS),
  specialistStatus: Object.values(SPECIALIST_STATUS),
  workingTypes: Object.values(WORKING_TYPES),
  reviewStatus: Object.values(REVIEW_STATUS),
  blogStatus: Object.values(BLOG_STATUS),

  leadStatus: Object.values(LEAD_STATUS),
  leadSource: Object.values(LEAD_SOURCE),
  leadType: Object.values(LEAD_TYPE),
};

export const Gender = {
  type: "string",
  enum: ["MALE", "FEMALE", "OTHER"],
};

/** Optional gender — empty / null clears. */
export const ClearableGender = {
  anyOf: [
    { type: "null" },
    { type: "string", maxLength: 0 },
    Gender,
  ],
};
