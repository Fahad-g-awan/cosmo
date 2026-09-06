/**
 * Maps SSM parameters (under `/cosmediate/{env}/`) into runtime app config.
 */
export const APP_CONFIG_SSM_BINDINGS = [
  { configKey: "AWS_REGION", ssmKey: "aws/region" },
  { configKey: "BACKEND_URL", ssmKey: "url/backend_api" },
  { configKey: "COGNITO_CLIENT_ID", ssmKey: "cognito/client_id" },
  { configKey: "COGNITO_USER_POOL_ID", ssmKey: "cognito/user_pool_id" },
  { configKey: "COGNITO_DOMAIN", ssmKey: "cognito/url/domain" },
  { configKey: "COOKIE_DOMAIN", ssmKey: "url/cookie_domain" },
  { configKey: "S3_BUCKET", ssmKey: "S3/bucket" },
  { configKey: "POSTGRES_DB_URL", ssmKey: "postgres/url/database_url" },

  { configKey: "DDB_MAIN_TABLE_NAME", ssmKey: "ddb/table/main" },
  {
    configKey: "DDB_OAUTH_CLIENT_APPS_TABLE_NAME",
    ssmKey: "ddb/table/clients",
  },
  { configKey: "DDB_AUTH_TABLE_NAME", ssmKey: "ddb/table/auth" },

  { configKey: "REDIS_URL", ssmKey: "redis/url" },
  { configKey: "SOCKET_API", ssmKey: "url/socket_api" },
  { configKey: "OPENSEARCH_ENDPOINT", ssmKey: "opensearch/endpoint" },
  { configKey: "EMAIL_QUEUE_URL", ssmKey: "sqs/emails_queue" },
  { configKey: "EVENT_BUS_NAME", ssmKey: "event_bridge/bus_name" },
  { configKey: "GOOGLE_GEOCODING_API_KEY", ssmKey: "google/geocode_api_key" },
  { configKey: "GOOGLE_GEOCODING_API_URL", ssmKey: "google/url/geocode_api" },

  /** Mailer config. (OPTIONAL) */
  { configKey: "APP_BASE_URL", ssmKey: "url/app_base" },
  { configKey: "APP_DASHBOARD_URL", ssmKey: "url/app_dashboard" },
  { configKey: "MAIL_FROM_ADDRESS", ssmKey: "mail/from_address" },
  { configKey: "MAIL_REPLY_TO", ssmKey: "mail/reply_to" },
  { configKey: "DEV_ALERT_EMAILS", ssmKey: "mail/dev_alert_emails" },
  {
    configKey: "ADMIN_NOTIFICATION_EMAILS",
    ssmKey: "mail/admin_notification_emails",
  },
  {
    configKey: "MANDATORY_NOTIFICATION_EMAILS",
    ssmKey: "mail/mandatory_notification_emails",
  },
  {
    configKey: "DEV_ALERT_MIN_INTERVAL_MS",
    ssmKey: "mail/dev_alert_min_interval_ms",
  },
  {
    configKey: "USER_NOTIFICATIONS_ENABLED",
    ssmKey: "mail/user_notifications_enabled",
  },
];

export const APP_SECRET_BINDINGS = [
  {
    name: (env) => `cosmediate/${env}/cognito/client_secret`,
    as: "COGNITO_CLIENT_SECRET",
    jsonKey: "COGNITO_CLIENT_SECRET",
  },
];

/**
 * Builds the app config object from the SSM parameters and secrets.
 * @param {string} env
 * @param {Record<string, string>} ssmParams
 * @param {Record<string, string>} secrets
 */
export const buildAppConfig = (env, ssmParams, secrets) => {
  const cfg = {
    ENV: env,
    COGNITO_CLIENT_SECRET: secrets.COGNITO_CLIENT_SECRET,
  };

  for (const { configKey, ssmKey } of APP_CONFIG_SSM_BINDINGS) {
    const value = ssmParams[ssmKey];
    cfg[configKey] = value;

    // if (value != null && value !== "") {
    // }
  }

  return cfg;
};
