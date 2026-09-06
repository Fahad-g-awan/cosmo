import {
  PatientCreate,
  PatientUpdate,
  PatientDelete,
  PatientList,
} from "../schemas/patient.mjs";
import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";

export const PATIENT_SCHEMAS = {
  [CRUD_ACTIONS.PATIENT.CREATE]: PatientCreate,
  [CRUD_ACTIONS.PATIENT.UPDATE]: PatientUpdate,
  [CRUD_ACTIONS.PATIENT.DELETE]: PatientDelete,
  [CRUD_ACTIONS.PATIENT.LIST]: PatientList,
};
