import { runLayerTest } from "/opt/nodejs/lib/debug/layer-test.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { resolveEnvStage } from "/opt/nodejs/lib/http/stage.utils.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";

import { denyFromAuthError, denyAuthorizationFailed } from "./lib/errors.mjs";
import { authorizeRequest } from "./lib/authorize-request.mjs";
import { tryDevBypass } from "./lib/dev-bypass.mjs";

/**
 * API Gateway authorizer.
 *
 * On success, context shape:
 *   identityId, cognitoSub, email, role, entityId, perms (space-separated)
 *
 * Consumers: `getAuthorizerContext(event)` in the utility layer.
 *
 * Route access: global ROUTE_REGISTRY + ROUTE_POLICIES + canAccessRegisteredRoute
 * (PUBLIC, AUTH_ONLY, PERMISSIONED, super-access `*:*`).
 *
 * Dev only: AUTHORIZER_DEV_BYPASS=true — stub allow without JWT/Postgres.
 */
export const handler = async (event) => {
  let config;

  try {
    runLayerTest(event);

    const bypass = tryDevBypass();
    if (bypass) return bypass;

    return await authorizeRequest(event);
  } catch (err) {
    try {
      const env = resolveEnvStage(event);
      config = await loadConfig(env);
    } catch (_) {
      /* config unavailable for dev alert */
    }

    await reportDevAlert({
      module: "cosmediate-api-authorizer",
      error: err,
      config,
      event,
    });
    console.error("Authorization error:", err);

    const jwtDeny = denyFromAuthError(err);
    if (jwtDeny) return jwtDeny;

    return denyAuthorizationFailed();
  }
};
