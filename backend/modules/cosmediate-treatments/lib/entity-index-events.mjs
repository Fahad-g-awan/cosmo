import { emitEvent } from "/opt/nodejs/lib/messaging/eventbridge/eventbridge.publisher.mjs";

/**
 * @param {{ eventBusName: string, env: string, events: Array<{ entityId: string, entityType: string, action: string }> }} params
 */
export const emitEntityIndexEvents = async ({
  eventBusName,
  env,
  events = [],
}) => {
  for (const { entityId, entityType, action } of events) {
    if (!entityId || !entityType || !action) continue;

    await emitEvent(eventBusName, action, {
      schemaVersion: "1",
      entityId,
      entityType,
      ENV: env,
    });
  }
};
