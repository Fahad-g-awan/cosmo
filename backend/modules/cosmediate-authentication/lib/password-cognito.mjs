import {
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { calculateSecretHash } from "/opt/nodejs/lib/auth/crypto/cognito-secret-hash.utils.mjs";
import { cognitoIDP } from "/opt/nodejs/lib/auth/cognito-idp.client.mjs";
import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

export const cognitoSubFromAdminUser = (adminOut) =>
  adminOut?.UserAttributes?.find((a) => a.Name === "sub")?.Value ?? null;

/**
 * Issue native tokens immediately after the user chose `password` on /auth/password/set-new.
 */
export const mintNativeTokensAfterPasswordSet = async (
  ctx,
  cognitoUsername,
  password,
) => {
  const { config } = ctx;
  const secretFor = (username) =>
    calculateSecretHash(
      username,
      config.COGNITO_CLIENT_ID,
      config.COGNITO_CLIENT_SECRET,
    );

  const initiateResp = await cognitoIDP.send(
    new AdminInitiateAuthCommand({
      AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
      ClientId: config.COGNITO_CLIENT_ID,
      UserPoolId: config.COGNITO_USER_POOL_ID,
      AuthParameters: {
        USERNAME: cognitoUsername,
        PASSWORD: password,
        SECRET_HASH: secretFor(cognitoUsername),
      },
    }),
  );

  let tokens = initiateResp?.AuthenticationResult;

  // Pool may still return NEW_PASSWORD_REQUIRED right after AdminSetUserPassword (temp-user state).
  // Satisfy the challenge with the same password the user just submitted
  if (!tokens && initiateResp?.ChallengeName === "NEW_PASSWORD_REQUIRED") {
    const challengeUsername =
      initiateResp.ChallengeParameters?.USER_ID_FOR_SRP ?? cognitoUsername;

    console.warn(
      "[auth] mintNativeTokensAfterPasswordSet: NEW_PASSWORD_REQUIRED after permanent set; completing with user password",
      { cognitoUsername, challengeUsername },
    );

    const challengeResp = await cognitoIDP.send(
      new AdminRespondToAuthChallengeCommand({
        ClientId: config.COGNITO_CLIENT_ID,
        ChallengeName: initiateResp.ChallengeName,
        UserPoolId: config.COGNITO_USER_POOL_ID,
        Session: initiateResp.Session,
        ChallengeResponses: {
          SECRET_HASH: secretFor(challengeUsername),
          USERNAME: challengeUsername,
          NEW_PASSWORD: password,
        },
      }),
    );
    tokens = challengeResp?.AuthenticationResult;
  }

  if (!tokens) {
    console.error(
      "[auth] mintNativeTokensAfterPasswordSet: no tokens after AdminInitiateAuth",
      {
        challengeName: initiateResp?.ChallengeName,
        cognitoUsername,
      },
    );
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: [
        "Password was saved but we could not start a session automatically. Sign in with your new password.",
      ],
    });
  }

  const { AccessToken, RefreshToken, IdToken, ExpiresIn } = tokens;
  return { AccessToken, RefreshToken, IdToken, ExpiresIn };
};
