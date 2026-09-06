import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import {
  inspectSearchIndexAlias,
  readIndexHealth,
} from "/opt/nodejs/lib/search/search-index-ready.mjs";

import { ensureEnvIndexTemplate } from "./index-template.mjs";
import { mappingFor } from "./schemas/index.mjs";
import { backupIndices } from "./utils.mjs";

export const createIndexWithAliasForTarget = async (
  opsClient,
  { base, indexAlias, mapping, env },
) => {
  if (!base || !indexAlias || !mapping || !env) {
    throw new Error(
      "createIndexWithAliasForTarget: base, indexAlias, mapping, and env are required",
    );
  }

  const indexName = `${base}-${env}-${Date.now()}`;
  await opsClient.indices.create({ index: indexName, body: mapping });

  try {
    const aliasInfo = await opsClient.indices.getAlias({ name: indexAlias });
    const oldIdxs = Object.keys(aliasInfo.body || {});
    const actions = oldIdxs.map((i) => ({
      remove: { index: i, alias: indexAlias },
    }));
    actions.push({
      add: { index: indexName, alias: indexAlias, is_write_index: true },
    });
    await opsClient.indices.updateAliases({ body: { actions } });
  } catch {
    await opsClient.indices.updateAliases({
      body: {
        actions: [
          {
            add: { index: indexName, alias: indexAlias, is_write_index: true },
          },
        ],
      },
    });
  }

  return indexName;
};

export const createIndexWithAlias = async () => {
  const { params, opsClient } = getRequestContext();
  if (params.env) {
    await ensureEnvIndexTemplate(opsClient, params.env);
  }
  return createIndexWithAliasForTarget(opsClient, params);
};

/**
 * Create indices + aliases for multiple targets in one env (independent mappings).
 */
export const createTargetsIndices = async () => {
  const { params, opsClient } = getRequestContext();
  const { targets, env } = params;

  if (!Array.isArray(targets) || targets.length === 0) {
    throw new Error("createTargetsIndices: targets array is required");
  }
  if (!env) throw new Error("createTargetsIndices: env is required");

  const indexTemplate = await ensureEnvIndexTemplate(opsClient, env);
  const results = [];

  for (const base of targets) {
    try {
      const indexAlias = `${base}-${env}`;
      const mapping = mappingFor(base);
      const indexName = await createIndexWithAliasForTarget(opsClient, {
        base,
        indexAlias,
        mapping,
        env,
      });

      const validation = await inspectSearchIndexAlias(opsClient, indexAlias);

      results.push({
        base,
        success: validation.healthy,
        indexAlias,
        indexName,
        validation,
        ...(validation.healthy
          ? {}
          : { error: validation.issues.join("; ") }),
      });
    } catch (e) {
      results.push({
        base,
        success: false,
        error: e?.message || String(e),
      });
    }
  }

  const succeeded = results.filter((r) => r.success === true);
  const failed = results.filter((r) => r.success !== true);

  return {
    env,
    indexTemplate,
    summary: {
      total: results.length,
      succeeded: succeeded.length,
      failed: failed.length,
    },
    results,
    failed,
    succeeded,
  };
};

export const addFields = async () => {
  const context = getRequestContext();
  const { params, opsClient } = context;
  const { indexAlias, properties } = params;

  await opsClient.indices.putMapping({
    index: indexAlias,
    body: { properties },
  });
};

export const truncateIndex = async () => {
  const context = getRequestContext();
  const { params, opsClient } = context;
  const { indexAlias } = params;

  // Backup indices
  await backupIndices({ opsClient, indexAlias });

  const res = await opsClient.deleteByQuery({
    index: indexAlias,
    body: { query: { match_all: {} } },
    refresh: true,
    conflicts: "proceed",
  });

  return res.body;
};

