import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";
import {
  SpecialistCreate,
  SpecialistUpdate,
  SpecialistDelete,
  SpecialistGetByTreatment,
  SpecialistList,
} from "../schemas/specialist.mjs";

export const SPECIALIST_SCHEMAS = {
  [CRUD_ACTIONS.SPECIALIST.CREATE]: SpecialistCreate,
  [CRUD_ACTIONS.SPECIALIST.UPDATE]: SpecialistUpdate,
  [CRUD_ACTIONS.SPECIALIST.DELETE]: SpecialistDelete,
  [CRUD_ACTIONS.SPECIALIST.LIST]: SpecialistList,
  [CRUD_ACTIONS.SPECIALIST.GET_BY_TREATMENT]: SpecialistGetByTreatment,
};
