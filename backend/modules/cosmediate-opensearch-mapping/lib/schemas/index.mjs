import { buildClinicSpecialistTreatmentMapping } from "./clinic-specialist-treatment.schema.mjs";
import { buildTreatmentCategoryMapping } from "./treatment-category.schema.mjs";
import { buildEntitySearchStatMapping } from "./entity-search-stat.schema.mjs";
import { buildTreatmentResultMapping } from "./treatment-result.schema.mjs";
import { buildClinicTreatmentMapping } from "./clinic-treatment.schema.mjs";
import { buildClinicCategoryMapping } from "./clinic-category.schema.mjs";
import { buildTreatmentBrandMapping } from "./treatment-brand.schema.mjs";
import { buildClinicManagerMapping } from "./clinic-manager.schema.mjs";
import { buildSubTreatmentMapping } from "./sub-treatment.schema.mjs";
import { buildBlogCategoryMapping } from "./blog-category.schema.mjs";
import { buildAnnouncementMapping } from "./announcement.schema.mjs";
import { buildReviewReplyMapping } from "./review-reply.schema.mjs";
import { buildSpecialistMapping } from "./specialist.schema.mjs";
import { buildTreatmentMapping } from "./treatment.schema.mjs";
import { buildPatientMapping } from "./patient.schema.mjs";
import { buildReviewMapping } from "./review.schema.mjs";
import { buildClinicMapping } from "./clinic.schema.mjs";
import { buildAdminMapping } from "./admin.schema.mjs";
import { getBaseProperties } from "./base.schema.mjs";
import { buildBlogMapping } from "./blog.schema.mjs";
import { TARGET } from "../constants.mjs";

export const mappingFor = (target) => {
  const baseProps = getBaseProperties();

  switch (target) {
    case TARGET.ADMINS:
      return buildAdminMapping(baseProps);
    case TARGET.PATIENTS:
      return buildPatientMapping(baseProps);
    case TARGET.TREATMENT_CATEGORIES:
      return buildTreatmentCategoryMapping(baseProps);
    case TARGET.CLINIC_CATEGORIES:
      return buildClinicCategoryMapping(baseProps);
    case TARGET.CLINICS:
      return buildClinicMapping(baseProps);
    case TARGET.CLINIC_MANAGERS:
      return buildClinicManagerMapping(baseProps);
    case TARGET.SPECIALISTS:
      return buildSpecialistMapping(baseProps);
    case TARGET.TREATMENT_BRANDS:
      return buildTreatmentBrandMapping(baseProps);
    case TARGET.TREATMENTS:
      return buildTreatmentMapping(baseProps);
    case TARGET.CLINIC_TREATMENTS:
      return buildClinicTreatmentMapping(baseProps);
    case TARGET.CLINIC_SPECIALIST_TREATMENTS:
      return buildClinicSpecialistTreatmentMapping(baseProps);
    case TARGET.SUB_TREATMENTS:
      return buildSubTreatmentMapping(baseProps);
    case TARGET.TREATMENT_RESULTS:
      return buildTreatmentResultMapping(baseProps);
    case TARGET.BLOGS:
      return buildBlogMapping(baseProps);
    case TARGET.ANNOUNCEMENTS:
      return buildAnnouncementMapping(baseProps);
    case TARGET.BLOG_CATEGORIES:
      return buildBlogCategoryMapping(baseProps);
    case TARGET.ENTITY_SEARCH_STATS:
      return buildEntitySearchStatMapping(baseProps);
    case TARGET.REVIEWS:
      return buildReviewMapping(baseProps);
    case TARGET.REVIEW_REPLIES:
      return buildReviewReplyMapping(baseProps);
    default:
      throw new Error(`Unknown TARGET: ${target}`);
  }
};
