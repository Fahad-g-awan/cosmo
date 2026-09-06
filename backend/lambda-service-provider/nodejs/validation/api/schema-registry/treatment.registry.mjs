import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";
import {
  ClinicTreatmentList,
  ClinicTreatmentSync,
} from "../schemas/treatment/clinicTreatment.mjs";
import {
  ClinicAssignmentSync,
  ClinicSpecialistTreatmentList,
} from "../schemas/treatment/clinicAssignment.mjs";
import {
  TreatmentCategoryCreate,
  TreatmentCategoryUpdate,
  TreatmentCategoryDelete,
  TreatmentCategoryList,
} from "../schemas/treatment/category.mjs";
import {
  TreatmentCreate,
  TreatmentUpdate,
  TreatmentDelete,
  TreatmentList,
} from "../schemas/treatment/treatment.mjs";
import {
  ClinicSubTreatmentSync,
  SubTreatmentList,
} from "../schemas/treatment/clinicSubTreatment.mjs";
import {
  TreatmentBrandsCreate,
  TreatmentBrandsDelete,
  TreatmentBrandsUpdate,
  TreatmentBrandsList,
} from "../schemas/treatment/brand.mjs";
import {
  TreatmentResultCreate,
  TreatmentResultUpdate,
  TreatmentResultDelete,
  TreatmentResultList,
} from "../schemas/treatment/treatmentResult.mjs";

export const TREATMENT_SCHEMAS = {
  [CRUD_ACTIONS.TREATMENT_CATEGORY.CREATE]: TreatmentCategoryCreate,
  [CRUD_ACTIONS.TREATMENT_CATEGORY.UPDATE]: TreatmentCategoryUpdate,
  [CRUD_ACTIONS.TREATMENT_CATEGORY.DELETE]: TreatmentCategoryDelete,
  [CRUD_ACTIONS.TREATMENT_CATEGORY.LIST]: TreatmentCategoryList,

  [CRUD_ACTIONS.TREATMENT.CREATE]: TreatmentCreate,
  [CRUD_ACTIONS.TREATMENT.UPDATE]: TreatmentUpdate,
  [CRUD_ACTIONS.TREATMENT.DELETE]: TreatmentDelete,
  [CRUD_ACTIONS.TREATMENT.LIST]: TreatmentList,
  [CRUD_ACTIONS.TREATMENT.CLINIC_TREATMENT_SYNC]: ClinicTreatmentSync,
  [CRUD_ACTIONS.TREATMENT.CLINIC_TREATMENT_LIST]: ClinicTreatmentList,
  [CRUD_ACTIONS.TREATMENT.CLINIC_ASSIGNMENT_SYNC]: ClinicAssignmentSync,
  [CRUD_ACTIONS.TREATMENT.CLINIC_SPECIALIST_TREATMENT_LIST]:
    ClinicSpecialistTreatmentList,

  [CRUD_ACTIONS.SUB_TREATMENT.CLINIC_SYNC]: ClinicSubTreatmentSync,
  [CRUD_ACTIONS.SUB_TREATMENT.LIST]: SubTreatmentList,

  [CRUD_ACTIONS.TREATMENT_BRAND.CREATE]: TreatmentBrandsCreate,
  [CRUD_ACTIONS.TREATMENT_BRAND.UPDATE]: TreatmentBrandsUpdate,
  [CRUD_ACTIONS.TREATMENT_BRAND.DELETE]: TreatmentBrandsDelete,
  [CRUD_ACTIONS.TREATMENT_BRAND.LIST]: TreatmentBrandsList,

  [CRUD_ACTIONS.TREATMENT_RESULT.CREATE]: TreatmentResultCreate,
  [CRUD_ACTIONS.TREATMENT_RESULT.UPDATE]: TreatmentResultUpdate,
  [CRUD_ACTIONS.TREATMENT_RESULT.DELETE]: TreatmentResultDelete,
  [CRUD_ACTIONS.TREATMENT_RESULT.LIST]: TreatmentResultList,
};
