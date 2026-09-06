import { getTriggerConfig } from "/opt/nodejs/lib/auth/triggers/pool-stage-config.mjs";
import { runLayerTest } from "/opt/nodejs/lib/debug/layer-test.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";

import { runPostConfirmation } from "./lib/post-confirmation.mjs";

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
  runLayerTest(event);

  let config;

  try {
    config = resolveTriggerConfig(event);
    return await runPostConfirmation(event);
  } catch (err) {
    await reportDevAlert({
      module: "cosmediate-post-confirmation",
      error: err,
      config: config ?? resolveTriggerConfig(event),
      event,
    });
    console.error("[post-confirmation] handler error", err);
    throw err;
  }
};
