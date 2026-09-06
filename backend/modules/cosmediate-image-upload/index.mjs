import {
  API_ERRORS,
} from "/opt/nodejs/constants/errors/index.mjs";
import {
  httpError,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import {
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
import { parseBody } from "/opt/nodejs/lib/api/parseBody.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";

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
    const env = resolveEnvStage(event); // dev or prod
    config = await loadConfig(env);
    console.log("config", config);

    const authContext = event.requestContext?.authorizer || null;
    if (!authContext) throw httpError({ error: API_ERRORS.UNAUTHORIZED });

    const uploadRes = await parseBody(event, env, config);

    return respond({
      statusCode: 200,
      payload: uploadRes,
      headers: baseHeaders,
    });
  } catch (e) {
    await reportDevAlert({
      module: "cosmediate-image-upload",
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
