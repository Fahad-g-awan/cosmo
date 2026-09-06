import { USER_STATUS } from "/opt/nodejs/constants/auth/status.constants.mjs";
import { getTriggerConfig } from "/opt/nodejs/lib/auth/triggers/pool-stage-config.mjs";

import {
  applyClaimsToEvent,
  buildClaimsFromIdentity,
  fetchIdentityWithRetries,
} from "./pre-token-generation.utils.mjs";

export const runPreTokenGeneration = async (event) => {
  const cognitoSub = event.request?.userAttributes?.sub;
  const email = event.request?.userAttributes?.email || "";

  if (!cognitoSub) {
    throw new Error(
      "PreTokenGeneration: missing cognito sub on user attributes",
    );
  }

  const config = getTriggerConfig(event.userPoolId);
  const identityRow = await fetchIdentityWithRetries(
    config.POSTGRES_DB_URL,
    cognitoSub,
  );

  if (!identityRow || identityRow.deleted) {
    // Cognito surfaces Error.message in Hosted UI / token error bodies —
    // keep this user-facing (no internal cognitoSub).
    throw new Error(
      "This account is unavailable. Please contact support.",
    );
  }

  if (identityRow.status === USER_STATUS.BLOCKED) {
    throw new Error("User is blocked. Please contact support.");
  }

  const claims = buildClaimsFromIdentity(identityRow, cognitoSub, email);

  console.log("[pre-token-gen] claims set", {
    cognitoSub,
    identityId: claims.identityId,
    entityId: claims.entityId,
    role: claims.role,
    triggerSource: event.triggerSource,
  });

  return applyClaimsToEvent(event, claims);
};
