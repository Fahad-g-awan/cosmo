import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { getSocketTableName } from "/opt/nodejs/lib/realtime/socket-table.mjs";
import { resolveEnvStage } from "/opt/nodejs/lib/http/stage.utils.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";

const db = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "eu-central-1",
  }),
);

export const handler = async (event) => {
  let config;

  try {
    const connectionId = event.requestContext?.connectionId;
    if (!connectionId) {
      console.error("[websocket-disconnect] Missing connectionId");
      return { statusCode: 400, body: "Missing connection ID" };
    }

    const env = resolveEnvStage(event);
    config = await loadConfig(env);
    const tableName = getSocketTableName(env);
    if (!tableName) {
      console.error("[websocket-disconnect] Invalid environment or table name");
      return { statusCode: 400, body: "Invalid request" };
    }

    await db.send(
      new DeleteCommand({
        TableName: tableName,
        Key: {
          PK: `CONNECTION#${connectionId}`,
          SK: "METADATA",
        },
      }),
    );

    console.log(`[websocket-disconnect] Removed connection ${connectionId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Connection deleted successfully" }),
    };
  } catch (error) {
    try {
      if (!config) {
        const env = resolveEnvStage(event);
        config = await loadConfig(env);
      }
    } catch (_) {
      /* config unavailable for dev alert */
    }

    await reportDevAlert({
      module: "cosmediate-websocket-disconnect",
      error,
      config,
      event,
    });

    // API Gateway treats non-2xx disconnect responses as failures; keep 200.
    console.error("[websocket-disconnect] Error deleting connection:", error);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Failed to delete connection" }),
    };
  }
};
