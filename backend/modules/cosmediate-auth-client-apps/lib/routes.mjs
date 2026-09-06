import { OAUTH_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/oauth.routes.mjs";
import {
  getClientApp,
  getClientApps,
  createClientApp,
  updateClientApp,
  deleteClientApp,
} from "../controllers/oAuthClientApps.mjs";

export const ROUTES = new Map([
  [R.GET_ONE.key, getClientApp],
  [R.LIST.key, getClientApps],
  [R.CREATE.key, createClientApp],
  [R.UPDATE.key, updateClientApp],
  [R.DELETE.key, deleteClientApp],
]);
