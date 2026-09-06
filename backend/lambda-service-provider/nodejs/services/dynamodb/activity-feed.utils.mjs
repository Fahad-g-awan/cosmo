import { ACTIVITY_MONITORING_ACTION } from "../../constants/db/activity-monitoring.actions.mjs";
import { ENTITY_TYPE } from "../../constants/db/entity-types.mjs";
import {
  ACTIVITY_ACTION_VERB,
  ACTIVITY_SCOPE_LABEL,
} from "../../constants/domain/activity-feed.constants.mjs";
import { getProfileWithIdentity } from "../prisma/identity/read.mjs";

const PROFILE_SCOPES = new Set([
  ENTITY_TYPE.ADMIN,
  ENTITY_TYPE.PATIENT,
  ENTITY_TYPE.SPECIALIST,
  ENTITY_TYPE.CLINIC_MANAGER,
  ENTITY_TYPE.IDENTITY,
]);

const isEmailLike = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());

export const resolvePersonDisplayName = ({
  fullName,
  firstName,
  lastName,
  email,
} = {}) => {
  const fromFull = String(fullName ?? "").trim();
  if (fromFull && !isEmailLike(fromFull)) return fromFull;

  const fromParts = [firstName, lastName]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(" ");
  if (fromParts) return fromParts;

  const fromEmail = String(email ?? "").trim();
  if (fromEmail && !isEmailLike(fromEmail)) return fromEmail;

  return "";
};

/**
 * Resolves a human display name from inline fields or the linked role profile.
 */
export const resolveIdentityDisplayName = async (
  databaseUrl,
  identity,
  extras = {},
) => {
  const inline = resolvePersonDisplayName({
    fullName: extras.fullName ?? extras.targetName,
    firstName: extras.firstName,
    lastName: extras.lastName,
  });
  if (inline) return inline;

  if (databaseUrl && identity?.role && identity?.entityId) {
    try {
      const resolved = await getProfileWithIdentity(
        databaseUrl,
        identity.role,
        identity.entityId,
      );
      const fromProfile = resolvePersonDisplayName(resolved?.profile ?? {});
      if (fromProfile) return fromProfile;
    } catch (error) {
      console.warn(
        "[activity-feed] profile display name lookup failed:",
        error?.message ?? error,
      );
    }
  }

  return "";
};

export const normalizeActorDisplayName = (authActor = {}) => {
  const fromFields = resolvePersonDisplayName({
    fullName:
      authActor.actorDisplayName ??
      authActor.actorFullName ??
      authActor.actorName,
    firstName: authActor.actorFirstName ?? authActor.firstName,
    lastName: authActor.actorLastName ?? authActor.lastName,
  });
  if (fromFields) return fromFields;

  const fromEmail = String(authActor.actorEmail ?? "").trim();
  if (fromEmail) return fromEmail;

  return "Someone";
};

const normalizeTargetDisplayName = (targetName, logData = {}) =>
  resolvePersonDisplayName({
    fullName: targetName || logData?.fullName || logData?.targetName || logData?.name,
    firstName: logData?.firstName,
    lastName: logData?.lastName,
    email: isEmailLike(targetName) ? targetName : logData?.email,
  }) ||
  String(targetName || "").trim();

const scopeLabel = (scope) => {
  if (ACTIVITY_SCOPE_LABEL[scope]) return ACTIVITY_SCOPE_LABEL[scope];
  if (typeof scope === "string" && scope.startsWith("ENTITY_TYPE#")) {
    return scope.slice("ENTITY_TYPE#".length).toLowerCase().replace(/_/g, " ");
  }
  return "record";
};

const isSelfAction = ({
  actorId,
  targetEntityId,
  actorEmail,
  targetName,
}) => {
  const normalizedActorId = String(actorId ?? "").trim();
  const normalizedTargetId = String(targetEntityId ?? "").trim();

  if (normalizedActorId && normalizedTargetId && normalizedActorId === normalizedTargetId) {
    return true;
  }

  const actorEmailNorm = String(actorEmail ?? "").trim().toLowerCase();
  const targetNorm = String(targetName ?? "").trim().toLowerCase();

  return Boolean(actorEmailNorm && targetNorm && actorEmailNorm === targetNorm);
};

