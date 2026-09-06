import { ScanCommand } from "@aws-sdk/lib-dynamodb";

import { API_ERRORS } from "../../../../constants/errors/index.mjs";
import { httpError } from "../../../errors/http-error.mjs";
import { dbClient } from "../ddb.client.mjs";

export const handleScanCommand = async (query) => {
  try {
    const command = new ScanCommand(query);
    const response = await dbClient.send(command);
    console.log("Scan command response:", response);

    return response;
  } catch (err) {
    console.error("Error occurred during ScanCommand execution:", err);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Error while fetching records from DB.",
      details: [err?.message],
    });
  }
};
