const DEFAULT_SHARDS = 1;
const DEFAULT_REPLICAS = 0;

const parseIntSetting = (value, fallback) => {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Read shard/replica settings and mapping dynamic flag for a concrete index.
 */
export const readIndexHealth = async (opsClient, indexName) => {
  const health = {
    indexName,
    number_of_shards: null,
    number_of_replicas: null,
    dynamic: null,
    errors: [],
  };

  try {
    const settingsRes = await opsClient.indices.getSettings({
      index: indexName,
      flat_settings: true,
    });
    const entry = settingsRes.body?.[indexName]?.settings ?? {};
    health.number_of_shards = parseIntSetting(
      entry["index.number_of_shards"],
      null,
    );
    health.number_of_replicas = parseIntSetting(
      entry["index.number_of_replicas"],
      null,
    );
  } catch (e) {
    health.errors.push(`settings: ${e?.message || String(e)}`);
  }

  try {
    const mappingRes = await opsClient.indices.getMapping({ index: indexName });
    const mapping = mappingRes.body?.[indexName]?.mappings ?? {};
    health.dynamic = mapping.dynamic ?? "(default)";
  } catch (e) {
    health.errors.push(`mapping: ${e?.message || String(e)}`);
  }

  return health;
};

/**
 * Inspect alias resolution and detect misconfigured indices (concrete index named like an alias).
 *
 * @returns {Promise<{
 *   indexAlias: string,
 *   healthy: boolean,
 *   issues: string[],
 *   aliasExists: boolean,
 *   aliasIsActuallyIndex: boolean,
 *   concreteIndices: string[],
 *   writeIndex: string | null,
 *   indexHealth: object[],
 * }>}
 */
export const inspectSearchIndexAlias = async (
  opsClient,
  indexAlias,
  {
    expectedShards = DEFAULT_SHARDS,
    expectedReplicas = DEFAULT_REPLICAS,
    expectStrictMapping = true,
  } = {},
) => {
  const issues = [];
  let aliasExists = false;
  let aliasIsActuallyIndex = false;
  let concreteIndices = [];
  let writeIndex = null;

  if (!indexAlias) {
    return {
      indexAlias,
      healthy: false,
      issues: ["indexAlias is required"],
      aliasExists: false,
      aliasIsActuallyIndex: false,
      concreteIndices: [],
      writeIndex: null,
      indexHealth: [],
    };
  }

  try {
    const aliasRes = await opsClient.indices.getAlias({ name: indexAlias });
    const body = aliasRes.body ?? {};
    concreteIndices = Object.keys(body);
    aliasExists = concreteIndices.length > 0;

    if (aliasExists) {
      for (const [indexName, info] of Object.entries(body)) {
        const aliases = info?.aliases?.[indexAlias] ?? {};
        if (aliases.is_write_index === true) {
          writeIndex = indexName;
          break;
        }
      }
      if (!writeIndex) {
        writeIndex = concreteIndices[0] ?? null;
        if (concreteIndices.length > 1) {
          issues.push(
            `alias "${indexAlias}" has multiple backing indices but no is_write_index`,
          );
        }
      }
    }
  } catch (e) {
    if (e?.meta?.statusCode !== 404) {
      issues.push(`getAlias failed: ${e?.message || String(e)}`);
    }
  }

  if (!aliasExists) {
    try {
      const existsRes = await opsClient.indices.exists({ index: indexAlias });
      if (existsRes.body === true) {
        aliasIsActuallyIndex = true;
        concreteIndices = [indexAlias];
        writeIndex = indexAlias;
        issues.push(
          `"${indexAlias}" is a concrete index, not an alias — run CREATE_TARGETS to fix`,
        );
      }
    } catch (e) {
      issues.push(`exists check failed: ${e?.message || String(e)}`);
    }
  }

  if (!aliasExists && !aliasIsActuallyIndex) {
    issues.push(
      `alias "${indexAlias}" not found — run CREATE_TARGETS before indexing`,
    );
  }

  const indexHealth = [];
  for (const indexName of concreteIndices) {
    const health = await readIndexHealth(opsClient, indexName);
    indexHealth.push(health);

    if (health.number_of_shards !== expectedShards) {
      issues.push(
        `${indexName}: expected ${expectedShards} shard(s), got ${health.number_of_shards}`,
      );
    }
    if (health.number_of_replicas !== expectedReplicas) {
      issues.push(
        `${indexName}: expected ${expectedReplicas} replica(s), got ${health.number_of_replicas}`,
      );
    }
    if (expectStrictMapping && health.dynamic !== "strict") {
      issues.push(
        `${indexName}: expected dynamic "strict", got ${health.dynamic}`,
      );
    }
  }

  return {
    indexAlias,
    healthy: issues.length === 0,
    issues,
    aliasExists,
    aliasIsActuallyIndex,
    concreteIndices,
    writeIndex,
    indexHealth,
  };
};

/**
 * Throws when the alias is missing or misconfigured. Call before any indexer write.
 */
export const assertSearchIndexReady = async (
  opsClient,
  indexAlias,
  options,
) => {
  const inspection = await inspectSearchIndexAlias(
    opsClient,
    indexAlias,
    options,
  );

  if (!inspection.healthy) {
    throw new Error(
      `[search-index] Not ready for writes (${indexAlias}): ${inspection.issues.join("; ")}`,
    );
  }

  return inspection;
};
