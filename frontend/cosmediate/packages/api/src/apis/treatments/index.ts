// Category APIs
export {
  getTreatmentCategoryApi,
  getTreatmentCategoriesApi,
  createTreatmentCategoryApi,
  updateTreatmentCategoryApi,
  deleteTreatmentCategoryApi,
} from "./categories.api";

// Brand APIs
export {
  getBrandApi,
  getBrandsApi,
  createBrandsApi,
  updateBrandApi,
  deleteBrandApi,
} from "./brands.api";

// Treatment APIs
export {
  getTreatmentApi,
  getTreatmentsApi,
  createTreatmentApi,
  updateTreatmentApi,
  deleteTreatmentApi,
  getTopSearchedTreatmentsApi,
  listClinicTreatmentsApi,
  syncClinicTreatmentsApi,
} from "./treatments.api";

// Clinic specialist treatment (assignment) APIs
export {
  listClinicSpecialistTreatmentsApi,
  listManagementClinicSpecialistTreatmentsApi,
  syncClinicAssignmentsApi,
} from "./clinicSpecialistTreatments.api";

// Sub-Treatment APIs
export {
  getSubTreatmentApi,
  getSubTreatmentsApi,
  getPriceFiltersDataApi,
  syncClinicSubTreatmentsApi,
} from "./subTreatments.api";

// Treatment Result APIs
export {
  getTreatmentResultApi,
  getTreatmentResultsApi,
  createTreatmentResultApi,
  updateTreatmentResultApi,
  deleteTreatmentResultApi,
} from "./treatmentResults.api";
