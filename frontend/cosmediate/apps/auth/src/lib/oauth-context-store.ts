import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "node:crypto";
import { DateTime } from "luxon";

import type { UserRole } from "@cosmediate/type-utils";

import { dbClient, getAuthTableName } from "./db-config";
import { debugAuth } from "./debug-log";

const ENTITY_TYPE_OAUTH_CONTEXT = "ENTITY_TYPE#OAUTH_CONTEXT";
const TABLE_GSI_KEY_SEARCH = "SEARCH#ENTITY_TYPE";

export interface OAuthClientContext {
  client_id: string;
  redirect_uri: string;
  scope: string;
  app_origin?: string | null;
  return_to: string;
  locale?: string | null;
}

/**
 * Session blob attached to an OAuth context (Phase 6 — snake_case, flat scalars).
 * Returned verbatim from `/api/auth/token` (OAuth boundary).
 */
export interface SessionData {
  session_id: string;
  identity_id: string;
  profile_id: string;
  user_role: UserRole;
  access_token: string;
  token_exp: number;
  refresh_exp: number;
}

export function normalizeSessionDataForToken(
  v: SessionData | undefined,
): SessionData | null {
  if (
    !v ||
    typeof v.session_id !== "string" ||
    typeof v.identity_id !== "string"
  ) {
    return null;
  }
  return v;
}

/**
 * Runtime shape of the DynamoDB record. Field types match what's actually
 * written by `storeOAuthContext` and read by `getOAuthContext` — no
 * mappers needed because DDB ↔ runtime are 1:1 for this entity.
 *
 * `expiresAt` is unix-seconds (UTC); `expiresAtISO` is a write-only mirror
 * kept for human inspection of DDB rows. `createdAt` / `updatedAt` are
 * ISO-8601 because they're human-facing audit timestamps.
 */
export interface StoredOAuthContext extends OAuthClientContext {
  id: string;
  contextId: string;
  oauthCode: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: number;
  expiresAtISO?: string;
  used: boolean;
  sessionData?: SessionData;
}

function generateOAuthCode(): string {
  return randomBytes(32).toString("hex");
}

function isConditionalCheckFailure(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: string }).name === "ConditionalCheckFailedException"
  );
}

/**
 * Atomically marks an OAuth context as used only when still unused, unexpired,
 * and matching the authorize-time `redirect_uri` + `client_id`. Avoids replay
 * races and prevents burning a code when `redirect_uri` does not match context.
 */
export async function claimOAuthContextForTokenExchange({
  oauthCode,
  redirect_uri,
  client_id,
}: {
  oauthCode: string;
  redirect_uri: string;
  client_id: string;
}): Promise<StoredOAuthContext | null> {
  const nowSeconds = Math.floor(DateTime.utc().toSeconds());

  try {
    const result = await dbClient.send(
      new UpdateCommand({
        TableName: getAuthTableName(),
        Key: {
          PK: `OAUTH_CONTEXT#${oauthCode}`,
          SK: "METADATA",
        },
        UpdateExpression: "SET #used = :true, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#used": "used",
        },
        ExpressionAttributeValues: {
          ":false": false,
          ":true": true,
          ":now": nowSeconds,
          ":updatedAt": DateTime.utc().toISO(),
          ":redirect_uri": redirect_uri,
          ":client_id": client_id,
        },
        ConditionExpression:
          "attribute_exists(PK) AND attribute_exists(SK) AND #used = :false AND expiresAt > :now AND redirect_uri = :redirect_uri AND client_id = :client_id",
        ReturnValues: "ALL_OLD",
      }),
    );

    const attrs = result.Attributes;
    if (!attrs) return null;

    return attrs as StoredOAuthContext;
  } catch (error) {
    if (isConditionalCheckFailure(error)) {
      debugAuth(
        `[claimOAuthContextForTokenExchange] conditional failure oauthCode=${oauthCode}`,
      );
      return null;
    }
    console.error("[claimOAuthContextForTokenExchange]", error);
    throw new Error("Failed to claim OAuth context");
  }
}