/**
 * Create new concrete index with updated mapping,
 * optionally reindex data from current alias target(s), flip alias,
 * and optionally delete old index(es).
 *
 * Usage:
 *   await migrateIndex();                           // reindex=true (default), deleteOld=false
 *   await migrateIndex({ reindex: false });         // flip to empty new index
 *   await migrateIndex({ reindex: true, deleteOld: true }); // full migrate + cleanup
 */
export const migrateIndex = async () => {
  const ctx = getRequestContext();
  const { params, opsClient } = ctx;
  const {
    base,
    indexAlias,
    mapping: newMapping,
    env,
    reindex = true,
    deleteOld = false,
  } = params;

  if (!base || !indexAlias || !newMapping || !env) {
    throw new Error(
      "migrateIndex: missing required params { base, indexAlias, mapping, env }",
    );
  }

  // Check if indexAlias is actually an index (not an alias)
  let aliasIsActuallyIndex = false;
  try {
    const exists = await opsClient.indices.exists({ index: indexAlias });
    if (exists.body === true) {
      // Check if it's a real index or just resolved via alias
      const aliasCheck = await opsClient.indices
        .getAlias({ name: indexAlias })
        .catch(() => null);
      if (!aliasCheck || Object.keys(aliasCheck.body || {}).length === 0) {
        aliasIsActuallyIndex = true;
        console.log(
          `[migrateIndex] "${indexAlias}" is an index, not an alias. Will handle specially.`,
        );
      }
    }
  } catch {
    // Index doesn't exist, proceed normally
  }

  // 1) discover current concrete index(es) behind the alias (if any)
  let oldIdxs = [];
  if (aliasIsActuallyIndex) {
    // The "alias" is actually an index - treat it as the old index
    oldIdxs = [indexAlias];
    console.log(`[migrateIndex] Old indices to migrate:`, oldIdxs);
  } else {
    try {
      const info = await opsClient.indices.getAlias({ name: indexAlias });
      oldIdxs = Object.keys(info.body || {});
      console.log(`[migrateIndex] Old indices behind alias:`, oldIdxs);
    } catch {
      // alias does not exist yet; first-time create
      oldIdxs = [];
      console.log(`[migrateIndex] No existing alias found, creating fresh`);
    }
  }

  // 2) create new concrete index with dynamic:false to allow field dropping during reindex
  const nextIndex = `${base}-${env}-${Date.now()}`;
  console.log(`[migrateIndex] Creating new index: ${nextIndex}`);

  // Temporarily set dynamic to false to ignore unmapped fields during reindex
  const tempMapping = JSON.parse(JSON.stringify(newMapping));
  tempMapping.mappings.dynamic = false;

  await opsClient.indices.create({ index: nextIndex, body: tempMapping });
  console.log(
    `[migrateIndex] New index created successfully: ${nextIndex} (dynamic: false for reindex)`,
  );

  // 3) optionally reindex data from all old targets into the new index
  if (reindex && oldIdxs.length) {
    console.log(
      `[migrateIndex] Starting reindex from ${oldIdxs.length} old index(es)`,
    );
    for (const old of oldIdxs) {
      console.log(
        `[migrateIndex] Reindexing from "${old}" to "${nextIndex}"...`,
      );
      try {
        const reindexResult = await opsClient.reindex({
          body: { source: { index: old }, dest: { index: nextIndex } },
          wait_for_completion: true,
          refresh: true,
          // "slices" for large datasets, e.g. slices: 4
        });

        // Check for failures even if status is 200
        if (
          reindexResult.body?.failures &&
          reindexResult.body.failures.length > 0
        ) {
          console.error(
            `[migrateIndex] Reindex had failures:`,
            JSON.stringify(reindexResult.body.failures, null, 2),
          );
          throw new Error(
            `Reindex failed with ${reindexResult.body.failures.length} document failures. Check logs for details.`,
          );
        }

        console.log(`[migrateIndex] Reindex completed for "${old}":`, {
          total: reindexResult.body?.total,
          created: reindexResult.body?.created,
          updated: reindexResult.body?.updated,
          deleted: reindexResult.body?.deleted,
          failures: reindexResult.body?.failures?.length || 0,
        });
      } catch (e) {
        console.error(`[migrateIndex] Reindex error for "${old}":`, e);
        if (e.meta?.body?.failures) {
          console.error(
            `[migrateIndex] Detailed failures:`,
            JSON.stringify(e.meta.body.failures, null, 2),
          );
        }
        throw e;
      }
    }
    console.log(`[migrateIndex] All reindex operations completed`);

    // Restore dynamic: strict after reindex to enforce schema validation
    console.log(`[migrateIndex] Restoring dynamic: strict on ${nextIndex}`);
    await opsClient.indices.putMapping({
      index: nextIndex,
      body: {
        dynamic: "strict",
        properties: newMapping.mappings.properties,
      },
    });
    console.log(`[migrateIndex] Mapping updated to dynamic: strict`);
  } else {
    console.log(
      `[migrateIndex] Skipping reindex (reindex=${reindex}, oldIdxs.length=${oldIdxs.length})`,
    );
  }

  // 4) Handle alias creation - special case when alias name is an existing index
  const deleted = [];
  const failed = [];

  if (aliasIsActuallyIndex) {
    // Must delete the old index first before we can create an alias with that name
    console.log(
      `[migrateIndex] Deleting old index "${indexAlias}" to free up the name for alias`,
    );
    try {
      await opsClient.indices.delete({ index: indexAlias });
      deleted.push(indexAlias);
    } catch (e) {
      failed.push({ index: indexAlias, error: e?.message || String(e) });
      throw new Error(
        `Failed to delete old index "${indexAlias}": ${e?.message || String(e)}`,
      );
    }

    // Now create the alias pointing to new index
    await opsClient.indices.updateAliases({
      body: {
        actions: [
          {
            add: { index: nextIndex, alias: indexAlias, is_write_index: true },
          },
        ],
      },
    });
  } else {
    // Normal case: atomically flip alias to new index
    const actions = [
      // remove alias from any old indices (if present)
      ...oldIdxs.map((i) => ({ remove: { index: i, alias: indexAlias } })),
      // add alias to new index as write target
      { add: { index: nextIndex, alias: indexAlias, is_write_index: true } },
    ];
    await opsClient.indices.updateAliases({ body: { actions } });

    // 5) optionally delete old indices after successful flip
    if (deleteOld && oldIdxs.length) {
      for (const old of oldIdxs) {
        try {
          await opsClient.indices.delete({ index: old });
          deleted.push(old);
        } catch (e) {
          failed.push({ index: old, error: e?.message || String(e) });
        }
      }
    }
  }

  const result = {
    alias: indexAlias,
    created: nextIndex,
    reindexedFrom: reindex ? oldIdxs : [],
    deletedOld: deleted,
    deleteOldFailures: failed,
    aliasWasIndex: aliasIsActuallyIndex,
  };

  console.log("[migrateIndex]", result);
  return result;
};

