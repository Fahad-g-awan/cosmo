import { DateTime } from "luxon";

import { API_ERRORS } from "../../constants/errors/index.mjs";
import { rethrowOrInternal, httpError } from "../../lib/errors/http-error.mjs";
import { runWithConcurrency } from "../../lib/async/batch.utils.mjs";
import { handleUpdateCommand } from "../../lib/db/dynamodb/commands/update.mjs";

export const handleUpdateEntitySearchCount = async (tableName, allRecords) => {
  try {
    if (!allRecords?.length) return 0;
    let updated = 0;

    await runWithConcurrency(allRecords, 10, async (record) => {
      try {
        const updateCommand = {
          TableName: tableName,
          Key: {
            PK: record.PK,
            SK: record.SK,
          },
          UpdateExpression: `SET
              #searchCount = :searchCount,
              #updatedAt = :updatedAt
          `,
          ExpressionAttributeNames: {
            "#searchCount": "searchCount",
            "#updatedAt": "updatedAt",
          },
          ExpressionAttributeValues: {
            ":searchCount": record.searchCount + 1,
            ":updatedAt": DateTime.utc().toISO(),
          },
          ReturnValues: "ALL_NEW",
        };

        await handleUpdateCommand(updateCommand);
        updated++;
      } catch (e) {
        console.error(
          `[handleUpdateEntitySearchCount] Failed updating record ${
            record?.PK || record?.id
          }`,
          e?.message || String(e),
        );

        throw httpError({
          error: API_ERRORS.BAD_REQUEST,
          message: "Something went wrong",
          details: [
            `Failed to update entity search count for record ${
              record?.PK || record?.id
            }`,
            e?.message ?? String(e),
          ],
        });
      }
    });

    return updated;
  } catch (error) {
    console.error("Error occurred at handleEntitySearchCountUpdate:", error);
    rethrowOrInternal(error);
  }
};
