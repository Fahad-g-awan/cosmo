import {
  ALL_ROUTE_KEYS,
  LAMBDA_TEST_ROUTE_DEFS,
} from "/opt/nodejs/config/routes/index.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

export const getRoutes = async () => {
  try {
    const lambdaTestKeys = Object.values(LAMBDA_TEST_ROUTE_DEFS).map(
      (def) => def.key,
    );

    return {
      statusCode: 200,
      data: {
        success: true,
        totalRoutes: ALL_ROUTE_KEYS.length,
        lambdaTestRoutes: lambdaTestKeys,
        sampleKeys: ALL_ROUTE_KEYS.filter((k) =>
          k.startsWith("GET:/test"),
        ).slice(0, 20),
      },
    };
  } catch (error) {
    console.error("Error at getRoutes", error);
    rethrowOrInternal(error);
  }
};
