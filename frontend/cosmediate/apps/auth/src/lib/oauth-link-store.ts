import { PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "node:crypto";
import { DateTime } from "luxon";

import { dbClient, getAuthTableName } from "./db-config";
import { debugAuth } from "./debug-log";

const ENTITY_TYPE_OAUTH_LINK = "ENTITY_TYPE#OAUTH_LINK";

export interface StoredOAuthLinkContext {
  linkSessionId: string;
  returnTo: string;
  provider: string;
  email: string;
  userId: string;
  accessToken: string;
  authorizeUrl: string;
  redirectUri: string;
  appOrigin: string;
  appClientId: string;
  attempt: number;
  expiresAt: number;
}

export async function storeOAuthLinkContext(
  ctx: Omit<StoredOAuthLinkContext, "linkSessionId" | "expiresAt">,
  ttlMinutes = 10,
): Promise<string> {
  const linkSessionId = randomBytes(16).toString("hex");
  const now = DateTime.utc();
  const expiresAt = now.plus({ minutes: ttlMinutes });

  const item = {
    PK: `OAUTH_LINK#${linkSessionId}`,
    SK: "METADATA",
    entityType: ENTITY_TYPE_OAUTH_LINK,
    linkSessionId: linkSessionId,
    ...ctx,
    createdAt: now.toISO(),
    expiresAt: Math.floor(expiresAt.toSeconds()),
  };

  await dbClient.send(
    new PutCommand({
      TableName: getAuthTableName(),
      Item: item,
    }),
  );

  debugAuth(`[storeOAuthLinkContext] stored ${linkSessionId}`);
  return linkSessionId;
}

export async function getOAuthLinkContext(
  linkSessionId: string,
): Promise<StoredOAuthLinkContext | null> {
  const result = await dbClient.send(
    new GetCommand({
      TableName: getAuthTableName(),
      Key: {
        PK: `OAUTH_LINK#${linkSessionId}`,
        SK: "METADATA",
      },
    }),
  );

  const item = result.Item;
  if (!item) return null;

  const now = Math.floor(DateTime.utc().toSeconds());
  if (typeof item.expiresAt === "number" && item.expiresAt <= now) {
    return null;
  }

  return item as StoredOAuthLinkContext;
}

export async function updateOAuthLinkAttempt(
  linkSessionId: string,
  attempt: number,
): Promise<void> {
  const existing = await getOAuthLinkContext(linkSessionId);
  if (!existing) return;

  await dbClient.send(
    new PutCommand({
      TableName: getAuthTableName(),
      Item: {
        PK: `OAUTH_LINK#${linkSessionId}`,
        SK: "METADATA",
        entityType: ENTITY_TYPE_OAUTH_LINK,
        ...existing,
        attempt,
      },
    }),
  );
}

export async function deleteOAuthLinkContext(
  linkSessionId: string,
): Promise<void> {
  await dbClient.send(
    new DeleteCommand({
      TableName: getAuthTableName(),
      Key: {
        PK: `OAUTH_LINK#${linkSessionId}`,
        SK: "METADATA",
      },
    }),
  );
}

export function appendStateToAuthorizeUrl(
  authorizeUrl: string,
  linkSessionId: string,
): string {
  const url = new URL(authorizeUrl);
  url.searchParams.set("state", linkSessionId);
  return url.toString();
}
