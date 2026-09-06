import {
  options as preflightOptions,
  getOrigin,
  cors,
} from "/opt/nodejs/lib/security/cors.mjs";
import {
  getAuthToken,
  getSessionId,
} from "/opt/nodejs/lib/http/_utils/headers.utils.mjs";
import { getAuthorizerContext } from "/opt/nodejs/lib/auth/authorization/auth-context.utils.mjs";
import { PLATFORM_ROUTE_DEFS } from "/opt/nodejs/config/routes/platform.routes.mjs";
import { ROUTE_ACCESS } from "/opt/nodejs/config/routes/route-access.constants.mjs";
import {
  dispatchRoute,
  normalizeRoute,
} from "/opt/nodejs/lib/routing/router.mjs";
import { useRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { respond, respondError } from "/opt/nodejs/lib/http/response.mjs";
import { resolveEnvStage } from "/opt/nodejs/lib/http/stage.utils.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { runLayerTest } from "/opt/nodejs/lib/debug/layer-test.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";
import { getPrisma } from "/opt/nodejs/lib/db/prisma/client.mjs";
import { parseBody } from "/opt/nodejs/lib/http/parse-body.mjs";

import { ROUTES } from "./lib/routes.mjs";

const PUBLIC_ROUTE_KEYS = new Set(
  Object.values(PLATFORM_ROUTE_DEFS)
    .filter((def) => def.access === ROUTE_ACCESS.PUBLIC)
    .map((def) => def.key),
);

export const handler = async (event) => {
  runLayerTest(event);

  if (event.httpMethod === "OPTIONS") return preflightOptions(event);

  const origin = getOrigin(event);
  if (!origin) {
    return respond({
      statusCode: 403,
      payload: { error: "Origin not allowed" },
      headers: { Vary: "Origin" },
    });
  }

  const baseHeaders = cors(origin);

  let config;

  try {
    const env = resolveEnvStage(event);
    config = await loadConfig(env);
    const reqBody = await parseBody(event, env, config);
    const routeKey = normalizeRoute(event, env);

    const authContext = getAuthorizerContext(event);
    if (!authContext && !PUBLIC_ROUTE_KEYS.has(routeKey)) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["Unauthorized access"],
      });
    }

    const ctx = {
      env,
      config,
      authContext,
      authToken: getAuthToken(event),
      sessionId: getSessionId(event),
      reqBody,
      routeKey,
      queryParams: {
        targetRole: event.queryStringParameters?.targetRole ?? null,
        id: event.queryStringParameters?.id ?? null,
      },
      baseHeaders,
      prisma: await getPrisma(config.POSTGRES_DB_URL),
    };

    return await useRequestContext(ctx, async () => {
      const response = await dispatchRoute(event, env, ROUTES);
      const statusCode =
        typeof response?.statusCode === "number" ? response.statusCode : 200;

      return respond({
        statusCode,
        payload: response?.data ?? response ?? {},
        headers: response?.headers
          ? { ...baseHeaders, ...response.headers }
          : baseHeaders,
        cookies: response?.cookies ?? [],
      });
    });
  } catch (e) {
    await reportDevAlert({
      module: "cosmediate-platform",
      error: e,
      config,
      event,
    });
    console.error("[platform] handler", e);
    return respondError(e, { headers: baseHeaders });
  }
};
