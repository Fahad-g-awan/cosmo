import { cognitoGetConfirmedUserByEmailIfExists } from "/opt/nodejs/lib/auth/cognito/admin-users.mjs";
import { getTriggerConfig } from "/opt/nodejs/lib/auth/triggers/pool-stage-config.mjs";

import { handleExistingCognitoUser } from "./pre-signup-existing-user.mjs";
import { assertIdentityGate } from "./pre-signup-identity-gate.mjs";

export const runPreSignUp = async (event) => {
  const email = event?.request?.userAttributes?.email;
  const triggerSource = event.triggerSource;

  if (!email) {
    console.warn("[pre-signup] no email in userAttributes; passthrough");
    return event;
  }

  const config = getTriggerConfig(event.userPoolId);

  const existingCognitoUser = await cognitoGetConfirmedUserByEmailIfExists(
    { COGNITO_USER_POOL_ID: config.COGNITO_USER_POOL_ID },
    email,
  );

  await assertIdentityGate(config.POSTGRES_DB_URL, email, {
    cognitoUserExists: !!existingCognitoUser,
  });

  if (existingCognitoUser) {
    return handleExistingCognitoUser(event, config, existingCognitoUser);
  }

  if (triggerSource === "PreSignUp_ExternalProvider") {
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;
  }

  console.log("[pre-signup] allowed new sign-up", { email, triggerSource });
  return event;
};
