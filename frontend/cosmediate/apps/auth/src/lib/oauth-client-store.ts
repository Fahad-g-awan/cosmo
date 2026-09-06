import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dbClient, getClientTableName } from "./db-config";

export interface OAuthClient {
  PK: string;
  SK: string;
  id: string;
  entityType: string;
  clientId: string;
  hashedSecret: string;
  name: string;
  redirectURIs: string[];
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export async function getOAuthClient(
  clientId: string
): Promise<OAuthClient | null> {
  try {
    const command = new GetCommand({
      TableName: getClientTableName(),
      Key: {
        PK: `OAUTH_CLIENT_APP#${clientId}`,
        SK: "METADATA",
      },
    });

    const response = await dbClient.send(command);

    if (!response.Item) {
      console.log(`[getOAuthClient] Client ${clientId} not found`);
      return null;
    }

    const item = response.Item;

    // Check if deleted
    if (item.deleted) {
      console.log(`[getOAuthClient] Client ${clientId} is deleted`);
      return null;
    }

    // Check if active
    if (item.status !== "active") {
      console.log(
        `[getOAuthClient] Client ${clientId} is not active (status: ${item.status})`
      );
      return null;
    }

    return item as OAuthClient;
  } catch (error) {
    console.error("[getOAuthClient] Error retrieving OAuth client:", error);
    throw new Error("Failed to retrieve OAuth client from DynamoDB");
  }
}
