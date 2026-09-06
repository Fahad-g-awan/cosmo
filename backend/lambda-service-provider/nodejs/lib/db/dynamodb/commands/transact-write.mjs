import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

import { API_ERRORS } from "../../../../constants/errors/index.mjs";
import { httpError } from "../../../errors/http-error.mjs";
import { dbClient } from "../ddb.client.mjs";

export const handleTransactWriteCommand = async (table, items) => {
  try {
    const transactItems = items.map((item) => ({
      Put: {
        TableName: table,
        Item: item,
        ConditionExpression:
          "attribute_not_exists(PK) AND attribute_not_exists(SK)",
      },
    }));

    const command = new TransactWriteCommand({
      TransactItems: transactItems,
    });

    const response = await dbClient.send(command);
    console.log("Transact write command response:", response);

    return response;
  } catch (err) {
    console.error("Error occurred during TransactWriteCommand execution:", err);

    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Error while inserting data in DB.",
      details: [err?.message],
    });
  }
};
