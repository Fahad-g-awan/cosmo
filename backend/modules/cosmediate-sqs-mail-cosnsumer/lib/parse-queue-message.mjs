/**
 * @param {string} body — SQS record body
 */
export const parseEmailQueueMessage = (body) => {
  let parsed;
  try {
    parsed = typeof body === "string" ? JSON.parse(body) : body;
  } catch {
    throw new Error("[mailer] Invalid queue message JSON");
  }

  const emailType = parsed.emailType;
  const recipients = parsed.recipients;

  if (!emailType || typeof emailType !== "string") {
    throw new Error("[mailer] Missing emailType in queue message");
  }

  if (!Array.isArray(recipients) || !recipients.length) {
    throw new Error("[mailer] Missing recipients in queue message");
  }

  return {
    emailType,
    recipients,
    data: parsed.data ?? {},
    priority: parsed.priority ?? "normal",
    correlationId: parsed.correlationId,
    enqueuedAt: parsed.enqueuedAt,
    env: parsed.env,
  };
};
