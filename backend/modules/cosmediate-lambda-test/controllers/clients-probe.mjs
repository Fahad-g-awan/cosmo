import {
  httpError,
  rethrowOrInternal,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";

export const getClientsProbe = async () => {
  try {
    const { authContext, prisma, opsClient } = getRequestContext();

    if (!authContext?.identityId && !authContext?.cognitoSub) {
      throw httpError({
        error: API_ERRORS.UNAUTHORIZED,
        details: ["Authentication required"],
      });
    }

    let postgres = { ok: false, error: null };
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
      postgres = { ok: true };
    } catch (e) {
      postgres = { ok: false, error: e?.message ?? "Postgres probe failed" };
    }

    let openSearch = { ok: false, error: null };
    try {
      const ping = await opsClient.ping();
      openSearch = { ok: Boolean(ping?.body) };
    } catch (e) {
      openSearch = {
        ok: false,
        error: e?.message ?? "OpenSearch probe failed",
      };
    }

    return {
      statusCode: 200,
      data: {
        success: postgres.ok && openSearch.ok,
        postgres,
        openSearch,
      },
    };
  } catch (error) {
    console.error("Error at getClientsProbe", error);
    rethrowOrInternal(error);
  }
};
