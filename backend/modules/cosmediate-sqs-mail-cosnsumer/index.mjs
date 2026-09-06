import { runLayerTest } from "/opt/nodejs/lib/debug/layer-test.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";

import { processEmailBatch } from "./lib/process-email-batch.mjs";

export const handler = async (event) => {
  runLayerTest(event);

  let config;

  try {
    const env = process.env.ENV;
    if (!env) {
      throw new Error(
        "[mailer] ENV lambda environment variable is required (dev | prod)",
      );
    }

    config = await loadConfig(env);
    return await processEmailBatch(event, config);
  } catch (err) {
    await reportDevAlert({
      module: "cosmediate-mailer",
      error: err,
      config,
      event,
    });
    throw err;
  }
};
