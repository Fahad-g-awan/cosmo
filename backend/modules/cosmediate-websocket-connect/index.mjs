import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DateTime } from "luxon";

import { getSocketTableName } from "/opt/nodejs/lib/realtime/socket-table.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";
import { resolveEnvStage } from "/opt/nodejs/lib/http/stage.utils.mjs";
import { loadConfig } from "/opt/nodejs/lib/config/load-config.mjs";
import { reportDevAlert } from "/opt/nodejs/lib/mailer/index.mjs";

const db = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "eu-central-1",
  }),
);

const MAX_USER_ID_LENGTH = 100;
const USER_ID_PATTERN = /^[a-zA-Z0-9_-]*$/;

const validateUserId = (userId) => {
  if (!userId) return "";
  if (userId.length > MAX_USER_ID_LENGTH) {
    throw new Error("Invalid user ID");
  }
  if (!USER_ID_PATTERN.test(userId)) {
    throw new Error("Invalid user ID format");
  }
  return userId;
};

export const handler = async (event) => {
  let config;

  try {
    const connectionId = event.requestContext?.connectionId;
    if (!connectionId) {
      console.error("[websocket-connect] Missing connectionId");
      return { statusCode: 400, body: "Missing connection ID" };
    }

    const env = resolveEnvStage(event);
    config = await loadConfig(env);
    const tableName = getSocketTableName(env);
    if (!tableName) {
      console.error("[websocket-connect] Invalid environment or table name");
      return { statusCode: 400, body: "Invalid request" };
    }

    const userId = validateUserId(event.queryStringParameters?.userId ?? "");
    const now = DateTime.utc().toISO();

    await db.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          PK: `CONNECTION#${connectionId}`,
          SK: "METADATA",
          id: connectionId,
          userId,
          entityType: ENTITY_TYPE.WEBSOCKET_CONNECTION,
          createdAt: now,
          updatedAt: now,
        },
      }),
    );

    console.log(
      `[websocket-connect] Stored connection ${connectionId} for user ${userId || "anonymous"}`,
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Connection established successfully" }),
    };
  } catch (error) {
    const isValidationError =
      error?.message === "Invalid user ID" ||
      error?.message === "Invalid user ID format";

    if (!isValidationError) {
      try {
        if (!config) {
          const env = resolveEnvStage(event);
          config = await loadConfig(env);
        }
      } catch (_) {
        /* config unavailable for dev alert */
      }

      await reportDevAlert({
        module: "cosmediate-websocket-connect",
        error,
        config,
        event,
      });
    }

    console.error("[websocket-connect] Error storing connection:", error);
    return {
      statusCode: isValidationError ? 400 : 500,
      body: JSON.stringify({
        message: isValidationError
          ? error.message
          : "Failed to establish connection",
      }),
    };
  }
};
