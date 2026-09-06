import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";
import {
  LeadCreate,
  LeadDelete,
  LeadStatusUpdate,
  LeadUpdate,
} from "../schemas/lead.mjs";

export const LEAD_SCHEMAS = {
  [CRUD_ACTIONS.LEAD.CREATE]: LeadCreate,
  [CRUD_ACTIONS.LEAD.UPDATE]: LeadUpdate,
  [CRUD_ACTIONS.LEAD.STATUS_UPDATE]: LeadStatusUpdate,
  [CRUD_ACTIONS.LEAD.DELETE]: LeadDelete,
};
