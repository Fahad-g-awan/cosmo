import {
  getIdentityByEmail,
  getIdentityById,
} from "/opt/nodejs/services/prisma/identity/read.mjs";

/** Auth-module shape: `{ user, ok, errors }` where `user` is an Identity row. */
export const findIdentityByEmail = async (databaseUrl, email) => {
  if (!email) {
    return { user: null, errors: ["Email not provided"], ok: false };
  }

  const identity = await getIdentityByEmail(databaseUrl, email);
  if (!identity || identity.deleted) {
    return {
      errors: [`User does not exist: ${email}`],
      user: null,
      ok: false,
    };
  }

  return { errors: [], user: identity, ok: true };
};

export const findIdentityById = async (databaseUrl, identityId) => {
  if (!identityId) {
    return { user: null, errors: ["Identity ID not provided"], ok: false };
  }

  const identity = await getIdentityById(databaseUrl, identityId);
  if (!identity || identity.deleted) {
    return {
      errors: [`Identity does not exist: ${identityId}`],
      user: null,
      ok: false,
    };
  }

  return { errors: [], user: identity, ok: true };
};
