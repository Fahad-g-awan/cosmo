import { getOpenSearchClient } from "/opt/nodejs/lib/search/opensearch.client.mjs";
import { useRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";
import { respond } from "/opt/nodejs/lib/http/response.mjs";

import {
  createIndexWithAlias,
  createTargetsIndices,
  addFields,
  migrateIndex,
  truncateIndex,
  deleteAllIndices,
  deleteTargetIndices,
  deleteTargetsIndices,
  getIndices,
  deleteStrayIndices,
  deleteDocumentById,
  deleteFieldsFromIndexDocs,
  updateDocumentById,
} from "./lib/operations.mjs";
import { ACTION, ENV, TARGET } from "./lib/constants.mjs";
import { getParams } from "./lib/utils.mjs";

const env = ENV.DEV;
const action = ACTION.CREATE;
const target = TARGET.ANNOUNCEMENTS;

// Set false to perform destructive deletes (DELETE_ALL, DELETE_TARGET, DELETE_STRAY).
const dryRun = true;

const targets = [
  // TARGET.ADMINS,
  // TARGET.PATIENTS,
  // TARGET.TREATMENT_BRANDS,
  // TARGET.TREATMENT_CATEGORIES,
  // TARGET.TREATMENTS,
  // TARGET.CLINIC_TREATMENTS,
  // TARGET.CLINIC_SPECIALIST_TREATMENTS,
  // TARGET.SUB_TREATMENTS,
  // TARGET.TREATMENT_RESULTS,
  // TARGET.CLINIC_CATEGORIES,
  // TARGET.CLINIC_MANAGERS,
  // TARGET.CLINICS,
  // TARGET.SPECIALISTS,
  // TARGET.BLOG_CATEGORIES,
  // TARGET.BLOGS,
  // TARGET.ANNOUNCEMENTS,
  // TARGET.ENTITY_SEARCH_STATS,
  // TARGET.REVIEWS,
  // TARGET.REVIEW_REPLIES,
  // TARGET.LEADS,
];

export const handler = async () => {
  const batchTargets = targets?.length ? targets : target ? [target] : [];
  let config;

  try {
    config = await loadConfig(env);
    console.log("config", config);

    const opsClient = await getOpenSearchClient(config);
    const params = getParams({
      action,
      target,
      targets: batchTargets,
      env,
      dryRun,
    });
    console.log("params", params);

    const ctx = { params, opsClient };
    console.log("ctx", ctx);

    let res;

    const payload = await useRequestContext(ctx, async () => {
      switch (action) {
        case ACTION.CREATE:
          res = await createIndexWithAlias();
          break;
        case ACTION.CREATE_TARGETS:
          res = await createTargetsIndices();
          break;
        case ACTION.ADD_FIELDS:
          res = await addFields();
          break;
        case ACTION.MIGRATE:
          res = await migrateIndex();
          break;
        case ACTION.TRUNCATE:
          res = await truncateIndex();
          break;
        case ACTION.DELETE_ALL:
          res = await deleteAllIndices();
          break;
        case ACTION.DELETE_TARGET:
          res = await deleteTargetIndices();
          break;
        case ACTION.DELETE_TARGETS:
          res = await deleteTargetsIndices();
          break;
        case ACTION.DELETE_STRAY:
          res = await deleteStrayIndices();
          break;
        case ACTION.DELETE_DOC:
          res = await deleteDocumentById();
          break;
        case ACTION.DELETE_FIELDS:
          res = await deleteFieldsFromIndexDocs();
          break;
        case ACTION.UPDATE_DOC:
          res = await updateDocumentById();
          break;
        case ACTION.GET:
          res = await getIndices();
          break;
        default:
          throw new Error(`Unsupported ACTION: ${action}`);
      }

      console.log("res", JSON.stringify(res));

      const batchAction =
        action === ACTION.DELETE_TARGETS || action === ACTION.CREATE_TARGETS;
      const allSucceeded = batchAction
        ? (res?.summary?.failed ?? 0) === 0
        : true;

      return respond({
        statusCode: allSucceeded ? 200 : 207,
        payload: {
          message: allSucceeded
            ? "Operation Successful"
            : "Operation completed with failures",
          success: allSucceeded,
          action,
          targets: batchTargets,
          env,
          result: res,
        },
      });
    });

    return payload;
  } catch (err) {
    await reportDevAlert({
      module: "cosmediate-opensearch-mapping",
      error: err,
      config,
    });
    console.error(err);

    return respond({
      statusCode: 500,
      payload: {
        message: "Operation Failed",
        success: false,
        action,
        targets: batchTargets,
        env,
        error: err.message || String(err),
      },
    });
  }
};