export async function storeOAuthContext(
  context: OAuthClientContext,
  ttlMinutes: number = 10,
): Promise<string> {
  try {
    const oauthCode = generateOAuthCode();
    const now = DateTime.utc();
    const expiresAt = now.plus({ minutes: ttlMinutes });

    const item = {
      PK: `OAUTH_CONTEXT#${oauthCode}`,
      SK: "METADATA",
      oauthCode,
      entityType: ENTITY_TYPE_OAUTH_CONTEXT,

      // OAuth context data
      client_id: context.client_id,
      redirect_uri: context.redirect_uri,
      scope: context.scope,
      app_origin: context.app_origin || "",
      return_to: context.return_to,

      // Metadata
      createdAt: now.toISO(),
      updatedAt: now.toISO(),
      expiresAtISO: expiresAt.toISO(),
      expiresAt: Math.floor(expiresAt.toSeconds()),
      used: false,

      // GSI indexes for querying
      GSI1PK: `OAUTH_CONTEXT#${oauthCode}`,
      GSI1SK: ENTITY_TYPE_OAUTH_CONTEXT,

      GSI3PK: ENTITY_TYPE_OAUTH_CONTEXT,
      GSI3SK: TABLE_GSI_KEY_SEARCH,

      GSI5PK: context.client_id,
      GSI5SK: ENTITY_TYPE_OAUTH_CONTEXT,
    };

    const command = new PutCommand({
      TableName: getAuthTableName(),
      Item: item,
    });

    await dbClient.send(command);
    debugAuth(`[storeOAuthContext] Stored context ${oauthCode}`);

    return oauthCode;
  } catch (error) {
    console.error("[storeOAuthContext] Error storing OAuth context:", error);
    throw new Error("Failed to store OAuth context in DynamoDB");
  }
}

const getOAuthCtxParamsForClientId = (clientId: string) => {
  return {
    TableName: getAuthTableName(),
    IndexName: "GSI5",
    KeyConditionExpression: "GSI5PK = :GSI5PK AND GSI5SK = :GSI5SK",
    ExpressionAttributeValues: {
      ":GSI5PK": clientId,
      ":GSI5SK": ENTITY_TYPE_OAUTH_CONTEXT,
    },
  };
};

const getOAuthCtxParamsForOAuthCode = (oauthCode: string) => {
  return {
    TableName: getAuthTableName(),
    KeyConditionExpression: "PK = :pk AND SK = :sk",
    ExpressionAttributeValues: {
      ":pk": `OAUTH_CONTEXT#${oauthCode}`,
      ":sk": "METADATA",
    },
  };
};

export async function getOAuthContext({
  oauthCode,
  clientId,
}: {
  oauthCode?: string;
  clientId?: string;
}): Promise<StoredOAuthContext | null> {
  try {
    const params = oauthCode
      ? getOAuthCtxParamsForOAuthCode(oauthCode)
      : getOAuthCtxParamsForClientId(clientId!);

    const command = new QueryCommand(params);
    const response = await dbClient.send(command);

    const item = response.Items?.[0];

    if (!item) {
      debugAuth(
        `[getOAuthContext] context not found (clientId=${clientId} oauthCode=${oauthCode})`,
      );
      return null;
    }

    if (item.used) {
      debugAuth(
        `[getOAuthContext] context already used (clientId=${clientId} oauthCode=${oauthCode})`,
      );
      return null;
    }

    const expiresAt = DateTime.fromSeconds(item.expiresAt).toUTC().toSeconds();
    const now = DateTime.utc().toSeconds();

    if (expiresAt < now) {
      debugAuth(
        `[getOAuthContext] context expired (clientId=${clientId} oauthCode=${oauthCode})`,
      );
      return null;
    }

    return item as StoredOAuthContext;
  } catch (error) {
    console.error("[getOAuthContext] Error retrieving OAuth context:", error);
    throw new Error("Failed to retrieve OAuth context from DynamoDB");
  }
}

export async function updateOAuthContext({
  oauthCode,
  used,
  sessionData,
}: {
  oauthCode: string;
  used?: boolean;
  sessionData?: SessionData;
}) {
  try {
    let updateExpression = "SET updatedAt = :updatedAt";
    const expressionAttributeValues: Record<string, unknown> = {
      ":updatedAt": DateTime.utc().toISO(),
    };

    if (used !== undefined) {
      updateExpression += ", used = :used";
      expressionAttributeValues[":used"] = used;
    }

    if (sessionData) {
      updateExpression += ", sessionData = :sessionData";
      expressionAttributeValues[":sessionData"] = sessionData;
    }

    const command = new UpdateCommand({
      TableName: getAuthTableName(),
      Key: {
        PK: `OAUTH_CONTEXT#${oauthCode}`,
        SK: "METADATA",
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    await dbClient.send(command);
    debugAuth(`[updateOAuthContext] Updated context ${oauthCode}`);
  } catch (error) {
    console.error("[updateOAuthContext] Error updating OAuth context:", error);
    throw new Error("Failed to update OAuth context in DynamoDB");
  }
}
