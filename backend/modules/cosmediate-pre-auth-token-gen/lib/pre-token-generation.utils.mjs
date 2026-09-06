import { getIdentityByCognitoSub } from "/opt/nodejs/services/prisma/identity/read.mjs";

import { FETCH_RETRIES, FETCH_TIMEOUT_MS } from "./config.mjs";

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const isV2orV3 = (event) => {
  const v = String(event.version || "");
  return v === "2" || v.startsWith("V2") || v.startsWith("V3");
};

export const fetchIdentityWithRetries = async (postgresDbUrl, cognitoSub) => {
  let lastErr = null;

  for (let attempt = 0; attempt < FETCH_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(Math.min(100 * 2 ** (attempt - 1), 400));
    }

    try {
      return await Promise.race([
        getIdentityByCognitoSub(postgresDbUrl, cognitoSub),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Database query timeout")),
            FETCH_TIMEOUT_MS,
          ),
        ),
      ]);
    } catch (err) {
      lastErr = err;
      console.warn(
        `[pre-token-gen] DB fetch attempt ${attempt + 1}/${FETCH_RETRIES} failed`,
        err?.message,
      );
    }
  }

  console.error(
    "[pre-token-gen] DB fetch exhausted retries — rejecting token issuance",
    lastErr,
  );
  if (lastErr instanceof Error) {
    throw lastErr;
  }
  throw new Error(String(lastErr?.message || lastErr || "database failure"));
};

export const buildClaimsFromIdentity = (identity, cognitoSub, email) => {
  if (!identity?.role || !identity?.entityId) {
    throw new Error(
      `Identity ${identity?.id ?? "unknown"} is missing role or entityId — cannot issue token claims`,
    );
  }

  return {
    role: identity.role,
    email: email || identity.email || "",
    identityId: identity.id,
    entityId: identity.entityId,
    cognitoSub,
  };
};

export const applyClaimsToEvent = (event, claims) => {
  const { role, identityId, entityId } = claims;

  if (isV2orV3(event)) {
    event.response = {
      claimsAndScopeOverrideDetails: {
        idTokenGeneration: {
          claimsToAddOrOverride: { role, identityId, entityId },
        },
        accessTokenGeneration: {
          claimsToAddOrOverride: claims,
        },
      },
    };
  } else {
    event.response = {
      claimsOverrideDetails: {
        claimsToAddOrOverride: claims,
      },
    };
  }

  return event;
};
