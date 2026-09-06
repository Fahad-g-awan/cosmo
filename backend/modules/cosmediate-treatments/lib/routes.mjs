import { TREATMENT_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/treatment.routes.mjs";

import {
  createBrands,
  deleteBrand,
  getBrand,
  getBrands,
  updateBrand,
} from "../controllers/brands.mjs";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.mjs";
import {
  getSubTreatment,
  getSubTreatments,
  getTreatmentsFilterData,
  syncClinicSubTreatments,
} from "../controllers/subTreatments.mjs";
import {
  createTreatmentResult,
  deleteTreatmentResult,
  getTreatmentResult,
  getTreatmentResults,
  updateTreatmentResult,
} from "../controllers/treatmentResults.mjs";
import {
  createTreatment,
  deleteTreatment,
  getTopSearchedTreatments,
  getTreatment,
  getTreatments,
  updateTreatment,
} from "../controllers/treatments.mjs";
import {
  listClinicTreatments,
  syncClinicTreatments,
} from "../controllers/clinicTreatment.mjs";
import {
  listClinicSpecialistTreatments,
  syncClinicAssignments,
} from "../controllers/clinicSpecialistTreatment.mjs";

export const ROUTES = new Map([
  /**
   * Categories
   */
  [R.CATEGORY_GET_ONE.key, getCategory],
  [R.CATEGORY_LIST.key, getCategories],
  [R.MANAGEMENT_CATEGORY_GET_ONE.key, getCategory],
  [R.MANAGEMENT_CATEGORY_LIST.key, getCategories],
  [R.CATEGORY_CREATE.key, createCategory],
  [R.CATEGORY_UPDATE.key, updateCategory],
  [R.CATEGORY_DELETE.key, deleteCategory],

  /**
   * Brands
   */
  [R.BRAND_GET_ONE.key, getBrand],
  [R.BRAND_LIST.key, getBrands],
  [R.MANAGEMENT_BRAND_GET_ONE.key, getBrand],
  [R.MANAGEMENT_BRAND_LIST.key, getBrands],
  [R.BRAND_CREATE.key, createBrands],
  [R.BRAND_UPDATE.key, updateBrand],
  [R.BRAND_DELETE.key, deleteBrand],

  /**
   * Treatments
   */
  [R.GET_ONE.key, getTreatment],
  [R.LIST.key, getTreatments],
  [R.TOP_SEARCHED.key, getTopSearchedTreatments],
  [R.MANAGEMENT_GET_ONE.key, getTreatment],
  [R.MANAGEMENT_LIST.key, getTreatments],
  [R.CREATE.key, createTreatment],
  [R.UPDATE.key, updateTreatment],
  [R.DELETE.key, deleteTreatment],

  /**
   * Treatment results
   */
  [R.RESULT_GET_ONE.key, getTreatmentResult],
  [R.RESULT_LIST.key, getTreatmentResults],
  [R.MANAGEMENT_RESULT_GET_ONE.key, getTreatmentResult],
  [R.MANAGEMENT_RESULT_LIST.key, getTreatmentResults],
  [R.RESULT_CREATE.key, createTreatmentResult],
  [R.RESULT_UPDATE.key, updateTreatmentResult],
  [R.RESULT_DELETE.key, deleteTreatmentResult],

  /**
   * ClinicTreatment hub
   */
  [R.CLINIC_TREATMENT_SYNC.key, syncClinicTreatments],
  [R.CLINIC_TREATMENT_LIST.key, listClinicTreatments],
  [R.CLINIC_SUB_TREATMENT_SYNC.key, syncClinicSubTreatments],
  [R.CLINIC_ASSIGNMENT_SYNC.key, syncClinicAssignments],
  [R.CLINIC_SPECIALIST_TREATMENT_LIST.key, listClinicSpecialistTreatments],
  [
    R.MANAGEMENT_CLINIC_SPECIALIST_TREATMENT_LIST.key,
    listClinicSpecialistTreatments,
  ],

  /**
   * Sub-treatments
   */
  [R.SUB_GET_ONE.key, getSubTreatment],
  [R.SUB_LIST.key, getSubTreatments],
  [R.MANAGEMENT_SUB_GET_ONE.key, getSubTreatment],
  [R.MANAGEMENT_SUB_LIST.key, getSubTreatments],
  [R.SUB_FILTERS.key, getTreatmentsFilterData],
]);
