import {
  AdminGetUserCommand,
  AdminDeleteUserCommand,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { parseCognitoExternalUsername } from "./provider.utils.mjs";
import { API_ERRORS } from "../../../constants/errors/index.mjs";
import { httpError } from "../../errors/http-error.mjs";
import { cognitoIDP } from "../cognito-idp.client.mjs";

export const cognitoGetUserBySub = async (config, username) => {
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: config.COGNITO_USER_POOL_ID,
      Username: username,
    });
    return await cognitoIDP.send(command);
  } catch (error) {
    console.error("Error in cognitoGetUserBySub:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: ["Failed to fetch user by sub", error?.message],
    });
  }
};

export const cognitoGetUserByEmail = async (config, email) => {
  try {
    const command = new AdminGetUserCommand({
      Username: email,
      UserPoolId: config.COGNITO_USER_POOL_ID,
    });
    return await cognitoIDP.send(command);
  } catch (error) {
    console.error("Error in cognitoGetUserByEmail:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: ["Failed to fetch user by email", error?.message],
    });
  }
};

/**
 * PreSignUp: first CONFIRMED pool user with matching email attribute.
 * Prefers native (non-federated) usernames so UUID-native accounts are found.
 */
export const cognitoGetConfirmedUserByEmailIfExists = async (config, email) => {
  const users = await listCognitoUsersByEmail(config, email);
  const confirmed = users.filter((u) => u.UserStatus === "CONFIRMED");
  if (!confirmed.length) return null;

  const native =
    confirmed.find((u) => {
      const parsed = parseCognitoExternalUsername(u.Username || "");
      return !parsed.cognitoProviderName;
    }) ?? null;

  const pick = native ?? confirmed[0];
  return cognitoGetUserBySub(config, pick.Username);
};

/**
 * PreSignUp: null when user does not exist; rethrow on Cognito/API errors.
 */
export const cognitoGetUserByEmailIfExists = async (config, email) => {
  try {
    return await cognitoIDP.send(
      new AdminGetUserCommand({
        Username: email,
        UserPoolId: config.COGNITO_USER_POOL_ID,
      }),
    );
  } catch (error) {
    if (error?.name === "UserNotFoundException") {
      return null;
    }
    console.error("[cognitoGetUserByEmailIfExists]", error);
    throw error;
  }
};

export const cognitoDeleteUser = async (config, username) => {
  try {
    await cognitoIDP.send(
      new AdminDeleteUserCommand({
        UserPoolId: config.COGNITO_USER_POOL_ID,
        Username: username,
      }),
    );

    console.log(`Successfully deleted Cognito user: ${username}`);
    return { success: true };
  } catch (error) {
    console.error("Error in cognitoDeleteUser:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: ["Failed to delete user", error?.message],
    });
  }
};

const escapeCognitoListUsersFilterValue = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');

export const listCognitoUsersByEmail = async (config, email) => {
  const poolId = config.COGNITO_USER_POOL_ID;
  if (!poolId || !email) return [];

  const filter = `email = "${escapeCognitoListUsersFilterValue(email)}"`;
  const allUsers = [];
  let paginationToken;

  do {
    const resp = await cognitoIDP.send(
      new ListUsersCommand({
        UserPoolId: poolId,
        Filter: filter,
        Limit: 60,
        PaginationToken: paginationToken,
      }),
    );
    allUsers.push(...(resp.Users || []));
    paginationToken = resp.PaginationToken || undefined;
  } while (paginationToken);

  return allUsers;
};
