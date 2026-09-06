import { getTriggerConfig } from "/opt/nodejs/lib/auth/triggers/pool-stage-config.mjs";
import { runLayerTest } from "/opt/nodejs/lib/debug/layer-test.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";

import { runPreTokenGeneration } from "./lib/pre-token-generation.mjs";
import { HANDLER_TIMEOUT_MS } from "./lib/config.mjs";

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Lambda timeout after ${ms}ms`)), ms),
  );
  return Promise.race([promise, timeout]);
};

const resolveTriggerConfig = (event) => {
  try {
    if (event?.userPoolId) {
      return getTriggerConfig(event.userPoolId);
    }
  } catch (_) {
    /* pool config unavailable */
  }
  return undefined;
};

export const handler = async (event) => {
  let config;

  try {
    return await withTimeout(
      (async () => {
        runLayerTest(event);
        config = resolveTriggerConfig(event);
        return runPreTokenGeneration(event);
      })(),
      HANDLER_TIMEOUT_MS,
    );
  } catch (err) {
    await reportDevAlert({
      module: "cosmediate-pre-auth-token-gen",
      error: err,
      config: config ?? resolveTriggerConfig(event),
      event,
    });
    console.error("[pre-auth-token-gen] handler error", err);
    throw err;
  }
};
