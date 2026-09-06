import {
  getIdentityByCognitoSub,
  getIdentityByEmail,
} from "/opt/nodejs/services/prisma/identity/read.mjs";
import { getLinkedProviderSlugsForPoolUsername } from "/opt/nodejs/services/auth/cognito-linking.mjs";
import { getTriggerConfig } from "/opt/nodejs/lib/auth/triggers/pool-stage-config.mjs";
import { USER_STATUS } from "/opt/nodejs/constants/auth/status.constants.mjs";
import {
  buildMailUrls,
  dispatchEmail,
  EMAIL_TYPE,
} from "/opt/nodejs/lib/mailer/index.mjs";

import { resolveProfileFromUserAttributes } from "./resolve-profile.mjs";
import { provisionPatientIfMissing } from "./provision-patient.mjs";

const SKIPPED_TRIGGERS = new Set(["PostConfirmation_ConfirmForgotPassword"]);

/**
 * After Cognito confirms a user, ensure a Postgres Identity exists before token issuance.
 *
 * Primary fix: brand-new OAuth patient (PreSignUp allowed, no row yet → PreToken would fail).
 * Idempotent skip: staff-created, native sign-up (signup API already provisioned), auto-link retries.
 */
export const runPostConfirmation = async (event) => {
  if (SKIPPED_TRIGGERS.has(event.triggerSource)) {
    return event;
  }

  const email = event.request?.userAttributes?.email;
  const cognitoSub = event.request?.userAttributes?.sub;
  const userName = event.userName;

  if (!email || !cognitoSub) {
    console.warn("[post-confirmation] missing email or sub; passthrough");
    return event;
  }

  const config = getTriggerConfig(event.userPoolId);

  const existingBySub = await getIdentityByCognitoSub(
    config.POSTGRES_DB_URL,
    cognitoSub,
  );
  if (existingBySub && !existingBySub.deleted) {
    console.log("[post-confirmation] identity already exists by sub", {
      identityId: existingBySub.id,
      email,
    });
    return event;
  }

  const existingByEmail = await getIdentityByEmail(
    config.POSTGRES_DB_URL,
    email,
  );
  if (existingByEmail && !existingByEmail.deleted) {
    if (existingByEmail.cognitoSub !== cognitoSub) {
      console.warn("[post-confirmation] email row sub mismatch — skip create", {
        identityId: existingByEmail.id,
        identitySub: existingByEmail.cognitoSub,
        eventSub: cognitoSub,
      });
    } else {
      console.log("[post-confirmation] identity already exists by email", {
        identityId: existingByEmail.id,
      });
    }
    return event;
  }

  let linkedProviders = [];
  try {
    linkedProviders = await getLinkedProviderSlugsForPoolUsername(
      config,
      userName,
    );
  } catch (err) {
    console.error("[post-confirmation] linkedProviders resolve failed", err);
  }

  const profile = resolveProfileFromUserAttributes(
    event.request.userAttributes,
    email,
  );

  const isOAuthFirst = linkedProviders.length > 0;

  const identity = await provisionPatientIfMissing(config, {
    cognitoSub,
    email,
    status: USER_STATUS.ACTIVE,
    passwordSet: !isOAuthFirst,
    linkedProviders,
    profile,
  });

  console.log("[post-confirmation] provisioned patient identity", {
    identityId: identity.id,
    email,
    cognitoSub,
    linkedProviders,
    triggerSource: event.triggerSource,
  });

  const { signInUrl } = buildMailUrls(config);
  const patientName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    email.split("@")[0];

  await dispatchEmail({
    to: email,
    type: EMAIL_TYPE.WELCOME_PATIENT,
    data: {
      variant: "self",
      patientName,
      patientEmail: email,
      signInUrl,
    },
    config,
  });

  return event;
};