/**
 * Delete *all* indices and aliases tied to an environment name.
 * Call with params.alias = "dev" or "prod". Optional params.dryRun = true.
 *
 * It will:
 *  - find aliases matching "*-<env>" (e.g., "*-dev"),
 *  - collect all concrete indices behind those aliases,
 *  - also collect indices whose NAME includes "-<env>",
 *  - optionally remove aliases and delete those indices.
 */
export const deleteAllIndices = async () => {
  const context = getRequestContext();
  const { params, opsClient } = context;
  const env = params?.alias; // e.g. "dev"
  const dryRun = Boolean(params?.dryRun);

  if (!env) throw new Error('alias (env) is required, e.g. "dev" or "prod"');

  const indicesFromAliases = new Set();
  const aliasNamesToRemove = new Set();
  const indicesByName = new Set();

  // 1) Collect indices via aliases like "*-dev"
  try {
    const res = await opsClient.indices.getAlias({
      name: `*-${env}`,
      ignore_unavailable: true,
    });

    const body = res?.body && typeof res.body === "object" ? res.body : {};
    // body shape: { [indexName]: { aliases: { [aliasName]: {} } } }
    for (const [indexName, info] of Object.entries(body)) {
      indicesFromAliases.add(indexName);
      const aliasesObj = info?.aliases || {};
      for (const aliasName of Object.keys(aliasesObj)) {
        if (aliasName.endsWith(`-${env}`)) aliasNamesToRemove.add(aliasName);
      }
    }
  } catch (e) {
    // OK if none exist
  }

  // Back indices
  // for (const index of indicesFromAliases) {
  //   await backupIndices({ opsClient, indexAlias: index });
  // }

  // 2) Collect indices whose *name* contains "-<env>"
  try {
    const cat = await opsClient.cat.indices({ format: "json" });
    const rows = Array.isArray(cat?.body) ? cat.body : [];
    const needle = `-${env}`;
    for (const row of rows) {
      const name = row?.index;
      if (typeof name === "string" && name.includes(needle))
        indicesByName.add(name);
    }
  } catch (e) {
    // Some managed clusters restrict _cat; ignore silently
  }

  // Final sets
  const indicesToDelete = Array.from(
    new Set([...indicesFromAliases, ...indicesByName]),
  );
  const aliasNames = Array.from(aliasNamesToRemove);

  // Nothing found?
  if (indicesToDelete.length === 0 && aliasNames.length === 0) {
    return {
      dryRun,
      message: `Nothing found for env "${env}".`,
      indicesToDelete,
      aliasesToRemove: aliasNames,
    };
  }

  if (dryRun) {
    return {
      dryRun: true,
      message: "Dry run only. No deletions performed.",
      indicesToDelete,
      aliasesToRemove: aliasNames,
    };
  }

  // 3) Remove aliases from their indices (best effort)
  if (aliasNames.length && indicesToDelete.length) {
    const actions = [];
    for (const idx of indicesToDelete) {
      for (const aliasName of aliasNames) {
        actions.push({
          remove: { index: idx, alias: aliasName, ignore_unavailable: true },
        });
      }
    }
    if (actions.length) {
      try {
        await opsClient.indices.updateAliases({ body: { actions } });
      } catch {
        // continue
      }
    }
  }

  // 4) Delete indices
  const deleted = [];
  const failed = [];
  for (const idx of indicesToDelete) {
    try {
      await opsClient.indices.delete({ index: idx, ignore_unavailable: true });
      deleted.push(idx);
    } catch (e) {
      failed.push({ index: idx, error: e?.message || String(e) });
    }
  }

  // 5) Cleanup any remaining "*-env" aliases cluster-wide (best effort)
  if (aliasNames.length) {
    try {
      const actions = aliasNames.map((a) => ({
        remove: { index: "*", alias: a, ignore_unavailable: true },
      }));
      await opsClient.indices.updateAliases({ body: { actions } });
    } catch {
      /* ignore */
    }
  }

  return {
    dryRun: false,
    env,
    deleted,
    failed,
    removedAliases: aliasNames,
  };
};

