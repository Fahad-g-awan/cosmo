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
import { useRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { respond, respondError } from "/opt/nodejs/lib/http/response.mjs";
import { resolveEnvStage } from "/opt/nodejs/lib/http/stage.utils.mjs";
import { runLayerTest } from "/opt/nodejs/lib/debug/layer-test.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { dispatchRoute } from "/opt/nodejs/lib/routing/router.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";
import { getPrisma } from "/opt/nodejs/lib/db/prisma/client.mjs";
import { parseBody } from "/opt/nodejs/lib/http/parse-body.mjs";

import { ROUTES } from "./lib/routes.mjs";

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
    const role = event.queryStringParameters?.role ?? null;

    const ctx = {
      env,
      role,
      config,
      authContext: getAuthorizerContext(event),
      authToken: getAuthToken(event),
      sessionId: getSessionId(event),
      reqBody,
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
      module: "cosmediate-authentication",
      error: e,
      config,
      event,
    });
    console.error("[auth] handler", e);
    return respondError(e, { headers: baseHeaders });
  }
};
