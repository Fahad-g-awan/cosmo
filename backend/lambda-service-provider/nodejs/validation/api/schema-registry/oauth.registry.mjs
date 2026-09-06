import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";
import {
  oAuthClientAppCreate,
  oAuthClientAppDelete,
  oAuthClientAppUpdate,
} from "../schemas/oAuthClientApp.mjs";

export const OAUTH_SCHEMAS = {
  [CRUD_ACTIONS.OAUTH_CLIENT_APP.CREATE]: oAuthClientAppCreate,
  [CRUD_ACTIONS.OAUTH_CLIENT_APP.UPDATE]: oAuthClientAppUpdate,
  [CRUD_ACTIONS.OAUTH_CLIENT_APP.DELETE]: oAuthClientAppDelete,
};