/**
 * Delete ALL indices and aliases for a specific target and environment.
 * Includes stray timestamped indices (e.g. admins-dev-1234567890).
 */
export const deleteTargetIndicesForTarget = async (
  opsClient,
  { base, env, dryRun = false },
) => {
  if (!base) throw new Error("deleteTargetIndicesForTarget: base is required");
  if (!env) throw new Error("deleteTargetIndicesForTarget: env is required");

  const indexAlias = `${base}-${env}`;
  const indicesToDelete = new Set();
  const aliasesToRemove = new Set();

  try {
    const exists = await opsClient.indices.exists({ index: indexAlias });
    if (exists.body === true) {
      indicesToDelete.add(indexAlias);
    }
  } catch {
    // Ignore
  }

  try {
    const aliasInfo = await opsClient.indices.getAlias({ name: indexAlias });
    const found = Object.keys(aliasInfo.body || {});
    found.forEach((idx) => indicesToDelete.add(idx));
    aliasesToRemove.add(indexAlias);
  } catch {
    // Alias doesn't exist
  }

  try {
    const cat = await opsClient.cat.indices({ format: "json" });
    const rows = Array.isArray(cat?.body) ? cat.body : [];
    const prefix = `${base}-${env}`;
    for (const row of rows) {
      const name = row?.index;
      if (typeof name === "string" && name.startsWith(prefix)) {
        indicesToDelete.add(name);
      }
    }
  } catch {
    // Ignore
  }

  const indices = Array.from(indicesToDelete);
  const aliases = Array.from(aliasesToRemove);

  if (indices.length === 0) {
    return {
      success: true,
      dryRun,
      base,
      env,
      message: `No indices found for target "${base}" in env "${env}".`,
      indicesToDelete: indices,
      aliasesToRemove: aliases,
      deleted: [],
      failed: [],
      removedAliases: aliases,
    };
  }

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      base,
      env,
      message: "Dry run only. No deletions performed.",
      indicesToDelete: indices,
      aliasesToRemove: aliases,
      deleted: [],
      failed: [],
      removedAliases: aliases,
    };
  }

  if (aliases.length) {
    try {
      const actions = [];
      for (const idx of indices) {
        for (const alias of aliases) {
          actions.push({
            remove: { index: idx, alias, ignore_unavailable: true },
          });
        }
      }
      if (actions.length) {
        await opsClient.indices.updateAliases({ body: { actions } });
      }
    } catch {
      // Continue even if alias removal fails
    }
  }

  const deleted = [];
  const failed = [];
  for (const idx of indices) {
    try {
      await opsClient.indices.delete({ index: idx, ignore_unavailable: true });
      deleted.push(idx);
    } catch (e) {
      failed.push({ index: idx, error: e?.message || String(e) });
    }
  }

  return {
    success: failed.length === 0,
    dryRun: false,
    base,
    env,
    deleted,
    failed,
    removedAliases: aliases,
  };
};

