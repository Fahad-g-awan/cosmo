import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

import { calculateSecretHash } from "../crypto/cognito-secret-hash.utils.mjs";
import { httpError, isHttpError } from "../../errors/http-error.mjs";
import { API_ERRORS } from "../../../constants/errors/index.mjs";
import { cognitoIDP } from "../cognito-idp.client.mjs";

const basicAuthHeader = (clientId, clientSecret) => {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${basic}`;
};

export const oAuthLogin = async (config, code, redirectUri) => {
  try {
    const { COGNITO_DOMAIN, COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET } = config;

    if (!COGNITO_DOMAIN || !COGNITO_CLIENT_ID || !COGNITO_CLIENT_SECRET) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: ["Missing required config"],
      });
    }

    const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", COGNITO_CLIENT_ID);
    params.append("code", code);
    params.append("redirect_uri", redirectUri);

    const tokenResp = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader(
          COGNITO_CLIENT_ID,
          COGNITO_CLIENT_SECRET,
        ),
      },
      body: params.toString(),
    });

    if (!tokenResp.ok) {
      const text = await tokenResp?.text();
      console.error("OAuthLogin token response error:", text);

      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: ["Failed to fetch token", text].filter(Boolean),
      });
    }

    return await tokenResp.json();
  } catch (error) {
    console.log("Error in oAuthLogin", error);
    if (isHttpError(error)) throw error;

    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Failed to fetch token", error?.message].filter(Boolean),
    });
  }
};

export const refreshViaNative = async (
  config,
  refreshToken,
  cognitoUsername,
) => {
  if (!refreshToken || !cognitoUsername) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Missing native refresh credentials"],
    });
  }

  try {
    const resp = await cognitoIDP.send(
      new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: config.COGNITO_CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          SECRET_HASH: calculateSecretHash(
            cognitoUsername,
            config.COGNITO_CLIENT_ID,
            config.COGNITO_CLIENT_SECRET,
          ),
        },
      }),
    );

    const auth = resp?.AuthenticationResult;
    if (!auth?.AccessToken) {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: ["Native refresh returned no tokens"],
      });
    }

    return {
      access_token: auth.AccessToken,
      id_token: auth.IdToken,
      expires_in: auth.ExpiresIn,
      refresh_token: auth.RefreshToken,
    };
  } catch (error) {
    console.log("Error in refreshViaNative", error);

    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Failed to refresh token", error?.message],
    });
  }
};

export const refreshViaOauth = async (config, refreshToken) => {
  try {
    const url = `${config.COGNITO_DOMAIN}/oauth2/token`;

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: config.COGNITO_CLIENT_ID,
    });

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader(
          config.COGNITO_CLIENT_ID,
          config.COGNITO_CLIENT_SECRET,
        ),
      },
      body,
    });
    const text = await resp.text();

    if (!resp.ok) {
      console.error("OAuth refresh failed:", text);

      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        details: ["Failed to refresh token", text],
      });
    }

    return JSON.parse(text);
  } catch (error) {
    console.log("Error in refreshViaOauth", error);

    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Failed to refresh token", error?.message],
    });
  }
};

export const cognitoGetUserByAccessToken = async (config, authToken) => {
  try {
    const userInfoResp = await fetch(
      `${config.COGNITO_DOMAIN}/oauth2/userInfo`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (userInfoResp.ok) {
      return await userInfoResp.json();
    }

    console.log("Error in cognitoGetUserByAccessToken", userInfoResp);

    throw httpError({
      error: API_ERRORS.NOT_FOUND,
      message: "User not found",
      details: ["Failed to fetch user"],
    });
  } catch (error) {
    console.error("Error in cognitoGetUserByAccessToken:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: ["Failed to fetch user by access token", error?.message],
    });
  }
};
