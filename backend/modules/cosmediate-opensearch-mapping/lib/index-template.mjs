import { SHARDS, REPLICAS } from "./constants.mjs";

const templateNameForEnv = (env) => `cosmediate-${env}`;

/**
 * Safety net: new indices matching *-{env} or *-{env}-* get project shard/replica defaults
 * even if something auto-creates an index outside the mapping lambda.
 */
export const ensureEnvIndexTemplate = async (opsClient, env) => {
  if (!env) throw new Error("ensureEnvIndexTemplate: env is required");

  const name = templateNameForEnv(env);

  await opsClient.indices.putIndexTemplate({
    name,
    body: {
      index_patterns: [`*-${env}`, `*-${env}-*`],
      priority: 50,
      template: {
        settings: {
          number_of_shards: SHARDS,
          number_of_replicas: REPLICAS,
        },
      },
    },
  });

  return { name, index_patterns: [`*-${env}`, `*-${env}-*`] };
};
