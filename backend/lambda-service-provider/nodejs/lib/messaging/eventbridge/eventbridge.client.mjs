import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

const client = new Map();

export const getEventBridgeClient = () => {
  const existing = client.get("EB");
  if (existing) return existing;

  const eventBridge = new EventBridgeClient({});

  client.set("EB", eventBridge);
  return eventBridge;
};
