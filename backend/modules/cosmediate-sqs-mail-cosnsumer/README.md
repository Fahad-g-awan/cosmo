# cosmediate-mailer

SQS consumer that renders and sends transactional emails via the shared mailer layer (`sendEmail` → SES).

## Trigger

- **SQS:** `cosmediate-emails-queue-{env}` (batch size 1–10 recommended)
- **DLQ:** `cosmediate-emails-dlq-{env}` after max receives (e.g. 3)

## Lambda env

| Variable | Required | Notes |
|----------|----------|-------|
| `ENV` | yes | `dev` or `prod` — used by `loadConfig` |

Mail settings (`MAIL_FROM_ADDRESS`, `APP_BASE_URL`, `EMAIL_QUEUE_URL`, etc.) come from SSM via `loadConfig` when optional keys exist under `/cosmediate/{env}/`.

## Message format

Produced by `queueEmail()` in the mailer layer:

```json
{
  "emailType": "WELCOME_PATIENT",
  "recipients": ["user@example.com"],
  "data": { "variant": "self", "patientName": "Jane" },
  "priority": "normal",
  "correlationId": "optional-uuid",
  "enqueuedAt": "2026-06-30T12:00:00.000Z",
  "env": "dev"
}
```

## Layout

```
index.mjs
lib/parse-queue-message.mjs   → validate SQS body
lib/process-email-batch.mjs → sendEmail per record; partial batch failures
```

## Deploy checklist

1. Create SQS queue + DLQ; set `sqs/emails_queue` in SSM for the environment.
2. Deploy `lambda-service-provider` layer.
3. Deploy this Lambda with shared layer, `ENV` set, SES send permissions.
4. Attach SQS event source mapping (visibility timeout ≥ Lambda timeout).
5. Set `EMAIL_QUEUE_URL` in SSM — producers (`dispatchEmail` → `queueEmail`) will enqueue instead of sync SES.

Cognito Custom Message emails are **not** queued — they must return `event.response` synchronously.
