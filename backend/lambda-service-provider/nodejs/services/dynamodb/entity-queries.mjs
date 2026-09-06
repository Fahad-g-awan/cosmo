import { DDB_GSI_KEYS } from "../../constants/db/dynamodb/gsi-keys.constants.mjs";
import { DDB_INDEX_NAMES } from "../../constants/db/dynamodb/index-names.constants.mjs";
import { handleQueryCommand } from "../../lib/db/dynamodb/commands/query.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../../lib/errors/http-error.mjs";

export const getEntityByLookupKey = async (tableName, lookupKey) => {
  try {
    const getQuery = {
      TableName: tableName,
      IndexName: DDB_INDEX_NAMES.GSI2,
      KeyConditionExpression: "GSI2PK = :GSI2PK AND GSI2SK = :GSI2SK",
      FilterExpression: "attribute_not_exists(deleted) or deleted = :deleted",
      ExpressionAttributeValues: {
        ":GSI2PK": lookupKey,
        ":GSI2SK": DDB_GSI_KEYS.GSI2SK_SEARCH_LOOKUPKEY,
        ":deleted": false,
      },
    };
    console.log("getQuery", JSON.stringify(getQuery));

    let foundData = await handleQueryCommand(getQuery);
    foundData = foundData.Items.length > 0 ? foundData.Items[0] : null;

    return foundData;
  } catch (error) {
    console.error("Error occurred at getEntityByLookupKey:", error);

    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      message: "Data not found",
      details: [`Failed to fetch data for lookup key ${lookupKey}`],
    });
  }
};

export const getEntityById = async (tableName, GSI1PK, GSI1SK) => {
  try {
    const getQuery = {
      TableName: tableName,
      IndexName: DDB_INDEX_NAMES.GSI1,
      KeyConditionExpression: "GSI1PK = :GSI1PK and GSI1SK = :GSI1SK",
      FilterExpression: "attribute_not_exists(deleted) or deleted = :deleted",
      ExpressionAttributeValues: {
        ":GSI1PK": GSI1PK,
        ":GSI1SK": GSI1SK,
        ":deleted": false,
      },
    };

    let foundData = await handleQueryCommand(getQuery);
    foundData = foundData.Items.length > 0 ? foundData.Items[0] : null;

    return foundData;
  } catch (error) {
    console.error("Error occurred at getEntityById:", error);

    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      message: "Data not found",
      details: [`Failed to fetch data for ${GSI1PK} and ${GSI1SK}`],
    });
  }
};

export const getAllItemsByEntityType = async (
  tableName,
  limit,
  lastEvaluatedKey,
  GSI3PK,
) => {
  try {
    let allRecords = [];
    let exclusiveStartKey = lastEvaluatedKey;

    do {
      const getQuery = {
        TableName: tableName,
        IndexName: DDB_INDEX_NAMES.GSI3,
        KeyConditionExpression: "GSI3PK = :GSI3PK AND GSI3SK = :GSI3SK",
        FilterExpression: "attribute_not_exists(deleted) or deleted = :deleted",
        ExpressionAttributeValues: {
          ":GSI3PK": GSI3PK,
          ":GSI3SK": DDB_GSI_KEYS.GSI3SK_SEARCH_ENTITY_TYPE,
          ":deleted": false,
        },
        Limit: limit,
      };

      if (exclusiveStartKey) {
        getQuery.ExclusiveStartKey = exclusiveStartKey;
      }

      const response = await handleQueryCommand(getQuery);

      allRecords = [...allRecords, ...response.Items];
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (allRecords.length < limit && exclusiveStartKey);

    return { items: allRecords, lastEvaluatedKey: exclusiveStartKey };
  } catch (error) {
    console.error("Error occurred at getAllItemsByEntityType:", error);

    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      message: "Items not found",
      details: ["Failed to fetch items"],
    });
  }
};
