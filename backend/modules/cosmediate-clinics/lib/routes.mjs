import { CLINIC_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/clinic.routes.mjs";
import {
  createCategory,
  updateCategory,
  getCategories,
  deleteCategory,
  getCategory,
} from "../controllers/category.mjs";
import {
  createManager,
  updateManager,
  getManagers,
  deleteManager,
  getManager,
} from "../controllers/manager.mjs";
import {
  createClinic,
  updateClinic,
  getClinic,
  getClinics,
  deleteClinic,
  listClinicsByTreatment,
  getPopularClinics,
  getTopSearchedClinics,
} from "../controllers/clinic.mjs";

export const ROUTES = new Map([
  [R.CATEGORY_GET_ONE.key, getCategory],
  [R.CATEGORY_LIST.key, getCategories],
  [R.MANAGEMENT_CATEGORY_GET_ONE.key, getCategory],
  [R.MANAGEMENT_CATEGORY_LIST.key, getCategories],
  [R.CATEGORY_CREATE.key, createCategory],
  [R.CATEGORY_UPDATE.key, updateCategory],
  [R.CATEGORY_DELETE.key, deleteCategory],
  [R.MANAGER_GET_ONE.key, getManager],
  [R.MANAGER_LIST.key, getManagers],
  [R.MANAGER_CREATE.key, createManager],
  [R.MANAGER_UPDATE.key, updateManager],
  [R.MANAGER_DELETE.key, deleteManager],
  [R.GET_ONE.key, getClinic],
  [R.LIST.key, getClinics],
  [R.POPULAR.key, getPopularClinics],
  [R.TOP_SEARCHED.key, getTopSearchedClinics],
  [R.BY_TREATMENT.key, listClinicsByTreatment],
  [R.MANAGEMENT_GET_ONE.key, getClinic],
  [R.MANAGEMENT_LIST.key, getClinics],
  [R.MANAGEMENT_POPULAR.key, getPopularClinics],
  [R.MANAGEMENT_BY_TREATMENT.key, listClinicsByTreatment],
  [R.CREATE.key, createClinic],
  [R.UPDATE.key, updateClinic],
  [R.DELETE.key, deleteClinic],
]);
