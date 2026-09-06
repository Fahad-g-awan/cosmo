import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";
import {
  ClinicCategoryCreate,
  ClinicCategoryUpdate,
  ClinicCategoryDelete,
  ClinicCategoryList,
} from "../schemas/clinic/category.mjs";
import {
  ManagerCreate,
  ManagerUpdate,
  ManagerDelete,
  ManagerList,
} from "../schemas/clinic/manager.mjs";
import {
  ClinicCreate,
  ClinicUpdate,
  ClinicDelete,
  ClinicGetByTreatment,
  ClinicList,
} from "../schemas/clinic/clinic.mjs";

export const CLINIC_SCHEMAS = {
  [CRUD_ACTIONS.CLINIC_CATEGORY.CREATE]: ClinicCategoryCreate,
  [CRUD_ACTIONS.CLINIC_CATEGORY.UPDATE]: ClinicCategoryUpdate,
  [CRUD_ACTIONS.CLINIC_CATEGORY.DELETE]: ClinicCategoryDelete,
  [CRUD_ACTIONS.CLINIC_CATEGORY.LIST]: ClinicCategoryList,

  [CRUD_ACTIONS.CLINIC_MANAGER.CREATE]: ManagerCreate,
  [CRUD_ACTIONS.CLINIC_MANAGER.UPDATE]: ManagerUpdate,
  [CRUD_ACTIONS.CLINIC_MANAGER.DELETE]: ManagerDelete,
  [CRUD_ACTIONS.CLINIC_MANAGER.LIST]: ManagerList,

  [CRUD_ACTIONS.CLINIC.CREATE]: ClinicCreate,
  [CRUD_ACTIONS.CLINIC.UPDATE]: ClinicUpdate,
  [CRUD_ACTIONS.CLINIC.DELETE]: ClinicDelete,
  [CRUD_ACTIONS.CLINIC.LIST]: ClinicList,
  [CRUD_ACTIONS.CLINIC.GET_BY_TREATMENT]: ClinicGetByTreatment,
};
