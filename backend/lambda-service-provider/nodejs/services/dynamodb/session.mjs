import { DDB_INDEX_NAMES } from "../../constants/db/dynamodb/index-names.constants.mjs";
import { handleQueryCommand } from "../../lib/db/dynamodb/commands/query.mjs";
import { ENTITY_TYPE } from "../../constants/db/entity-types.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../../lib/errors/http-error.mjs";

export const getSessionFromDB = async (tableName, sessionId) => {
  try {
    const getQuery = {
      TableName: tableName,
      IndexName: DDB_INDEX_NAMES.GSI1,
      KeyConditionExpression: "GSI1PK = :GSI1PK AND GSI1SK = :GSI1SK",
      FilterExpression: "attribute_not_exists(deleted) or deleted = :deleted",
      ExpressionAttributeValues: {
        ":GSI1PK": `IDP_SESSION#${sessionId}`,
        ":GSI1SK": ENTITY_TYPE.SESSION,
        ":deleted": false,
      },
    };

    let foundSession = await handleQueryCommand(getQuery);
    foundSession = foundSession.Items.length > 0 ? foundSession.Items[0] : null;

    return foundSession;
  } catch (error) {
    console.error("Error occurred at getSessionFromDB:", error);

    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      message: "Session not found",
      details: [`Failed to fetch session for session id ${sessionId}`],
    });
  }
};

export const getSessionByUserIdFromDB = async (tableName, userId) => {
  try {
    const getQuery = {
      TableName: tableName,
      IndexName: DDB_INDEX_NAMES.GSI5,
      KeyConditionExpression: "GSI5PK = :GSI5PK AND GSI5SK = :GSI5SK",
      FilterExpression: "attribute_not_exists(deleted) or deleted = :deleted",
      ExpressionAttributeValues: {
        ":GSI5PK": `USER#${userId}`,
        ":GSI5SK": "USER_SESSION",
        ":deleted": false,
      },
    };

    let foundSession = await handleQueryCommand(getQuery);
    foundSession = foundSession.Items.length > 0 ? foundSession.Items[0] : null;

    return foundSession;
  } catch (error) {
    console.error("Error occurred at getSessionByUserIdFromDB:", error);

    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      message: "Session not found",
      details: [`Failed to fetch session for user id ${userId}`],
    });
  }
};
