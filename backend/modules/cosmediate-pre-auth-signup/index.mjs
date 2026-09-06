import { getTriggerConfig } from "/opt/nodejs/lib/auth/triggers/pool-stage-config.mjs";
import { runLayerTest } from "/opt/nodejs/lib/debug/layer-test.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";

import { runPreSignUp } from "./lib/pre-signup.mjs";

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
    return await runPreSignUp(event);
  } catch (err) {
    await reportDevAlert({
      module: "cosmediate-pre-auth-signup",
      error: err,
      config: config ?? resolveTriggerConfig(event),
      event,
    });
    console.error("[pre-signup] handler error", err);
    throw err;
  }
};
