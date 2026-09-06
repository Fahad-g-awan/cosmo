/**
 * Cognito trigger Lambdas: resolve stage + DB URL from env (no SSM loadConfig — cold-start budget).
 *
 * Required Lambda env:
 *   COGNITO_POOL_ID_DEV, COGNITO_POOL_ID_PROD
 *   POSTGRES_DB_URL_DEV, POSTGRES_DB_URL_PROD
 *   EVENT_BUS_NAME_DEV, EVENT_BUS_NAME_PROD (PostConfirmation provisioning)
 */

const POOL_STAGE_MAP = {
  [process.env.COGNITO_POOL_ID_DEV]: "dev",
  [process.env.COGNITO_POOL_ID_PROD]: "prod",
};

export const resolveStageFromUserPoolId = (userPoolId) => {
  const stage = POOL_STAGE_MAP[userPoolId];
  if (!stage) {
    throw new Error(
      `Unknown Cognito user pool "${userPoolId}". Set COGNITO_POOL_ID_DEV / COGNITO_POOL_ID_PROD.`,
    );
  }
  return stage;
};

export const getTriggerConfig = (userPoolId) => {
  const ENV = resolveStageFromUserPoolId(userPoolId);
  const postgresDbUrl =
    process.env[`POSTGRES_DB_URL_${ENV.toUpperCase()}`] ?? null;

  if (!postgresDbUrl) {
    throw new Error(
      `Missing POSTGRES_DB_URL_${ENV.toUpperCase()} for Cognito trigger (pool ${userPoolId}).`,
    );
  }

  return {
    ENV,
    COGNITO_USER_POOL_ID: userPoolId,
    POSTGRES_DB_URL: postgresDbUrl,
    EVENT_BUS_NAME: process.env[`EVENT_BUS_NAME_${ENV.toUpperCase()}`] ?? null,
  };
};
