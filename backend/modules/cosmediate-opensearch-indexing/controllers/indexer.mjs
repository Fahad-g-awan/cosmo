import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { indexClinicSpecialistTreatment } from "../domains/clinic-specialist-treatment/indexClinicSpecialistTreatment.mjs";
import { indexClinicTreatment } from "../domains/clinic-treatment/indexClinicTreatment.mjs";
import { indexTreatmentCategory } from "../domains/treatment-category/indexTreatmentCategory.mjs";
import { indexEntitySearchStat } from "../domains/entity-search-stat/indexEntitySearchStat.mjs";
import { indexSubTreatment } from "../domains/sub-treatment/indexSubTreatment.mjs";
import { indexTreatmentResult } from "../domains/treatment-result/indexTreatmentResult.mjs";
import { indexTreatmentBrand } from "../domains/treatment-brand/indexTreatmentBrand.mjs";
import { indexClinicCategory } from "../domains/clinic-category/indexClinicCategory.mjs";
import { indexClinicManager } from "../domains/clinic-manager/indexClinicManager.mjs";
import { indexBlogCategory } from "../domains/blog-category/indexBlogCategory.mjs";
import { indexAnnouncement } from "../domains/announcement/indexAnnouncement.mjs";
import { indexReviewReply } from "../domains/review-reply/indexReviewReply.mjs";
import { indexSpecialist } from "../domains/specialist/indexSpecialist.mjs";
import { indexTreatment } from "../domains/treatment/indexTreatment.mjs";
import { indexPatient } from "../domains/patient/patient.indexer.mjs";
import { indexClinic } from "../domains/clinic/indexClinic.mjs";
import { indexReview } from "../domains/review/indexReview.mjs";
import { indexAdmin } from "../domains/admin/admin.indexer.mjs";
import { indexBlog } from "../domains/blog/indexBlog.mjs";

export const routeIndexer = async () => {
  const { entityType } = getRequestContext();

  switch (entityType) {
    case ENTITY_TYPE.ADMIN:
      return indexAdmin();
    case ENTITY_TYPE.PATIENT:
      return indexPatient();
    case ENTITY_TYPE.TREATMENT:
      return indexTreatment();
    case ENTITY_TYPE.CLINIC_TREATMENT:
      return indexClinicTreatment();
    case ENTITY_TYPE.CLINIC_SPECIALIST_TREATMENT:
      return indexClinicSpecialistTreatment();
    case ENTITY_TYPE.TREATMENT_CATEGORY:
      return indexTreatmentCategory();
    case ENTITY_TYPE.CLINIC_CATEGORY:
      return indexClinicCategory();
    case ENTITY_TYPE.CLINIC:
      return indexClinic();
    case ENTITY_TYPE.CLINIC_MANAGER:
      return indexClinicManager();
    case ENTITY_TYPE.SPECIALIST:
      return indexSpecialist();
    case ENTITY_TYPE.TREATMENT_BRAND:
      return indexTreatmentBrand();
    case ENTITY_TYPE.SUB_TREATMENT:
      return indexSubTreatment();
    case ENTITY_TYPE.TREATMENT_RESULT:
      return indexTreatmentResult();
    case ENTITY_TYPE.BLOG:
      return indexBlog();
    case ENTITY_TYPE.BLOG_CATEGORY:
      return indexBlogCategory();
    case ENTITY_TYPE.ANNOUNCEMENT:
      return indexAnnouncement();
    case ENTITY_TYPE.ENTITY_SEARCH_STATS:
      return indexEntitySearchStat();
    case ENTITY_TYPE.REVIEW:
      return indexReview();
    case ENTITY_TYPE.REVIEW_REPLY:
      return indexReviewReply();
    default:
      console.log(
        "[routeIndexer] Skip: entity not indexed by this lambda",
        entityType,
      );
      return { message: "skipped", entityType };
  }
};