const withArticle = (label) => {
  const trimmed = String(label || "record").trim();
  if (!trimmed) return "a record";
  return /^[aeiou]/i.test(trimmed) ? `an ${trimmed}` : `a ${trimmed}`;
};

/**
 * Builds `feedLine` stored on activity monitoring items.
 * Relative time ("1 hr ago") is formatted on the client from `occurredAt`.
 */
export const buildActivityFeedLine = ({
  actorDisplayName,
  actorId = "",
  actorEmail = "",
  action,
  scope,
  targetName = "",
  targetEntityId = "",
  logData = {},
}) => {
  const who = normalizeActorDisplayName({ actorDisplayName, actorEmail });
  const target = normalizeTargetDisplayName(targetName, logData);
  const self = isSelfAction({
    actorId,
    targetEntityId,
    actorEmail,
    targetName: target || targetName,
  });
  const resource = scopeLabel(scope);
  const verb =
    ACTIVITY_ACTION_VERB[action] ?? String(action || "changed").toLowerCase();

  if (action === ACTIVITY_MONITORING_ACTION.SIGN_IN) {
    return `${who} signed in`;
  }

  if (action === ACTIVITY_MONITORING_ACTION.REGISTER) {
    return `${who} registered`;
  }

  if (self) {
    if (action === ACTIVITY_MONITORING_ACTION.PASSWORD_UPDATE) {
      return `${who} updated their password`;
    }
    if (action === ACTIVITY_MONITORING_ACTION.PASSWORD_SET) {
      return `${who} set their password`;
    }
    if (action === ACTIVITY_MONITORING_ACTION.LINK_OAUTH_PROVIDER) {
      return `${who} linked a sign-in provider`;
    }
    if (action === ACTIVITY_MONITORING_ACTION.UPDATE) {
      return PROFILE_SCOPES.has(scope)
        ? `${who} updated their profile`
        : `${who} updated their ${resource}`;
    }
    if (action === ACTIVITY_MONITORING_ACTION.SOFT_DELETE) {
      return `${who} deactivated their account`;
    }
    if (action === ACTIVITY_MONITORING_ACTION.DELETE) {
      return `${who} deleted their account`;
    }
  }

  if (action === ACTIVITY_MONITORING_ACTION.PASSWORD_UPDATE) {
    return target
      ? `${who} changed password for ${target}`
      : `${who} changed a password`;
  }

  if (action === ACTIVITY_MONITORING_ACTION.PASSWORD_SET) {
    return target
      ? `${who} set password for ${target}`
      : `${who} set a password`;
  }

  if (action === ACTIVITY_MONITORING_ACTION.LINK_OAUTH_PROVIDER) {
    return target
      ? `${who} linked a sign-in provider for ${target}`
      : `${who} linked a sign-in provider`;
  }

  if (action === ACTIVITY_MONITORING_ACTION.TREATMENT_SELECTION) {
    return target
      ? `${who} updated treatments for ${target}`
      : `${who} updated specialist treatments`;
  }

  if (action === ACTIVITY_MONITORING_ACTION.CREATE) {
    if (target && PROFILE_SCOPES.has(scope)) {
      return `${who} created ${resource} ${target}`;
    }
    return target
      ? `${who} created ${resource} ${target}`
      : `${who} created ${withArticle(resource)}`;
  }

  if (
    action === ACTIVITY_MONITORING_ACTION.UPDATE ||
    action === ACTIVITY_MONITORING_ACTION.SOFT_DELETE ||
    action === ACTIVITY_MONITORING_ACTION.DELETE
  ) {
    if (target && PROFILE_SCOPES.has(scope)) {
      return `${who} ${verb} ${target}`;
    }
    return target
      ? `${who} ${verb} ${resource} ${target}`
      : `${who} ${verb} ${withArticle(resource)}`;
  }

  return target ? `${who} ${verb} ${resource} ${target}` : `${who} ${verb} ${resource}`;
};
