import {
  cognitoProviderSortKey,
  parseCognitoExternalUsername,
} from "/opt/nodejs/lib/auth/cognito/provider.utils.mjs";
import { cognitoLinkProviderToUser } from "/opt/nodejs/services/auth/cognito-linking.mjs";
import { PROVIDER_LINKED_RETRY_CODE } from "/opt/nodejs/constants/errors/index.mjs";

import {
  throwEmailAlreadyInUse,
  throwProviderLinkedRetry,
  throwUnconfirmedNative,
  throwPreSignUpError,
} from "./pre-signup-errors.mjs";

const parseLinkedProviders = (existingCognitoUser) => {
  const identitiesAttr = existingCognitoUser.UserAttributes?.find(
    (attr) => attr.Name === "identities",
  );
  const identitiesValue = identitiesAttr?.Value || "[]";

  try {
    const parsed = JSON.parse(identitiesValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("[pre-signup] parse identities", error);
    return [];
  }
};

export const handleExistingCognitoUser = async (
  event,
  config,
  existingCognitoUser,
) => {
  const email = event?.request?.userAttributes?.email;
  const triggerSource = event.triggerSource;
  const userStatus = existingCognitoUser.UserStatus;
  const isOAuthSignUp = triggerSource === "PreSignUp_ExternalProvider";
  const isNativeSignUp = triggerSource === "PreSignUp_SignUp";

  const parsedOAuth = isOAuthSignUp
    ? parseCognitoExternalUsername(event.userName)
    : { prefixRaw: null, cognitoProviderName: null, providerSubject: null };

  const existingLinkedProviders = parseLinkedProviders(existingCognitoUser);
  const oauthLinkKey = cognitoProviderSortKey(parsedOAuth.cognitoProviderName);
  const isCurrentProviderLinked =
    !!oauthLinkKey &&
    existingLinkedProviders.some(
      (identity) =>
        cognitoProviderSortKey(identity.providerName) === oauthLinkKey,
    );

  const currentProviderName = parsedOAuth.cognitoProviderName;

  if (isOAuthSignUp && userStatus === "CONFIRMED" && !isCurrentProviderLinked) {
    const providerName = parsedOAuth.cognitoProviderName;
    const providerUserId = parsedOAuth.providerSubject;

    if (!providerName || !providerUserId) {
      throwPreSignUpError(
        "Unable to extract provider information from sign-up event",
        { code: "InvalidProviderException", statusCode: 400 },
      );
    }

    const nativeUserSub = existingCognitoUser.UserAttributes?.find(
      (attr) => attr.Name === "sub",
    )?.Value;

    if (!nativeUserSub) {
      throwPreSignUpError("Unable to find native user's sub", {
        code: "ProviderLinkingException",
        statusCode: 500,
      });
    }

    try {
      await cognitoLinkProviderToUser(
        { COGNITO_USER_POOL_ID: config.COGNITO_USER_POOL_ID },
        {
          nativeUserSub,
          providerName,
          providerSub: providerUserId,
        },
      );

      console.log(
        "[pre-signup] linked provider; blocking OAuth user creation",
        { email, providerName, nativeUserSub },
      );

      throwProviderLinkedRetry(providerName, email);
    } catch (linkError) {
      if (linkError.code === PROVIDER_LINKED_RETRY_CODE) {
        throw linkError;
      }

      console.error("[pre-signup] link provider failed", linkError);
      throwPreSignUpError(
        `Failed to link ${providerName || "provider"} account. Please try again or contact support.`,
        { code: "ProviderLinkingException", statusCode: 500 },
      );
    }
  }

  if (isOAuthSignUp && userStatus === "UNCONFIRMED") {
    throwUnconfirmedNative();
  }

  if (!isOAuthSignUp && isNativeSignUp) {
    throwEmailAlreadyInUse();
  }

  if (isOAuthSignUp && isCurrentProviderLinked) {
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;

    console.log("[pre-signup] provider already linked; allowing", {
      email,
      currentProvider: currentProviderName,
    });

    return event;
  }

  console.error("[pre-signup] unexpected existing-user scenario", {
    isOAuthSignUp,
    isNativeSignUp,
    userStatus,
    isCurrentProviderLinked,
    currentProvider: currentProviderName,
  });
  throwEmailAlreadyInUse();
};