export const deleteTargetIndices = async () => {
  const { opsClient, params } = getRequestContext();
  return deleteTargetIndicesForTarget(opsClient, params);
};

/**
 * Delete indices + aliases for multiple targets in one env (includes stray timestamps).
 */
export const deleteTargetsIndices = async () => {
  const { opsClient, params } = getRequestContext();
  const { targets, env, dryRun = false } = params;

  if (!Array.isArray(targets) || targets.length === 0) {
    throw new Error("deleteTargetsIndices: targets array is required");
  }
  if (!env) throw new Error("deleteTargetsIndices: env is required");

  const results = [];

  for (const base of targets) {
    try {
      const result = await deleteTargetIndicesForTarget(opsClient, {
        base,
        env,
        dryRun,
      });
      results.push(result);
    } catch (e) {
      results.push({
        success: false,
        base,
        env,
        error: e?.message || String(e),
        deleted: [],
        failed: [],
        removedAliases: [],
      });
    }
  }

  const succeeded = results.filter((r) => r.success === true);
  const failed = results.filter((r) => r.success !== true);

  return {
    env,
    dryRun,
    summary: {
      total: results.length,
      succeeded: succeeded.length,
      failed: failed.length,
    },
    results,
    failed,
    succeeded,
  };
};

/**
 * Return data from indices resolved by indexAlias and/or base.
 * - indexAlias: resolve alias to concrete indices
 * - base: include all indices starting with `${base}-`
 * - size: how many docs to return per index (default 50)
 * - query: OpenSearch query DSL (default: { match_all: {} })
 *
 * Response shape:
 * {
 *   input: { base, indexAlias, size },
 *   indices: [
 *     { name: "clinics-1738771123123", count: 123, docs: [ { _id, _source }, ... ] },
 *     ...
 *   ]
 * }
 */
