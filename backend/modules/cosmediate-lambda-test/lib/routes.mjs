import { LAMBDA_TEST_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/lambdaTest.routes.mjs";

import { getClientsProbe } from "../controllers/clients-probe.mjs";
import { postRouteAccess } from "../controllers/route-access.mjs";
import { getAuthProbe } from "../controllers/auth-probe.mjs";
import { postValidate } from "../controllers/validation.mjs";
import { postGrants } from "../controllers/grants.mjs";
import { getRoutes } from "../controllers/registry.mjs";
import { postUpload } from "../controllers/upload.mjs";
import { postErrors } from "../controllers/errors.mjs";
import { getHealth } from "../controllers/health.mjs";
import { getEnv } from "../controllers/env.mjs";

export const ROUTES = new Map([
  [R.HEALTH.key, getHealth],
  [R.ENV.key, getEnv],
  [R.CLIENTS.key, getClientsProbe],
  [R.AUTH_PROBE.key, getAuthProbe],
  [R.VALIDATE.key, postValidate],
  [R.ROUTE_ACCESS.key, postRouteAccess],
  [R.GRANTS.key, postGrants],
  [R.ROUTES.key, getRoutes],
  [R.UPLOAD.key, postUpload],
  [R.ERRORS.key, postErrors],
]);
