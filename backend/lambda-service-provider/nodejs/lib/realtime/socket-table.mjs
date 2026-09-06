const DEFAULT_TABLE_BASE = "cosmediate_sockets";

/**
 * DynamoDB table for active WebSocket connection metadata (`{base}_{env}`).
 */
export const getSocketTableName = (
  env,
  baseName = process.env.DB_TABLE_NAME || DEFAULT_TABLE_BASE,
) => {
  if (!env || !baseName) return null;
  return `${baseName}_${env}`;
};
