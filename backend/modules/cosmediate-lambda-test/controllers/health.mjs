import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

export const getHealth = async () => {
  try {
    const { coldStart, env } = getRequestContext();

    return {
      statusCode: 200,
      data: {
        success: true,
        service: "lambda-test",
        env,
        coldStart: Boolean(coldStart),
        isWarm: globalThis.isWarm === true,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error at getHealth", error);
    rethrowOrInternal(error);
  }
};
