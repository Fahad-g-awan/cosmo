import {
  dispatchRoute,
  options as preflightOptions,
  getOrigin,
  resolveEnvStage,
  cors,
} from "/opt/nodejs/lib/api/utils.mjs";
import { respond, respondError } from "/opt/nodejs/lib/http/response.mjs";
import { runLayerTest } from "/opt/nodejs/lib/debug/layer-test.mjs";
import {} from // getAuthToken,
// getSessionId,
"/opt/nodejs/lib/http/_headers.utils.mjs";
import { useRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { getOpenSearchClient } from "/opt/nodejs/lib/openSearch/config.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";
import { parseBody } from "/opt/nodejs/lib/api/parseBody.mjs";

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

  let config;

  try {
    const id = event.queryStringParameters?.id ?? null;
    const limitParam = event.queryStringParameters?.limit ?? "10";
    const limit = parseInt(limitParam, 10) || 10;
    const nextToken = event.queryStringParameters?.nextToken ?? null;

    const queryParams = {
      id,
      limit,
      nextToken,
    };

    const env = resolveEnvStage(event); // dev or prod
    config = await loadConfig(env);
    console.log("config", config);

    const reqBody = await parseBody(event, env, config);

    // const authContext = event.requestContext?.authorizer || null;
    // const authToken = getAuthToken(event);
    // const sessionId = getSessionId(event);

    const opsClient = await getOpenSearchClient(config);

    const ctx = {
      env,
      // authContext,
      // authToken,
      // sessionId,
      config,
      reqBody,
      queryParams,
      baseHeaders,
      opsClient,
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
    await reportDevAlert({
      module: "cosmediate-auth-client-apps",
      error: e,
      config,
      event,
    });
    console.error("Error at handler", e);

    return respondError(e, {
      headers: baseHeaders,
    });
  }
};
