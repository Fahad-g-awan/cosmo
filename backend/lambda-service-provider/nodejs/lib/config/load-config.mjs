import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../errors/http-error.mjs";
import { createTtlCache } from "../cache/ttl-cache.mjs";
import { buildAppConfig } from "./app-config.map.mjs";
import { fetchAppSecrets } from "./fetch-secrets.mjs";
import { fetchSsmParamsByPath } from "./ssm-params.loader.mjs";

const TTL = Number(process.env.CONFIG_CACHE_TTL_MS ?? 300000);
const configCache = createTtlCache(TTL);

const assertRequiredConfig = (cfg, env) => {
  for (const [key, value] of Object.entries(cfg)) {
    if (value == null || value === "") {
      throw httpError({
        error: API_ERRORS.INTERNAL_ERROR,
        message: "Something went wrong while loading config",
        details: [`Missing config: ${key} for env=${env}`],
      });
    }
  }
};

export const loadConfig = async (env) =>
  configCache.getOrFetch(`config:${env}`, async () => {
    console.log(`[loadConfig] Fetching config for env=${env}`);

    const prefix = `/cosmediate/${env}`;
    const ssmParams = await fetchSsmParamsByPath(prefix);
    const secrets = await fetchAppSecrets(env);
    const cfg = buildAppConfig(env, ssmParams, secrets);

    assertRequiredConfig(cfg, env);
    console.log(`[loadConfig] Config loaded for env=${env}`);

    return cfg;
  });