export const getIndices = async () => {
  const { params, opsClient } = getRequestContext();
  const { base, indexAlias, request } = params || {};
  const { size = 1000, query = { match_all: {} } } = request;

  if (!base && !indexAlias) {
    throw new Error(
      "getIndices: provide at least one of { base, indexAlias }.",
    );
  }
  if (typeof size !== "number" || size < 1) {
    throw new Error("getIndices: invalid size (must be a positive number).");
  }

  const diag = {
    alias: { provided: !!indexAlias },
    base: { provided: !!base },
  };

  if (indexAlias) {
    diag.aliasHealth = await inspectSearchIndexAlias(opsClient, indexAlias);
    if (!diag.aliasHealth.healthy) {
      diag.issues = diag.aliasHealth.issues;
    }
  }

  const indexNames = new Set();

  // Alias -> indices
  if (indexAlias) {
    try {
      const aliasInfo = await opsClient.indices.getAlias({
        name: indexAlias,
        ignore_unavailable: true,
      });
      const found = Object.keys(aliasInfo.body || {});
      diag.alias.resolved = found;
      found.forEach((n) => indexNames.add(n));
    } catch (e) {
      diag.alias.error = e?.message || String(e);
    }
  }

  // Base prefix -> indices
  if (base) {
    try {
      const cat = await opsClient.cat.indices({ format: "json" });
      const prefix = `${base}-`;
      const found = [];
      for (const row of cat.body || []) {
        const name = row.index;
        if (
          typeof name === "string" &&
          (name.startsWith(prefix) || name === base)
        ) {
          indexNames.add(name);
          found.push(name);
        }
      }
      diag.base.matched = found;
    } catch (e) {
      diag.base.error = e?.message || String(e);
    }
  }

  const names = Array.from(indexNames);
  if (names.length === 0) {
    return {
      input: { base, indexAlias, size },
      indices: [],
      diagnose: diag,
      healthy: diag.aliasHealth?.healthy ?? false,
      message:
        diag.aliasHealth?.issues?.join("; ") ||
        "No matching indices found (alias didn’t resolve and no base-prefixed indices exist).",
    };
  }

  const indices = [];
  for (const name of names) {
    let count = null,
      docs = [],
      countError = null,
      searchError = null;
    const indexHealth = await readIndexHealth(opsClient, name);

    try {
      const c = await opsClient.count({ index: name, body: { query } });
      count = c.body?.count ?? 0;
    } catch (e) {
      countError = e?.message || String(e);
    }

    try {
      const sr = await opsClient.search({
        index: name,
        size,
        body: { query, sort: ["_doc"] },
        _source: true,
      });
      docs = (sr.body?.hits?.hits || []).map((h) => ({
        _id: h._id,
        _source: h._source,
      }));
    } catch (e) {
      searchError = e?.message || String(e);
    }

    indices.push({
      name,
      count,
      countError,
      docsSampleSize: docs.length,
      searchError,
      indexHealth,
      docs,
    });
  }

  const healthy =
    (diag.aliasHealth?.healthy ?? true) &&
    !indices.some(
      (row) =>
        row.indexHealth?.dynamic !== "strict" ||
        row.indexHealth?.number_of_replicas !== 0 ||
        row.indexHealth?.number_of_shards !== 1,
    );

  return {
    input: { base, indexAlias, size },
    diagnose: diag,
    healthy,
    indices,
  };
};

/**
 * Clean all old indices that start with e.g. admins- but don’t contain -dev-/-prod
 */
export const deleteStrayIndices = async () => {
  const { opsClient, params } = getRequestContext();
  const { base, envs = ["dev", "prod"], dryRun = true } = params;

  if (!base) throw new Error("deleteStrayIndices: base is required");

  // List indices that start with `${base}-`
  const res = await opsClient.indices.getSettings({
    index: `${base}-*`,
    allow_no_indices: true,
    ignore_unavailable: true,
    expand_wildcards: "open,closed",
  });

  const all = Object.keys(res.body || {});
  const keepFragments = envs.map((e) => `-${e}-`);

  const strays = all.filter(
    (name) => !keepFragments.some((frag) => name.includes(frag)),
  );

  if (dryRun) {
    return { dryRun: true, base, strays };
  }

  const deleted = [];
  const failed = [];

  for (const index of strays) {
    try {
      await opsClient.indices.delete({ index, ignore_unavailable: true });
      deleted.push(index);
    } catch (e) {
      failed.push({ index, error: e?.message || String(e) });
    }
  }

  return { dryRun: false, base, deleted, failed };
};

