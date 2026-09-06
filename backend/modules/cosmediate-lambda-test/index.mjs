/**
 * lambda-test — reference HTTP Lambda template.
 * Sections: layer smoke → preflight → CORS → env → config → body → auth → clients → ctx → dispatch
 */
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
import { getOpenSearchClient } from "/opt/nodejs/lib/search/opensearch.client.mjs";
import { useRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { respond, respondError } from "/opt/nodejs/lib/http/response.mjs";
import { resolveEnvStage } from "/opt/nodejs/lib/http/stage.utils.mjs";
import { runLayerTest } from "/opt/nodejs/lib/debug/layer-test.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { dispatchRoute } from "/opt/nodejs/lib/routing/router.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";
import { getPrisma } from "/opt/nodejs/lib/db/prisma/client.mjs";
import { parseBody } from "/opt/nodejs/lib/http/parse-body.mjs";

import { formatControllerResponse } from "./lib/format-response.mjs";
import { ROUTES } from "./lib/routes.mjs";

const coldStart = !globalThis.isWarm;
globalThis.isWarm = true;

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

    const authContext = getAuthorizerContext(event);
    const authToken = getAuthToken(event);
    const sessionId = getSessionId(event);
    const prisma = await getPrisma(config.POSTGRES_DB_URL);
    const opsClient = getOpenSearchClient(config);

    const ctx = {
      env,
      event,
      coldStart,
      authContext,
      authToken,
      sessionId,
      config,
      reqBody,
      queryParams: event.queryStringParameters ?? {},
      baseHeaders,
      opsClient,
      prisma,
    };

    return await useRequestContext(ctx, async () => {
      const response = await dispatchRoute(event, env, ROUTES);

      return respond(formatControllerResponse(response, baseHeaders));
    });
  } catch (e) {
    await reportDevAlert({
      module: "cosmediate-lambda-test",
      error: e,
      config,
      event,
    });
    console.error("Error at lambda-test handler", e);

    return respondError(e, {
      headers: baseHeaders,
    });
  }
};
