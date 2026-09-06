import {
  isCosmediateAdminActor,
  OVERSIGHT_SCOPE,
  resolveActorEmail,
  resolveOversightScope,
} from "./notification-emails/actor-routing.mjs";
import { resolvePersonDisplayName } from "../../services/dynamodb/activity-feed.utils.mjs";
import { sendAdminNotification, sendUserNotification } from "./send/index.mjs";
import { EMAIL_TYPE } from "./mailer.config.mjs";

/**
 * @param {Record<string, unknown> | null | undefined} authContext
 */
const actorFromContext = (authContext) => ({
  actorName:
    resolvePersonDisplayName({
      fullName: authContext?.fullName,
      firstName: authContext?.firstName,
      lastName: authContext?.lastName,
    }) ||
    authContext?.email ||
    "Someone",
  actorEmail: String(authContext?.email ?? ""),
});

/**
 * @param {{
 *   authContext?: Record<string, unknown> | null,
 *   config: Record<string, unknown>,
 *   entityType: string,
 *   entityLabel: string,
 *   entityId?: string,
 *   isSelfUpdate?: boolean,
 *   identityUpdates?: Record<string, unknown>,
 * }} params
 */
export const notifyAdminEntityUpdated = async ({
  authContext,
  config,
  entityType,
  entityLabel,
  entityId,
  isSelfUpdate = false,
  identityUpdates = {},
}) => {
  const { actorName, actorEmail } = actorFromContext(authContext);

  await sendAdminNotification({
    type: EMAIL_TYPE.ADMIN_ENTITY_UPDATED,
    data: { actorName, actorEmail, entityType, entityLabel, entityId },
    config,
    auditScope: resolveOversightScope({
      actor: authContext,
      isSelfUpdate,
      identityUpdates,
    }),
  });
};

/**
 * @param {{
 *   authContext?: Record<string, unknown> | null,
 *   config: Record<string, unknown>,
 *   entityType: string,
 *   entityLabel: string,
 *   entityId?: string,
 * }} params
 */
export const notifyAdminEntityDeleted = async ({
  authContext,
  config,
  entityType,
  entityLabel,
  entityId,
}) => {
  const { actorName, actorEmail } = actorFromContext(authContext);

  await sendAdminNotification({
    type: EMAIL_TYPE.ADMIN_ENTITY_DELETED,
    data: { actorName, actorEmail, entityType, entityLabel, entityId },
    config,
  });
};

/**
 * Notify admins when a user's permission grants were changed by someone else.
 *
 * @param {{
 *   authContext?: Record<string, unknown> | null,
 *   config: Record<string, unknown>,
 *   entityType: string,
 *   entityLabel: string,
 *   entityId?: string,
 * }} params
 */
export const notifyAdminPermissionsChanged = async ({
  authContext,
  config,
  entityType,
  entityLabel,
  entityId,
}) => {
  const { actorName, actorEmail } = actorFromContext(authContext);

  await sendAdminNotification({
    type: EMAIL_TYPE.ADMIN_PERMISSIONS_CHANGED,
    data: {
      actorName,
      actorEmail,
      entityType,
      entityLabel,
      entityId,
      action: "permissions updated",
    },
    config,
    auditScope: OVERSIGHT_SCOPE.FULL,
  });
};

/**
 * @param {{
 *   to: string,
 *   config: Record<string, unknown>,
 *   name?: string,
 * }} params
 */
export const notifyUserProfileUpdated = async ({ to, config, name }) => {
  await sendUserNotification({
    to,
    type: EMAIL_TYPE.USER_PROFILE_UPDATED,
    data: { name },
    config,
  });
};

/**
 * @param {{
 *   to: string,
 *   config: Record<string, unknown>,
 *   name?: string,
 *   changeSummary?: string,
 * }} params
 */
export const notifyUserAccountUpdated = async ({
  to,
  config,
  name,
  changeSummary,
}) => {
  await sendUserNotification({
    to,
    type: EMAIL_TYPE.USER_ACCOUNT_UPDATED,
    data: { name, changeSummary },
    config,
  });
};

/**
 * @param {{
 *   to: string,
 *   config: Record<string, unknown>,
 *   entityType: string,
 *   entityLabel?: string,
 *   entityId?: string,
 * }} params
 */
