import { getEventBridgeClient } from "./eventbridge.client.mjs";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";

const assertEventShape = (eventBus, type, detail) => {
  if (!eventBus || typeof eventBus !== "string") {
    throw new Error("[Event] eventBus is required");
  }
  if (!type || typeof type !== "string") {
    throw new Error("[Event] type is required");
  }
  if (!detail || typeof detail !== "object") {
    throw new Error("[Event] detail is required");
  }
  if (!detail.entityId) {
    throw new Error("[Event] detail.entityId is required");
  }
  if (!detail.entityType) {
    throw new Error("[Event] detail.entityType is required");
  }
  if (!detail.ENV) {
    throw new Error("[Event] detail.ENV is required");
  }
};

/**
 * Publishes a domain event to EventBridge (e.g. OpenSearch indexer).
 * Callers decide whether publish failure should fail the HTTP request.
 *
 * TODO: retry / DLQ / outbox when PutEvents fails after a successful DB write.
 *
 * @param {string} eventBus - The name of the EventBridge event bus.
 * @param {string} type - The type of the event. DDB_EVENTs
 * @param {object} detail - The detail of the event.
 * @returns {Promise<void>}
 * @throws {Error} If the event shape is invalid.
 * @throws {Error} If the event publishing fails.
 * @throws {Error} If the event publishing fails.
 */
export const emitEvent = async (eventBus, type, detail) => {
  assertEventShape(eventBus, type, detail);

  try {
    const eventBridge = getEventBridgeClient();

    const putEventsParams = {
      Entries: [
        {
          EventBusName: eventBus,
          Source: "com.cosmediate.backend",
          DetailType: type,
          Detail: JSON.stringify({
            ...detail,
            meta: {
              triggeredBy: "user",
              timestamp: new Date().toISOString(),
            },
          }),
        },
      ],
    };

    await eventBridge.send(new PutEventsCommand(putEventsParams));
  } catch (error) {
    console.error("[Event] publish failed", {
      eventBus,
      type,
      entityId: detail?.entityId,
      entityType: detail?.entityType,
      ENV: detail?.ENV,
      message: error?.message,
    });
    throw error;
  }
};
