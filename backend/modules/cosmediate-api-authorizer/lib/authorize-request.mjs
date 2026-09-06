import {
  ROUTE_REGISTRY,
  ROUTE_POLICIES,
} from "/opt/nodejs/config/routes/index.mjs";
import { canAccessRegisteredRoute } from "/opt/nodejs/lib/auth/authorization/route-access.mjs";
import { USER_STATUS } from "/opt/nodejs/constants/auth/status.constants.mjs";
import { getAuthToken } from "/opt/nodejs/lib/http/_utils/headers.utils.mjs";
import { resolveEnvStage } from "/opt/nodejs/lib/http/stage.utils.mjs";
import { normalizeRoute } from "/opt/nodejs/lib/routing/router.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";

import { buildAuthorizerContext, getIdentityPerms } from "./build-context.mjs";
import { resolveIdentityForAccessToken } from "./identity-resolver.mjs";
import { getVerifier, allow, deny } from "./utils.mjs";

/**
 * Authorize a request using the Cognito JWT verifier and the identity resolver.
 *
 * @param {Object} event
 * @returns {Object} response object
 */
export async function authorizeRequest(event) {
  const env = resolveEnvStage(event);
  const config = await loadConfig(env);
  const authToken = getAuthToken(event);

  if (!authToken) {
    return deny({
      context: { reason: "Unauthorized Access: Missing token" },
      headers: {},
      message: "Unauthorized Access: Missing token",
    });
  }

  const verifier = getVerifier(env, config);
  const decoded = await verifier.verify(authToken);
  const { sub: cognitoSub } = decoded;

  if (!cognitoSub) {
    return deny({
      context: { reason: "Unauthorized Access: Invalid credentials" },
      headers: {},
      message: "Unauthorized Access: Invalid credentials",
    });
  }

  let identity;
  let reconciledViaEmail = false;

  try {
    const resolved = await resolveIdentityForAccessToken(
      config.POSTGRES_DB_URL,
      cognitoSub,
      decoded,
    );
    reconciledViaEmail = resolved?.reconcile === true;

    if (resolved?.conflictingEmail === true) {
      return deny({
        context: {
          reason:
            "Unauthorized Access: Token cognito_sub does not match Identity for this email (stale token or incomplete merge)",
        },
        headers: {},
        message:
          "Unauthorized Access: Credential mismatch — obtain a fresh token",
      });
    }

    identity = resolved?.identity ?? null;
  } catch (_dbErr) {
    return deny({
      context: {
        reason: "Unauthorized Access: Identity lookup failed",
      },
      headers: {},
      message:
        "Unauthorized Access: Authorization failed — transient identity lookup error",
    });
  }

  if (!identity || identity.deleted) {
    return deny({
      context: {
        reason: reconciledViaEmail
          ? "Unauthorized Access: Invalid credentials after email reconcile"
          : "Unauthorized Access: Invalid credentials",
      },
      headers: {},
      message: "Unauthorized Access: Invalid credentials",
    });
  }

  if (identity.status === USER_STATUS.BLOCKED) {
    return deny({
      context: { reason: "Unauthorized Access: Account blocked" },
      headers: {},
      message: "Unauthorized Access: Account blocked",
    });
  }

  if (!identity.role || !identity.entityId) {
    return deny({
      context: {
        reason:
          "Unauthorized Access: Account setup incomplete — profile not linked",
      },
      headers: {},
      message: "Unauthorized Access: Account setup incomplete",
    });
  }

  const routeKey = normalizeRoute(event, env);
  const routeDef = ROUTE_REGISTRY[routeKey] ?? null;
  const have = getIdentityPerms(identity);
  const ok = canAccessRegisteredRoute(routeDef, have, ROUTE_POLICIES);

  if (!ok) {
    if (routeDef) {
      console.warn(
        `[authorizer] Access denied routeKey=${routeKey} access=${routeDef.access} role=${identity.role}`,
      );
    } else {
      console.warn(`[authorizer] Unknown route routeKey=${routeKey}`);
    }

    return deny({
      context: {
        reason: routeDef
          ? "Unauthorized Access: Access Denied"
          : "Unauthorized Access: Unknown route",
      },
      headers: {},
      message: routeDef
        ? "Unauthorized Access: Access Denied"
        : "Unauthorized Access: Unknown route",
    });
  }

  return allow({
    context: buildAuthorizerContext(identity),
    headers: {},
    message: "Authorized",
  });
}
