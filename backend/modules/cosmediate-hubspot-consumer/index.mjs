import { getOpenSearchClient } from "/opt/nodejs/lib/openSearch/config.mjs";
import {
  respond,
} from "/opt/nodejs/lib/http/response.mjs";
import {
  runLayerTest,
} from "/opt/nodejs/lib/debug/layer-test.mjs";
import { getPrisma } from "/opt/nodejs/lib/db/prisma/client.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { useRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";

import { hubSpotConsumer } from "./consumer/hubspot.mjs";
import { ENTITY_TO_BASE } from "./lib/registry.mjs";
import { aliasFor } from "./lib/utils.mjs";

export const handler = async (event) => {
  try {
    runLayerTest(event);

    /**
     * ===========================================================
     * Event schema validations
     * ===========================================================
     */

    const detailType = event["detail-type"] ?? "";
    console.log("[OPS Indexer] detailType:", detailType);
    if (!detailType) {
      console.log("[OPS Indexer] detail-type is missing, skipping");
      return;
    }

    const entityId = event?.detail?.entityId ?? "";
    console.log("[OPS Indexer] entityId:", entityId);
    if (!entityId) {
      console.log("[OPS Indexer] entityId is missing, skipping");
      return;
    }

    const entityType = event?.detail?.entityType ?? "";
    console.log("[OPS Indexer] entityType:", entityType);
    if (!entityType) {
      console.log("[OPS Indexer] entityType is missing, skipping");
      return;
    }

    const ENV = event?.detail?.ENV ?? "";
    console.log("[OPS Indexer] ENV:", ENV);
    if (!ENV) {
      console.log("[OPS Indexer] ENV is missing, skipping");
      return;
    }

    /**
     * ===========================================================
     * Loading config and starting indexing
     * ===========================================================
     */

    const base = ENTITY_TO_BASE[entityType];
    if (!base) {
      console.log("[OPS Indexer] Skip: unknown entity", entityType);
      return;
    }
    const indexAlias = aliasFor(base, ENV);

    const config = await loadConfig(ENV);
    const opsClient = await getOpenSearchClient(config);
    const prisma = await getPrisma(config.POSTGRES_DB_URL);
    console.log("config", config);

    const ctx = {
      env: ENV,
      indexAlias,
      config,
      detailType,
      entityId,
      entityType,
      commands: event?.detail?.commands ?? {},
      opsClient,
      prisma,
    };
    console.log("ctx", ctx);

    return await useRequestContext(ctx, async () => {
      const response = await hubSpotConsumer();
      console.log("[OPS Indexer] hubSpotConsumer response:", response);

      return respond({ statusCode: 200, payload: { ok: true, response } });
    });
  } catch (error) {
    console.error("[OPS Indexer] Error:", error);

    // TODO: Add DLQ for failed proccesses

    const statusCode =
      error && typeof error.statusCode === "number" ? error.statusCode : 500;
    const body = {
      error: error?.message ?? "Something went wrong",
      details: error?.details ?? null,
    };

    console.log("[OPS Indexer] Error response:", {
      statusCode,
      payload: body,
    });

    throw error;
  }
};
