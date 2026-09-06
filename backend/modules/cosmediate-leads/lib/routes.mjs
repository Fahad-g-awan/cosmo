import { LEAD_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/lead.routes.mjs";
import {
  createLead,
  getLead,
  getLeads,
  updateLead,
  updateLeadStatus,
} from "../controllers/leads.mjs";

export const ROUTES = new Map([
  [R.GET_ONE.key, getLead],
  [R.LIST.key, getLeads],
  [R.CREATE.key, createLead],
  [R.UPDATE.key, updateLead],
  [R.UPDATE_STATUS.key, updateLeadStatus],
]);
