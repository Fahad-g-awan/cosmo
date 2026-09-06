import { CognitoJwtVerifier } from "aws-jwt-verify";
import { respond } from "/opt/nodejs/lib/http/response.mjs";

// Map alias -> verifier instance (cached across invocations)
export const verifiers = new Map();

/**
 * Get a verifier instance for a given alias and config.
 *
 * @param {string} alias
 * @param {Object} config
 * @returns {CognitoJwtVerifier}
 */
export const getVerifier = (alias, config) => {
  const key = `${alias}:${config.COGNITO_USER_POOL_ID}:${config.COGNITO_CLIENT_ID}`;

  if (!verifiers.has(key)) {
    verifiers.set(
      key,
      CognitoJwtVerifier.create({
        userPoolId: config.COGNITO_USER_POOL_ID,
        tokenUse: "access", // Only accept access tokens here
        clientId: config.COGNITO_CLIENT_ID, // Checks client_id (access) / aud (id)
      }),
    );
  }

  return verifiers.get(key);
};

/**
 * On success, allow a request.
 * @param {Object} context
 * @param {Object} headers
 * @param {string} message
 * @returns {Object} response object
 */
export const allow = ({ context, headers = {}, message }) => {
  return respond({
    statusCode: 200,
    payload: { message },
    headers,
    isAuthorized: true,
    context,
  });
};

/**
 * On failure, deny a request.
 * @param {Object} context
 * @param {Object} headers
 * @param {string} message
 * @returns {Object} response object
 */
export const deny = ({ context, headers = {}, message }) => {
  return respond({
    statusCode: 401,
    payload: { error: message },
    headers,
    isAuthorized: false,
    context,
  });
};

// export const generatePolicy = (principalId, effect, resource, context) => {
//   const policy = {
//     principalId,
//     policyDocument: {
//       Version: "2012-10-17",
//       Statement: [
//         {
//           Action: "execute-api:Invoke",
//           Effect: effect,
//           Resource: resource,
//         },
//       ],
//     },
//   };
//   if (context) {
//     policy.context = context;
//   }
//   return policy;
// };
