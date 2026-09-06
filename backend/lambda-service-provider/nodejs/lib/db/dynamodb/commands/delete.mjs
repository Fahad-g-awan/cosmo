import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

import { API_ERRORS } from "../../../../constants/errors/index.mjs";
import { httpError } from "../../../errors/http-error.mjs";
import { dbClient } from "../ddb.client.mjs";

export const handleDeleteCommand = async (query) => {
  try {
    const command = new DeleteCommand(query);
    const response = await dbClient.send(command);
    console.log("Delete command response:", response);

    return response;
  } catch (err) {
    console.error("Error occurred at handleDeleteCommand:", err);

    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Error while deleting data in DB.",
      details: [err?.message],
    });
  }
};
