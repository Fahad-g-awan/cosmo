import { buildMailUrls } from "/opt/nodejs/lib/mailer/mail-urls.mjs";

/**
 * @param {import("aws-lambda").CustomMessageTriggerEvent} event
 */
export const buildCognitoEmailData = (event) => {
  const request = event.request ?? {};
  const attrs = request.userAttributes ?? {};
  const { signInUrl } = buildMailUrls({});

  return {
    email: attrs.email ?? "",
    codeParameter: request.codeParameter ?? "{####}",
    usernameParameter: request.usernameParameter ?? "{username}",
    linkParameter: request.linkParameter ?? "",
    signInUrl,
  };
};
