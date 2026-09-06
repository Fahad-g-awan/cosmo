import { PATIENTS_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/patients.routes.mjs";

import {
  createPatientHandler,
  updatePatientHandler,
  listPatientsHandler,
  deletePatientHandler,
  getPatient,
} from "../controllers/patient.mjs";

export const ROUTES = new Map([
  [R.GET_ONE.key, getPatient],
  [R.LIST.key, listPatientsHandler],
  [R.CREATE.key, createPatientHandler],
  [R.UPDATE.key, updatePatientHandler],
  [R.DELETE.key, deletePatientHandler],
]);
