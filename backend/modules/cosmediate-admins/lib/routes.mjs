import { ADMIN_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/admin.routes.mjs";

import {
  createAdminHandler,
  updateAdminHandler,
  getAdmins,
  deleteAdminHandler,
  getAdmin,
} from "../controllers/admin.mjs";
import { bootstrapAdminHandler } from "../controllers/bootstrap.mjs";

export const ROUTES = new Map([
  [R.BOOTSTRAP.key, bootstrapAdminHandler],
  [R.GET_ONE.key, getAdmin],
  [R.LIST.key, getAdmins],
  [R.CREATE.key, createAdminHandler],
  [R.UPDATE.key, updateAdminHandler],
  [R.DELETE.key, deleteAdminHandler],
]);
