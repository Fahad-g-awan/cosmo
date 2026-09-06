import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { generateDefaultPassword } from "/opt/nodejs/lib/auth/crypto/password.utils.mjs";
import { cognitoIDP } from "/opt/nodejs/lib/auth/cognito-idp.client.mjs";

export const createCognitoAdminUser = async ({ config, email }) => {
  const defaultPassword = generateDefaultPassword();

  const createResp = await cognitoIDP.send(
    new AdminCreateUserCommand({
      UserPoolId: config.COGNITO_USER_POOL_ID,
      Username: email,
      TemporaryPassword: defaultPassword,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "email_verified", Value: "true" },
      ],
    }),
  );

  await cognitoIDP.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: config.COGNITO_USER_POOL_ID,
      Username: email,
      Password: defaultPassword,
      Permanent: true,
    }),
  );

  const sub = createResp.User?.Attributes?.find((a) => a.Name === "sub")?.Value;

  return { sub: sub ?? "", defaultPassword };
};
