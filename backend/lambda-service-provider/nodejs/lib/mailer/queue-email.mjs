import { SendMessageCommand } from "@aws-sdk/client-sqs";

import { getSqsClient } from "../messaging/sqs/sqs.client.mjs";
import { resolveMailConfig } from "./resolve-mail-config.mjs";
import { sendEmail } from "./send-email.mjs";

/**
 * Queue an email for async delivery. Falls back to sync sendEmail when queue URL is unset.
 *
 * @param {{
 *   to: string | string[],
 *   type: string,
 *   data?: Record<string, unknown>,
 *   config?: Record<string, unknown>,
 *   priority?: string,
 *   correlationId?: string,
 * }} params
 */
export const queueEmail = async ({
  to,
  type,
  data = {},
  config = {},
  priority = "normal",
  correlationId,
}) => {
  const mailConfig = resolveMailConfig(config);

  if (!mailConfig.emailQueueUrl) {
    console.log(
      "[mailer] EMAIL_QUEUE_URL not set — falling back to sync sendEmail",
    );
    return sendEmail({ to, type, data, config });
  }

  const recipients = Array.isArray(to) ? to : [to];
  const messageBody = JSON.stringify({
    emailType: type,
    recipients,
    data,
    priority,
    correlationId: correlationId ?? undefined,
    enqueuedAt: new Date().toISOString(),
    env: config.ENV ?? process.env.ENV ?? undefined,
  });

  const sqs = getSqsClient(config);
  const result = await sqs.send(
    new SendMessageCommand({
      QueueUrl: mailConfig.emailQueueUrl,
      MessageBody: messageBody,
    }),
  );

  console.log("[mailer] Email queued", {
    type,
    recipients,
    messageId: result.MessageId,
  });

  return result;
};
