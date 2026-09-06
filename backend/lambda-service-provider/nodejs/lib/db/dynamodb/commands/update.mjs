import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { API_ERRORS } from "../../../../constants/errors/index.mjs";
import { httpError } from "../../../errors/http-error.mjs";
import { dbClient } from "../ddb.client.mjs";

export const handleUpdateCommand = async (query) => {
  try {
    const command = new UpdateCommand(query);
    const response = await dbClient.send(command);
    console.log("Update command response:", response);

    return response;
  } catch (err) {
    console.error("Error occurred at handleUpdateCommand:", err);

    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Error while updating data in DB.",
      details: [err?.message],
    });
  }
};
