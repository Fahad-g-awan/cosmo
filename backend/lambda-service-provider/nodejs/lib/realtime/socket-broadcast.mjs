import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

import { handleScanCommand } from "../db/dynamodb/commands/scan.mjs";
import { dbClient } from "../db/dynamodb/ddb.client.mjs";
import { getSocketTableName } from "./socket-table.mjs";

const STALE_CONNECTION_STATUS = 410;

/**
 * Paginated scan of all connection metadata rows in the sockets table.
 */
export const listSocketConnections = async (tableName) => {
  if (!tableName) return [];

  const connections = [];
  let lastEvaluatedKey = null;

  do {
    const response = await handleScanCommand({
      TableName: tableName,
      ...(lastEvaluatedKey ? { ExclusiveStartKey: lastEvaluatedKey } : {}),
    });

    connections.push(...(response?.Items ?? []));
    lastEvaluatedKey = response?.LastEvaluatedKey ?? null;
  } while (lastEvaluatedKey);

  return connections;
};

const removeStaleConnection = async (tableName, connectionId) => {
  if (!tableName || !connectionId) return;

  await dbClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        PK: `CONNECTION#${connectionId}`,
        SK: "METADATA",
      },
    }),
  );
};

/**
 * Broadcast a JSON payload to every active WebSocket connection in the env table.
 * Removes stale connections (HTTP 410) from DynamoDB.
 */
export const broadcastSocketMessage = async ({
  socketClient,
  env,
  message,
  tableName,
}) => {
  const resolvedTable = tableName ?? getSocketTableName(env);
  if (!resolvedTable || !socketClient) {
    console.error("[socket-broadcast] Missing table name or socket client");
    return { sent: 0, failed: 0, staleRemoved: 0 };
  }

  const connections = await listSocketConnections(resolvedTable);
  const payload = Buffer.from(JSON.stringify(message));

  let sent = 0;
  let failed = 0;
  let staleRemoved = 0;

  for (const connection of connections) {
    const connectionId =
      connection?.id ?? connection?.PK?.replace("CONNECTION#", "");
    if (!connectionId) continue;

    try {
      await socketClient.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: payload,
        }),
      );
      sent += 1;
    } catch (error) {
      failed += 1;
      const statusCode = error?.$metadata?.httpStatusCode ?? error?.statusCode;

      if (statusCode === STALE_CONNECTION_STATUS) {
        try {
          await removeStaleConnection(resolvedTable, connectionId);
          staleRemoved += 1;
        } catch (deleteError) {
          console.error(
            "[socket-broadcast] Failed to remove stale connection",
            connectionId,
            deleteError,
          );
        }
      } else {
        console.error(
          "[socket-broadcast] Failed to post to connection",
          connectionId,
          error,
        );
      }
    }
  }

  console.log("[socket-broadcast] complete", {
    table: resolvedTable,
    total: connections.length,
    sent,
    failed,
    staleRemoved,
  });

  return { sent, failed, staleRemoved };
};
