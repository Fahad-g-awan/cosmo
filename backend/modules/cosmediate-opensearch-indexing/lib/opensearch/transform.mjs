import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { mapClinicSpecialistTreatmentSearchDocument } from "./mappers/clinic-specialist-treatment.mapper.mjs";
import { mapTreatmentCategorySearchDocument } from "./mappers/treatment-category.mapper.mjs";
import { mapEntitySearchStatSearchDocument } from "./mappers/entity-search-stat.mapper.mjs";
import { mapTreatmentResultSearchDocument } from "./mappers/treatment-result.mapper.mjs";
import { mapClinicTreatmentSearchDocument } from "./mappers/clinic-treatment.mapper.mjs";
import { mapClinicCategorySearchDocument } from "./mappers/clinic-category.mapper.mjs";
import { mapTreatmentBrandSearchDocument } from "./mappers/treatment-brand.mapper.mjs";
import { mapClinicManagerSearchDocument } from "./mappers/clinic-manager.mapper.mjs";
import { mapSubTreatmentSearchDocument } from "./mappers/sub-treatment.mapper.mjs";
import { mapBlogCategorySearchDocument } from "./mappers/blog-category.mapper.mjs";
import { mapAnnouncementSearchDocument } from "./mappers/announcement.mapper.mjs";
import { mapReviewReplySearchDocument } from "./mappers/review-reply.mapper.mjs";
import { mapSpecialistSearchDocument } from "./mappers/specialist.mapper.mjs";
import { mapTreatmentSearchDocument } from "./mappers/treatment.mapper.mjs";
import { mapPatientSearchDocument } from "./mappers/patient.mapper.mjs";
import { mapReviewSearchDocument } from "./mappers/review.mapper.mjs";
import { mapClinicSearchDocument } from "./mappers/clinic.mapper.mjs";
import { mapAdminSearchDocument } from "./mappers/admin.mapper.mjs";
import { mapBlogSearchDocument } from "./mappers/blog.mapper.mjs";
import { getBaseDocData } from "./documents.mjs";

const TRANSFORMERS = {
  [ENTITY_TYPE.ADMIN]: mapAdminSearchDocument,
  [ENTITY_TYPE.PATIENT]: mapPatientSearchDocument,
  [ENTITY_TYPE.TREATMENT]: mapTreatmentSearchDocument,
  [ENTITY_TYPE.CLINIC_TREATMENT]: mapClinicTreatmentSearchDocument,
  [ENTITY_TYPE.TREATMENT_CATEGORY]: mapTreatmentCategorySearchDocument,
  [ENTITY_TYPE.CLINIC_CATEGORY]: mapClinicCategorySearchDocument,
  [ENTITY_TYPE.CLINIC]: mapClinicSearchDocument,
  [ENTITY_TYPE.CLINIC_MANAGER]: mapClinicManagerSearchDocument,
  [ENTITY_TYPE.SPECIALIST]: mapSpecialistSearchDocument,
  [ENTITY_TYPE.TREATMENT_BRAND]: mapTreatmentBrandSearchDocument,
  [ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT]:
    mapClinicSpecialistTreatmentSearchDocument,
  [ENTITY_TYPE.SUB_TREATMENT]: mapSubTreatmentSearchDocument,
  [ENTITY_TYPE.TREATMENT_RESULT]: mapTreatmentResultSearchDocument,
  [ENTITY_TYPE.BLOG]: mapBlogSearchDocument,
  [ENTITY_TYPE.BLOG_CATEGORY]: mapBlogCategorySearchDocument,
  [ENTITY_TYPE.ANNOUNCEMENT]: mapAnnouncementSearchDocument,
  [ENTITY_TYPE.ENTITY_SEARCH_STATS]: mapEntitySearchStatSearchDocument,
  [ENTITY_TYPE.REVIEW]: mapReviewSearchDocument,
  [ENTITY_TYPE.REVIEW_REPLY]: mapReviewReplySearchDocument,
};

export const transformToSearchDocument = (data, entityType) => {
  const baseDoc = getBaseDocData(data);
  const mapper = TRANSFORMERS[entityType];

  if (!mapper) {
    throw new Error(
      `[transformToSearchDocument] Unsupported entity type: ${entityType}`,
    );
  }

  return mapper(baseDoc, data);
};
