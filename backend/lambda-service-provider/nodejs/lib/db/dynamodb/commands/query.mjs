import { QueryCommand } from "@aws-sdk/lib-dynamodb";

import { API_ERRORS } from "../../../../constants/errors/index.mjs";
import { httpError } from "../../../errors/http-error.mjs";
import { dbClient } from "../ddb.client.mjs";

export const handleQueryCommand = async (query) => {
  try {
    const command = new QueryCommand(query);
    const response = await dbClient.send(command);
    console.log("Query command response:", response);

    return response;
  } catch (err) {
    console.error("Error occurred during QueryCommand execution:", err);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Error while fetching records from DB.",
      details: [err?.message],
    });
  }
};
