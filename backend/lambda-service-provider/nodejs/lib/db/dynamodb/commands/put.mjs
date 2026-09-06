import { PutCommand } from "@aws-sdk/lib-dynamodb";

import { API_ERRORS } from "../../../../constants/errors/index.mjs";
import { httpError } from "../../../errors/http-error.mjs";
import { dbClient } from "../ddb.client.mjs";

export const handlePutCommand = async (table, query) => {
  try {
    const command = new PutCommand({
      TableName: table,
      Item: query,
    });

    const response = await dbClient.send(command);
    console.log("Create command response:", response);

    return response;
  } catch (err) {
    console.error("Error occurred during PutCommand execution:", err);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Error while inserting data in DB.",
      details: [err?.message],
    });
  }
};