export const notifyStaffActionUpdated = async ({
  to,
  config,
  entityType,
  entityLabel,
  entityId,
}) => {
  await sendUserNotification({
    to,
    type: EMAIL_TYPE.USER_STAFF_ACTION_UPDATED,
    data: { entityType, entityLabel, entityId },
    config,
  });
};

/**
 * @param {{
 *   to: string,
 *   config: Record<string, unknown>,
 *   name?: string,
 *   identityUpdates?: Record<string, unknown>,
 * }} params
 */
const notifyTargetAccountChanges = async ({
  to,
  config,
  name,
  identityUpdates = {},
}) => {
  const accountChanges = [];
  if (identityUpdates.phone !== undefined) accountChanges.push("phone number");
  if (identityUpdates.status !== undefined) {
    accountChanges.push("account status");
  }
  if (identityUpdates.perms !== undefined) accountChanges.push("permissions");

  if (!accountChanges.length) return;

  await notifyUserAccountUpdated({
    to,
    config,
    name: name ?? undefined,
    changeSummary: accountChanges.join(" and "),
  });
};

/**
 * After profile/identity update — target, actor, and oversight emails per routing rules.
 * `identityUpdates.perms` means the target's permission grant list was changed.
 *
 * @param {{
 *   isSelfUpdate: boolean,
 *   authContext?: Record<string, unknown> | null,
 *   config: Record<string, unknown>,
 *   targetEmail?: string | null,
 *   targetName?: string | null,
 *   targetId?: string,
 *   entityType: string,
 *   identityUpdates?: Record<string, unknown>,
 *   profileUpdated?: boolean,
 * }} params
 */
export const emitEntityUpdateNotificationEmails = async ({
  isSelfUpdate,
  authContext,
  config,
  targetEmail,
  targetName,
  targetId,
  entityType,
  identityUpdates = {},
  profileUpdated = false,
}) => {
  if (!targetEmail) return;

  const hasChanges = profileUpdated || Object.keys(identityUpdates).length > 0;
  if (!hasChanges) return;

  const entityLabel = targetName || targetEmail;

  if (isCosmediateAdminActor(authContext) && !isSelfUpdate) {
    if (identityUpdates.perms !== undefined) {
      await notifyAdminPermissionsChanged({
        authContext,
        config,
        entityType,
        entityLabel,
        entityId: targetId,
      });
    } else {
      await notifyAdminEntityUpdated({
        authContext,
        config,
        entityType,
        entityLabel,
        entityId: targetId,
      });
    }

    return;
  }

  if (isCosmediateAdminActor(authContext) && isSelfUpdate) {
    if (profileUpdated) {
      await notifyUserProfileUpdated({
        to: targetEmail,
        config,
        name: targetName ?? undefined,
      });
    }

    await notifyTargetAccountChanges({
      to: targetEmail,
      config,
      name: targetName,
      identityUpdates,
    });

    if (identityUpdates.perms !== undefined) {
      await notifyAdminPermissionsChanged({
        authContext,
        config,
        entityType,
        entityLabel,
        entityId: targetId,
      });
    } else {
      await notifyAdminEntityUpdated({
        authContext,
        config,
        entityType,
        entityLabel,
        entityId: targetId,
        isSelfUpdate: true,
        identityUpdates,
      });
    }

    return;
  }

  if (profileUpdated) {
    await notifyUserProfileUpdated({
      to: targetEmail,
      config,
      name: targetName ?? undefined,
    });
  }

  await notifyTargetAccountChanges({
    to: targetEmail,
    config,
    name: targetName,
    identityUpdates,
  });

  if (!isSelfUpdate) {
    const actorEmail = resolveActorEmail(authContext);
    if (actorEmail) {
      await notifyStaffActionUpdated({
        to: actorEmail,
        config,
        entityType,
        entityLabel,
        entityId: targetId,
      });
    }
  }

  if (identityUpdates.perms !== undefined) {
    await notifyAdminPermissionsChanged({
      authContext,
      config,
      entityType,
      entityLabel,
      entityId: targetId,
    });
  } else {
    await notifyAdminEntityUpdated({
      authContext,
      config,
      entityType,
      entityLabel,
      entityId: targetId,
    });
  }
};
