import {
  AdminCreate,
  AdminUpdate,
  AdminDelete,
  AdminBootstrap,
  AdminList,
} from "../schemas/admin.mjs";
import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";

export const ADMIN_SCHEMAS = {
  [CRUD_ACTIONS.ADMIN.LIST]: AdminList,
  [CRUD_ACTIONS.ADMIN.CREATE]: AdminCreate,
  [CRUD_ACTIONS.ADMIN.UPDATE]: AdminUpdate,
  [CRUD_ACTIONS.ADMIN.DELETE]: AdminDelete,
  [CRUD_ACTIONS.ADMIN.BOOTSTRAP]: AdminBootstrap,
};
