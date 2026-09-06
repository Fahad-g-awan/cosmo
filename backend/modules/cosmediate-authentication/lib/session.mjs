import { DateTime } from "luxon";

import { DDB_GSI_KEYS } from "/opt/nodejs/constants/db/dynamodb/gsi-keys.constants.mjs";
import { handleDeleteCommand } from "/opt/nodejs/lib/db/dynamodb/commands/delete.mjs";
import { handleUpdateCommand } from "/opt/nodejs/lib/db/dynamodb/commands/update.mjs";
import { ENTITY_TYPE } from "/opt/nodejs/constants/db/entity-types.mjs";

import { REFRESH_TOKEN_MAX_AGE_SECONDS } from "./signin-response.mjs";

/**
 * Hard-delete an IdP session row (single-session model).
 *
 * @param {{ tableName: string, PK: string, SK: string }} params
 * @returns {Promise<void>}
 */
export const deleteSession = async ({ tableName, PK, SK }) => {
  await handleDeleteCommand({
    TableName: tableName,
    Key: { PK, SK },
  });
};

const serializeDate = (d) => {
  if (!d) return "";
  if (typeof d === "string") return d;
  return DateTime.fromJSDate(d, { zone: "utc" }).toISO();
};

export const storeSession = async ({
  PK,
  SK,
  tableName,
  accessToken,
  refreshToken,
  idToken,
  expiresIn,
  sessionId,
  user,
  tokenRefreshMode,
  cognitoUsername,
}) => {
  const updateCommand = {
    TableName: tableName,
    Key: { PK, SK },
    UpdateExpression: `SET
      #updatedAt = :updatedAt,
      #accessToken = :accessToken,
      #idToken = :idToken,
      #expiresAt = :expiresAt
    `,
    ExpressionAttributeNames: {
      "#updatedAt": "updatedAt",
      "#accessToken": "accessToken",
      "#idToken": "idToken",
      "#expiresAt": "expiresAt",
    },
    ExpressionAttributeValues: {
      ":updatedAt": DateTime.utc().toISO(),
      ":accessToken": accessToken,
      ":idToken": idToken,
      ":expiresAt": Math.floor(DateTime.now().toSeconds()) + expiresIn,
    },
    ReturnValues: "ALL_NEW",
  };

  if (sessionId && refreshToken && user) {
    const userForStorage = {
      ...user,
      createdAt: serializeDate(user.createdAt),
      updatedAt: serializeDate(user.updatedAt),
    };

    const refreshTokenExpiresAt =
      Math.floor(DateTime.now().toSeconds()) + REFRESH_TOKEN_MAX_AGE_SECONDS;

    updateCommand.UpdateExpression += `,
      #id = :id,
      #createdAt = :createdAt,
      #deletedAt = :deletedAt,
      #deleted = :deleted,
      #sessionId = :sessionId,
      #email = :email,
      #sub = :sub,
      #user = :user,
      #refreshToken = :refreshToken,
      #refreshTokenExpiresAt = :refreshTokenExpiresAt,
      #GSI1PK = :GSI1PK,
      #GSI1SK = :GSI1SK,
      #GSI3PK = :GSI3PK,
      #GSI3SK = :GSI3SK,
      #GSI5PK = :GSI5PK,
      #GSI5SK = :GSI5SK
    `;

    Object.assign(updateCommand.ExpressionAttributeNames, {
      "#id": "id",
      "#createdAt": "createdAt",
      "#deletedAt": "deletedAt",
      "#deleted": "deleted",
      "#email": "email",
      "#user": "user",
      "#sub": "sub",
      "#refreshToken": "refreshToken",
      "#refreshTokenExpiresAt": "refreshTokenExpiresAt",
      "#sessionId": "sessionId",
      "#GSI1PK": "GSI1PK",
      "#GSI1SK": "GSI1SK",
      "#GSI3PK": "GSI3PK",
      "#GSI3SK": "GSI3SK",
      "#GSI5PK": "GSI5PK",
      "#GSI5SK": "GSI5SK",
    });

    Object.assign(updateCommand.ExpressionAttributeValues, {
      ":id": sessionId,
      ":createdAt": DateTime.utc().toISO(),
      ":deletedAt": "",
      ":deleted": false,
      ":user": userForStorage,
      ":email": userForStorage.email,
      ":sub": userForStorage.cognitoSub ?? null,
      ":sessionId": sessionId,
      ":refreshToken": refreshToken,
      ":refreshTokenExpiresAt": refreshTokenExpiresAt,
      ":GSI1PK": `IDP_SESSION#${sessionId}`,
      ":GSI1SK": ENTITY_TYPE.SESSION,
      ":GSI3PK": ENTITY_TYPE.SESSION,
      ":GSI3SK": DDB_GSI_KEYS.GSI3SK_SEARCH_ENTITY_TYPE,
      ":GSI5PK": `USER#${userForStorage.id}`,
      ":GSI5SK": "USER_SESSION",
    });

    if (tokenRefreshMode) {
      updateCommand.UpdateExpression += `,
        #tokenRefreshMode = :tokenRefreshMode
      `;
      updateCommand.ExpressionAttributeNames["#tokenRefreshMode"] =
        "tokenRefreshMode";
      updateCommand.ExpressionAttributeValues[":tokenRefreshMode"] =
        tokenRefreshMode;
    }

    if (cognitoUsername) {
      updateCommand.UpdateExpression += `,
        #cognitoUsername = :cognitoUsername
      `;
      updateCommand.ExpressionAttributeNames["#cognitoUsername"] =
        "cognitoUsername";
      updateCommand.ExpressionAttributeValues[":cognitoUsername"] =
        cognitoUsername;
    }
  }

  const result = await handleUpdateCommand(updateCommand);
  return result?.Attributes ?? null;
};
