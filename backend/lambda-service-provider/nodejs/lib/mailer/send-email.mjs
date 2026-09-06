import { SendEmailCommand } from "@aws-sdk/client-ses";

import { resolveMailConfig } from "./resolve-mail-config.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../errors/http-error.mjs";
import { renderEmail } from "./render-email.mjs";
import { sesClient } from "./ses.client.mjs";

/**
 * Render a template and send via SES.
 *
 * @param {{
 *   to: string | string[],
 *   type: string,
 *   data?: Record<string, unknown>,
 *   config?: Record<string, unknown>,
 * }} params
 */
export const sendEmail = async ({ to, type, data = {}, config = {} }) => {
  const mailConfig = resolveMailConfig(config);
  const { subject, html, text } = renderEmail({ type, data });
  const recipients = Array.isArray(to) ? to : [to];

  if (!recipients.length || !recipients[0]) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      message: "Email recipient is required",
    });
  }

  try {
    const body = {
      Html: {
        Data: html,
        Charset: "UTF-8",
      },
    };

    if (text) {
      body.Text = {
        Data: text,
        Charset: "UTF-8",
      };
    }

    const result = await sesClient.send(
      new SendEmailCommand({
        Source: mailConfig.fromEmail,
        Destination: {
          ToAddresses: recipients,
        },
        ReplyToAddresses: mailConfig.replyTo ? [mailConfig.replyTo] : undefined,
        Message: {
          Subject: {
            Data: subject,
            Charset: "UTF-8",
          },
          Body: body,
        },
      }),
    );

    console.log("[mailer] Email sent", {
      type,
      recipients,
      messageId: result.MessageId,
    });

    return result;
  } catch (err) {
    console.error("[mailer] sendEmail failed", { type, err });

    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Error sending email",
      details: [err?.message ?? ""],
    });
  }
};