export const deleteDocumentById = async () => {
  const { opsClient, params } = getRequestContext();
  const { indexAlias, docId } = params;

  try {
    const res = await opsClient.delete({
      index: indexAlias,
      id: docId,
      refresh: true,
    });

    return { index: indexAlias, docId, result: res.body?.result || "deleted" };
  } catch (e) {
    if (e?.meta?.statusCode === 404) {
      // already gone — fine
      return { index: indexAlias, docId, result: "not_found" };
    }

    console.error(`delete error [${indexAlias}/${docId}]`, e);
    throw e;
  }
};

/**
 * Function to delete fields from all documents in an index
 */
// {
//   indexAlias: "clinics-prod",
//   fields: ["searchCount", "oldRating", "legacyScore"],
//   slices: 4,
//   dryRun: false,
// }
export const deleteFieldsFromIndexDocs = async () => {
  const { opsClient, params } = getRequestContext();
  const {
    indexAlias,
    fields = [],
    dryRun = true,
    refresh = true,
    slices = 1, // increase for large indices
  } = params;

  if (!indexAlias) {
    throw new Error("deleteFieldsFromIndexDocs: indexAlias is required");
  }

  if (!Array.isArray(fields) || !fields.length) {
    throw new Error("deleteFieldsFromIndexDocs: fields[] is required");
  }

  // 1) Resolve concrete indices behind alias
  const aliasInfo = await opsClient.indices.getAlias({
    name: indexAlias,
    allow_no_indices: true,
  });

  const indices = Object.keys(aliasInfo.body || {});
  if (!indices.length) {
    return {
      indexAlias,
      fields,
      result: "no_indices",
      message: "alias resolves to no indices",
    };
  }

  // 2) Build painless script
  const scriptSource = fields
    .map(
      (f) => `
if (ctx._source.containsKey('${f}')) {
  ctx._source.remove('${f}');
}`,
    )
    .join("\n");

  if (dryRun) {
    return {
      dryRun: true,
      indexAlias,
      indices,
      fields,
      script: scriptSource,
    };
  }

  // 3) Run update_by_query per concrete index
  const results = [];

  for (const index of indices) {
    try {
      const res = await opsClient.updateByQuery({
        index,
        refresh,
        slices,
        conflicts: "proceed",
        body: {
          script: {
            lang: "painless",
            source: scriptSource,
          },
          query: {
            match_all: {},
          },
        },
      });

      results.push({
        index,
        updated: res.body?.updated ?? 0,
        total: res.body?.total ?? 0,
        versionConflicts: res.body?.version_conflicts ?? 0,
      });
    } catch (e) {
      console.error(`[deleteFieldsFromIndexDocs] failed on ${index}`, e);
      results.push({
        index,
        error: e?.message || String(e),
      });
    }
  }

  return {
    indexAlias,
    fields,
    results,
  };
};

export const updateDocumentById = async () => {
  const context = getRequestContext();
  const { params, opsClient } = context;
  const { indexAlias, docId, fields } = params;

  if (!indexAlias || !docId || !fields) {
    throw new Error(
      "updateDocumentById: missing required params { indexAlias, docId, fields }",
    );
  }

  try {
    const res = await opsClient.update({
      index: indexAlias,
      id: docId,
      body: { doc: fields },
      refresh: true,
    });

    return {
      indexAlias,
      docId,
      fields,
      result: res.body,
      success: true,
    };
  } catch (err) {
    throw new Error(
      `Failed to update document ${docId} in index ${indexAlias}: ${err.message}`,
    );
  }
};
