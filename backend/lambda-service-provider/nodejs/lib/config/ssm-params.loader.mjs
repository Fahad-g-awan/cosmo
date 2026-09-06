import { GetParametersByPathCommand } from "@aws-sdk/client-ssm";
import { ssmClient } from "./ssm.client.mjs";

/**
 * Fetch all SSM parameters under a path (paginated).
 *
 * @param {string} path - e.g. `/cosmediate/dev`
 * @returns {Promise<Record<string, string>>} Relative path segment → value
 */
export const fetchSsmParamsByPath = async (path) => {
  const allParams = {};
  let nextToken;

  do {
    const response = await ssmClient.send(
      new GetParametersByPathCommand({
        Path: path,
        Recursive: true,
        WithDecryption: true,
        NextToken: nextToken,
      }),
    );

    response.Parameters?.forEach((param) => {
      const key = param.Name?.split(`${path}/`).pop();
      if (key) allParams[key] = param.Value || "";
    });

    nextToken = response.NextToken;
  } while (nextToken);

  return allParams;
};
