import {
  dispatchRoute,
  options as preflightOptions,
  getOrigin,
  resolveEnvStage,
  cors,
} from "/opt/nodejs/lib/api/utils.mjs";
import {
  respond,
  respondError,
} from "/opt/nodejs/lib/http/response.mjs";
import {
  runLayerTest,
} from "/opt/nodejs/lib/debug/layer-test.mjs";
import {
  getAuthToken,
  getSessionId,
} from "/opt/nodejs/lib/http/_headers.utils.mjs";
import { getOpenSearchClient } from "/opt/nodejs/lib/openSearch/config.mjs";
import { getAuthorizerContext } from "/opt/nodejs/lib/auth/authorization/auth-context.utils.mjs";
import { getPrisma } from "/opt/nodejs/lib/db/prisma/client.mjs";
import { parseBody } from "/opt/nodejs/lib/api/parseBody.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { useRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";

import { ROUTES } from "./lib/routes.mjs";

export const handler = async (event) => {
  runLayerTest(event);
  if (event.httpMethod === "OPTIONS") return preflightOptions(event);
  const origin = getOrigin(event);
  if (!origin)
    return respond({
      statusCode: 403,
      payload: { error: "Origin not allowed" },
      headers: { Vary: "Origin" },
    });

  const baseHeaders = cors(origin);

  try {
    const {
      id = null,
      limit = 10,
      nextToken = null,
      from = null,
    } = event?.queryStringParameters || {};

    const queryParams = {
      id,
      limit: parseInt(limit, 10),
      nextToken,
      from,
    };

    const env = resolveEnvStage(event); // dev or prod
    const config = await loadConfig(env);
    console.log("config", config);

    const reqBody = await parseBody(event, env, config);

    const prisma = await getPrisma(config.POSTGRES_DB_URL);
    const authContext = getAuthorizerContext(event);
    const authToken = getAuthToken(event);
    const sessionId = getSessionId(event);

    const opsClient = await getOpenSearchClient(config);

    const ctx = {
      env,
      authContext,
      authToken,
      sessionId,
      config,
      reqBody,
      queryParams,
      baseHeaders,
      opsClient,
      prisma,
    };
    console.log("ctx", ctx);

    return await useRequestContext(ctx, async () => {
      const response = await dispatchRoute(event, env, ROUTES);

      const statusCode =
        typeof response?.statusCode === "number" ? response.statusCode : 200;
      const payload = response?.data ?? response ?? {};
      const mergedHeaders = response?.headers
        ? { ...baseHeaders, ...response?.headers }
        : baseHeaders;
      const cookies = response?.cookies ?? [];

      return respond({
        statusCode,
        payload,
        headers: mergedHeaders,
        cookies,
      });
    });
  } catch (e) {
    console.error("Error at handler", e);

    return respondError(e, {
      headers: baseHeaders,
    });
  }
};
