import { SPECIALISTS_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/specialists.routes.mjs";
import {
  createSpecialist,
  updateSpecialist,
  getSpecialists,
  deleteSpecialist,
  listSpecialistsByTreatment,
  getSpecialist,
  getTopSearchedSpecialists,
} from "../controllers/specialist.mjs";

export const ROUTES = new Map([
  [R.GET_ONE.key, getSpecialist],
  [R.LIST.key, getSpecialists],
  [R.TOP_SEARCHED.key, getTopSearchedSpecialists],
  [R.BY_TREATMENT.key, listSpecialistsByTreatment],
  [R.MANAGEMENT_GET_ONE.key, getSpecialist],
  [R.MANAGEMENT_LIST.key, getSpecialists],
  [R.MANAGEMENT_TOP_SEARCHED.key, getTopSearchedSpecialists],
  [R.MANAGEMENT_BY_TREATMENT.key, listSpecialistsByTreatment],
  [R.CREATE.key, createSpecialist],
  [R.UPDATE.key, updateSpecialist],
  [R.DELETE.key, deleteSpecialist],
]);
