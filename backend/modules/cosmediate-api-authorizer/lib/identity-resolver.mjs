import {
  getIdentityByCognitoSub,
  getIdentityByEmail,
} from "/opt/nodejs/services/prisma/identity/read.mjs";

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const IDENTITY_LOOKUP_RETRIES = Math.min(
  5,
  Math.max(
    1,
    Number.parseInt(process.env.AUTHORIZER_IDENTITY_RETRIES || "", 10) || 3,
  ),
);

/**
 * Resolves Postgres Identity for this access token (JWT `sub`).
 *
 * Fallback: JWT `email`, or email-shaped `username`, then `getIdentityByEmail`
 * only when row.cognitoSub matches sub (linking drift).
 * Retries on Prisma throws only (transient infra).
 *
 * @param {string} databaseUrl
 * @param {string} cognitoSub
 * @param {Object} decoded
 * @returns {Promise<Object>}
 * @returns {Object} { identity: Identity | null, reconcile: boolean, conflictingEmail: boolean }
 */
export async function resolveIdentityForAccessToken(
  databaseUrl,
  cognitoSub,
  decoded,
) {
  if (!databaseUrl || !cognitoSub) return { identity: null, reconcile: false };

  const rawEmail =
    (typeof decoded.email === "string" && decoded.email.trim()) ||
    (typeof decoded.username === "string" && decoded.username.includes("@")
      ? decoded.username.trim()
      : "");
  const emailHint = rawEmail.toLowerCase() || "";

  let lastThrow = null;

  for (let attempt = 0; attempt < IDENTITY_LOOKUP_RETRIES; attempt++) {
    if (attempt > 0) await sleep(Math.min(50 * 2 ** (attempt - 1), 300));

    try {
      const bySub = await getIdentityByCognitoSub(databaseUrl, cognitoSub);
      if (bySub) return { identity: bySub, reconcile: false };

      if (emailHint) {
        const byEmail = await getIdentityByEmail(databaseUrl, emailHint);
        if (byEmail) {
          if (byEmail.cognitoSub !== cognitoSub)
            return { identity: null, reconcile: false, conflictingEmail: true };
          return { identity: byEmail, reconcile: true };
        }
      }

      return { identity: null, reconcile: false };
    } catch (e) {
      lastThrow = e;

      console.warn(
        `[authorizer] Identity lookup attempt ${attempt + 1}/${IDENTITY_LOOKUP_RETRIES} threw`,
        e?.message,
      );
    }
  }

  throw lastThrow;
}
