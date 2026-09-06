import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const getClientConfig = (): DynamoDBClientConfig => {
  const config: DynamoDBClientConfig = {
    region: process.env.AWS_REGION || "eu-central-1",
  };

  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }

  return config;
};

const client = new DynamoDBClient(getClientConfig());
export const dbClient = DynamoDBDocumentClient.from(client);

export const getAuthTableName = () => {
  const tableName = process.env.DYNAMODB_AUTH_TABLE_NAME;
  if (!tableName) {
    throw new Error("DYNAMODB_AUTH_TABLE_NAME environment variable is not set");
  }
  return tableName;
};

export const getClientTableName = () => {
  const tableName = process.env.DYNAMODB_CLIENT_TABLE_NAME;
  if (!tableName) {
    throw new Error(
      "DYNAMODB_CLIENT_TABLE_NAME environment variable is not set",
    );
  }
  return tableName;
};
