import { BatchGetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

import { secretsManagerClient } from "./secrets-manager.client.mjs";
import { httpError, isHttpError } from "../errors/http-error.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { APP_SECRET_BINDINGS } from "./app-config.map.mjs";
import { createTtlCache } from "../cache/ttl-cache.mjs";
import { chunk } from "../async/batch.utils.mjs";

const TTL = Number(process.env.CONFIG_CACHE_TTL_MS ?? 300000);
const secretsCache = createTtlCache(TTL);

const looksJson = (s) => s.trim().startsWith("{") || s.trim().startsWith("[");
const isAllCaps = (s) => /^[A-Z0-9_]+$/.test(s);

const normalizeDescriptors = (secretNames) =>
  (secretNames || []).map((s) => (typeof s === "string" ? { name: s } : s));

const resolveSecretDescriptors = (rawMap, descs) => {
  const out = {};

  for (const d of descs) {
    const name = d.name;
    const as = d.as || name;
    let val = rawMap[name] ?? null;

    if (val && typeof val === "string" && looksJson(val)) {
      try {
        const obj = JSON.parse(val);
        const key = d.jsonKey || (isAllCaps(as) ? as : undefined);
        val =
          key && obj && Object.prototype.hasOwnProperty.call(obj, key)
            ? obj[key]
            : val;
      } catch {
        // keep val as-is if parse fails
      }
    }

    out[as] = val;
  }

  return out;
};

const fetchRawSecrets = async (secretIds) => {
  const rawMap = {};

  for (const group of chunk(secretIds, 20)) {
    const resp = await secretsManagerClient.send(
      new BatchGetSecretValueCommand({ SecretIdList: group }),
    );

    for (const v of resp.SecretValues ?? []) {
      const val =
        v.SecretString ??
        (v.SecretBinary ? Buffer.from(v.SecretBinary).toString("utf8") : null);
      rawMap[v.Name] = val;
    }

    const errs = (resp.Errors ?? []).map((e) => e.SecretId);
    if (errs.length) {
      throw httpError({
        error: API_ERRORS.INTERNAL_ERROR,
        message: "Failed to read secrets",
        details: [`Failed to read secrets: ${errs.join(", ")}`],
      });
    }
  }

  return rawMap;
};

const fetchSecretsByNames = async (env, secretNames) => {
  const descs = normalizeDescriptors(secretNames);
  const names = [...new Set(descs.map((d) => d.name))];

  const cacheKey = `secrets:${env}:${[...names].sort().join(",")}`;
  const rawMap = await secretsCache.getOrFetch(cacheKey, () =>
    fetchRawSecrets(names),
  );

  return resolveSecretDescriptors(rawMap, descs);
};

export const fetchAppSecrets = async (env) => {
  const descs = APP_SECRET_BINDINGS.map((d) => ({
    name: typeof d.name === "function" ? d.name(env) : d.name,
    as: d.as,
    jsonKey: d.jsonKey,
  }));

  try {
    return await fetchSecretsByNames(env, descs);
  } catch (error) {
    if (isHttpError(error)) throw error;

    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Something went wrong while loading config",
      details: [`Failed to load secrets for env=${env}`],
    });
  }
};
