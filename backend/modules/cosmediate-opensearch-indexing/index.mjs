import { getOpenSearchClient } from "/opt/nodejs/lib/search/opensearch.client.mjs";
import { useRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { runLayerTest } from "/opt/nodejs/lib/debug/layer-test.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";
import { getPrisma } from "/opt/nodejs/lib/db/prisma/client.mjs";
import { respond } from "/opt/nodejs/lib/http/response.mjs";

import { parseIndexerEvent } from "./lib/parse-indexer-event.mjs";
import { routeIndexer } from "./controllers/indexer.mjs";

export const handler = async (event) => {
  let config;

  try {
    runLayerTest(event);

    const parsed = parseIndexerEvent(event);
    if (!parsed.ok) {
      console.log("[OPS Indexer] Skip:", parsed.reason);
      return;
    }

    const { detailType, entityId, entityType, env, indexAlias } =
      parsed.payload;
    const searchStats = event?.detail?.searchStats ?? null;
    const commands = event?.detail?.commands ?? null;
    console.log("[OPS Indexer]", {
      detailType,
      entityId,
      entityType,
      env,
      indexAlias,
      searchStats,
      commands,
    });

    config = await loadConfig(env);
    const opsClient = await getOpenSearchClient(config);
    const prisma = await getPrisma(config.POSTGRES_DB_URL);

    const ctx = {
      env,
      indexAlias,
      config,
      detailType,
      entityId,
      entityType,
      searchStats,
      commands,
      opsClient,
      prisma,
    };

    return await useRequestContext(ctx, async () => {
      const response = await routeIndexer();
      console.log("[OPS Indexer] done", { entityType, entityId, response });

      return respond({ statusCode: 200, payload: { ok: true, response } });
    });
  } catch (error) {
    await reportDevAlert({
      module: "cosmediate-opensearch-indexing",
      error,
      config,
      event,
    });

    console.error("[OPS Indexer] Error:", {
      message: error?.message,
      entityType: event?.detail?.entityType,
      entityId: event?.detail?.entityId,
    });

    // TODO: DLQ / retry policy when indexing fails after a successful upstream write

    throw error;
  }
};
