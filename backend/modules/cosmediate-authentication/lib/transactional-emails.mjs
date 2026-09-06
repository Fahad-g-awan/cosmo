import {
  buildMailUrls,
  dispatchEmail,
  EMAIL_TYPE,
} from "/opt/nodejs/lib/mailer/index.mjs";
import {
  resolveIdentityDisplayName,
  resolvePersonDisplayName,
} from "/opt/nodejs/services/dynamodb/activity-feed.utils.mjs";

/**
 * @param {{
 *   config: Record<string, unknown>,
 *   databaseUrl?: string,
 *   identity: { email?: string, role?: string, entityId?: string, id?: string },
 *   logData?: Record<string, unknown>,
 * }} params
 */
export const sendPasswordChangedEmail = async ({
  config,
  databaseUrl,
  identity,
  logData = {},
}) => {
  if (!identity?.email) return;

  const displayName = databaseUrl
    ? await resolveIdentityDisplayName(databaseUrl, identity, logData)
    : resolvePersonDisplayName({ email: identity.email });

  const { signInUrl } = buildMailUrls(config);

  await dispatchEmail({
    to: identity.email,
    type: EMAIL_TYPE.PASSWORD_CHANGED,
    data: {
      name: displayName || identity.email,
      email: identity.email,
      changedAt: new Date().toISOString(),
      signInUrl,
    },
    config,
  });
};

/**
 * @param {{
 *   config: Record<string, unknown>,
 *   databaseUrl?: string,
 *   identity: { email?: string, role?: string, entityId?: string, id?: string },
 *   providerLabel: string,
 * }} params
 */
export const sendSocialAccountLinkedEmail = async ({
  config,
  databaseUrl,
  identity,
  providerLabel,
}) => {
  if (!identity?.email) return;

  const displayName = databaseUrl
    ? await resolveIdentityDisplayName(databaseUrl, identity)
    : resolvePersonDisplayName({ email: identity.email });

  const { signInUrl } = buildMailUrls(config);

  await dispatchEmail({
    to: identity.email,
    type: EMAIL_TYPE.SOCIAL_ACCOUNT_LINKED,
    data: {
      name: displayName || identity.email,
      email: identity.email,
      providerLabel,
      signInUrl,
    },
    config,
  });
};
