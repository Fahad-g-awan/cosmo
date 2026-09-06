import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";
import { normalizeRoute } from "/opt/nodejs/lib/routing/router.mjs";

export const getEnv = async () => {
  try {
    const { env, event } = getRequestContext();
    const routeKey = normalizeRoute(event, env);

    return {
      statusCode: 200,
      data: {
        success: true,
        env,
        routeKey,
      },
    };
  } catch (error) {
    console.error("Error at getEnv", error);
    rethrowOrInternal(error);
  }
};
