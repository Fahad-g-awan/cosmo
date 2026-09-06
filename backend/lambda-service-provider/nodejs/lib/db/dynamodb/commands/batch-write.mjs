import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

import { API_ERRORS } from "../../../../constants/errors/index.mjs";
import { httpError } from "../../../errors/http-error.mjs";
import { dbClient } from "../ddb.client.mjs";

export const handleBatchWriteCommand = async (table, putRequests) => {
  try {
    const BATCH_SIZE = 25;
    const allUnprocessedItems = [];

    if (putRequests.length > BATCH_SIZE) {
      for (let i = 0; i < putRequests.length; i += BATCH_SIZE) {
        const batch = putRequests.slice(i, i + BATCH_SIZE);
        const command = new BatchWriteCommand({
          RequestItems: { [table]: batch },
        });
        const response = await dbClient.send(command);

        if (response.UnprocessedItems?.[table]?.length > 0) {
          allUnprocessedItems.push(...response.UnprocessedItems[table]);
        }
      }
    } else {
      const command = new BatchWriteCommand({
        RequestItems: { [table]: putRequests },
      });
      const response = await dbClient.send(command);
      if (response.UnprocessedItems?.[table]?.length > 0) {
        allUnprocessedItems.push(...response.UnprocessedItems[table]);
      }
    }

    if (allUnprocessedItems.length > 0) {
      throw httpError({
        error: API_ERRORS.INTERNAL_ERROR,
        message: "Error while inserting data in DB.",
        details: [`${allUnprocessedItems.length} items failed to write`],
      });
    }

    return { success: true, processedCount: putRequests.length };
  } catch (err) {
    console.error("Error occurred at handleBatchQuery:", err);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Error while inserting data in DB.",
      details: [err?.message],
    });
  }
};
