import { renderEmail } from "/opt/nodejs/lib/mailer/index.mjs";

import { buildCognitoEmailData } from "./cognito-email-data.mjs";
import { resolveEmailTypeForTrigger } from "./trigger-map.mjs";

/**
 * Cognito Custom Message trigger — render template and set event.response only (no SES).
 *
 * @param {import("aws-lambda").CustomMessageTriggerEvent} event
 */
export const runCustomMessage = async (event) => {
  const emailType = resolveEmailTypeForTrigger(event);

  if (!emailType) {
    console.warn("[cognito-auth-emails] unhandled trigger — passthrough", {
      triggerSource: event.triggerSource,
    });
    return event;
  }

  const data = buildCognitoEmailData(event);
  const { subject, html } = renderEmail({ type: emailType, data });

  event.response ??= {};
  event.response.emailSubject = subject;
  event.response.emailMessage = html;

  console.log("[cognito-auth-emails] rendered", {
    triggerSource: event.triggerSource,
    emailType,
    email: data.email,
  });

  return event;
};
