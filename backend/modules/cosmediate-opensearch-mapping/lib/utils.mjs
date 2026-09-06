import { mappingFor } from "./schemas/index.mjs";
import { ACTION, ENV } from "./constants.mjs";

export { mappingFor };

export const getParams = ({ action, target, targets, env, dryRun }) => {
  if (
    (action === ACTION.DELETE_TARGETS || action === ACTION.CREATE_TARGETS) &&
    (!Array.isArray(targets) || targets.length === 0)
  ) {
    throw new Error(`${action}: targets array is required`);
  }

  if (
    action !== ACTION.DELETE_TARGETS &&
    action !== ACTION.CREATE_TARGETS &&
    action !== ACTION.DELETE_ALL &&
    !target
  ) {
    throw new Error(`${action}: target is required`);
  }

  switch (action) {
    case ACTION.CREATE:
      return {
        base: target,
        indexAlias: `${target}-${env}`,
        mapping: mappingFor(target),
        env,
      };
    case ACTION.CREATE_TARGETS:
      return { targets, env };
    case ACTION.MIGRATE:
      return {
        base: target,
        indexAlias: `${target}-${env}`,
        mapping: mappingFor(target),
        env,
        reindex: true,
        deleteOld: false,
      };
    case ACTION.TRUNCATE:
      return { indexAlias: `${target}-${env}` };
    case ACTION.DELETE_ALL:
      return { alias: env, dryRun: dryRun ?? true };
    case ACTION.DELETE_TARGET:
      return { base: target, env, dryRun: dryRun ?? true };
    case ACTION.DELETE_TARGETS:
      return { targets, env, dryRun: false };
    case ACTION.DELETE_STRAY:
      return {
        base: target,
        envs: [ENV.DEV, ENV.PROD],
        dryRun: dryRun ?? true,
      };
    case ACTION.DELETE_DOC:
      return { indexAlias: `${target}-${env}`, docId: "" };
    case ACTION.UPDATE_DOC:
      return {
        indexAlias: `${target}-${env}`,
        docId: "cmkif3mqf000102jmfqc5lfyl",
        fields: { price: 600 },
      };
    case ACTION.DELETE_FIELDS:
      return {
        indexAlias: `${target}-${env}`,
        fields: ["searchCount"],
        slices: 4,
        dryRun: false,
      };
    case ACTION.ADD_FIELDS:
      return { indexAlias: `${target}-${env}`, properties: {} };
    case ACTION.GET:
      return {
        base: target,
        indexAlias: `${target}-${env}`,
        request: { size: 1000 },
      };
    default:
      throw new Error(`Unsupported ACTION: ${action}`);
  }
};

export const backupIndices = async ({ opsClient, indexAlias }) => {
  const repositoryName = "cosmediate-backups-repo";
  const snapshotName = `backup-${indexAlias}-${Date.now()}`;

  try {
    await opsClient.snapshot.getRepository({
      repository: repositoryName,
    });
    console.log(`Repository '${repositoryName}' exists`);
  } catch (error) {
    if (error.statusCode === 404 || error.meta?.statusCode === 404) {
      console.log(`Repository '${repositoryName}' not found, creating...`);
      try {
        await opsClient.snapshot.createRepository({
          repository: repositoryName,
          body: {
            type: "s3",
            settings: {
              bucket:
                process.env.SNAPSHOT_S3_BUCKET ||
                "cosmediate-opensearch-snapshots",
              region: process.env.AWS_REGION || "eu-central-1",
              role_arn: process.env.SNAPSHOT_ROLE_ARN,
            },
          },
        });
        console.log(`✅ Repository '${repositoryName}' created successfully`);
      } catch (createError) {
        console.error(
          `❌ Failed to create repository '${repositoryName}':`,
          createError,
        );
        throw new Error(
          `Failed to create snapshot repository: ${createError.message}`,
        );
      }
    } else {
      console.error("Error checking repository:", error);
      throw error;
    }
  }

  try {
    await opsClient.snapshot.create({
      repository: repositoryName,
      snapshot: snapshotName,
      body: {
        indices: indexAlias,
        include_global_state: false,
      },
    });
    console.log(`Backup created: ${snapshotName}`);
    return { success: true, snapshotName, repository: repositoryName };
  } catch (snapshotError) {
    console.error(
      `❌ Failed to create snapshot '${snapshotName}':`,
      snapshotError,
    );
    throw new Error(`Failed to create snapshot: ${snapshotError.message}`);
  }
};
