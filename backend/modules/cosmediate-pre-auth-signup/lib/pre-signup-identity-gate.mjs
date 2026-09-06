import { getIdentityByEmail } from "/opt/nodejs/services/prisma/identity/read.mjs";
import { USER_STATUS } from "/opt/nodejs/constants/auth/status.constants.mjs";

import {
  throwAccountBlocked,
  throwAccountUnavailable,
  throwEmailAlreadyInUse,
} from "./pre-signup-errors.mjs";

/**
 * Block deleted/blocked always. Block duplicate email only when Cognito has no user
 * (Postgres row without pool user = staff invite / orphan).
 */
export const assertIdentityGate = async (
  postgresDbUrl,
  email,
  { cognitoUserExists },
) => {
  const identity = await getIdentityByEmail(postgresDbUrl, email);

  if (!identity) {
    return;
  }

  if (identity.deleted) {
    throwAccountUnavailable();
  }

  if (identity.status === USER_STATUS.BLOCKED) {
    throwAccountBlocked();
  }

  if (!cognitoUserExists) {
    throwEmailAlreadyInUse();
  }
};
