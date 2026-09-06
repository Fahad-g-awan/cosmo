# cosmediate-dlq-consumer

Shared dead-letter queue consumer for **all** Cosmediate SQS queues. Analyzes each failed message and emails `DEV_ALERT_EMAILS` via **direct SES** (`sendEmail`) — never `dispatchEmail` / the email queue.

## Trigger

- **SQS:** shared DLQ `cosmediate-dlq-{env}` (SSM: `sqs/dlq` → `DLQ_SQS_URL`)
- Point any queue redrive policy at this DLQ (emails, reviews, indexing, etc.)

## Lambda env

| Variable | Required | Notes                                  |
| -------- | -------- | -------------------------------------- |
| `ENV`    | yes      | `dev` or `prod` — used by `loadConfig` |

Mail settings (`DEV_ALERT_EMAILS`, `MAIL_FROM_ADDRESS`, etc.) come from SSM via `loadConfig`.

## Flow

```
SQS DLQ record
  → parseDlqRecord()
  → analyzeDlqMessage()     # generic — email / EventBridge / SNS / JSON / text
  → sendDlqAlertEmail()     # sendEmail → SES (not queued)
```

## Message analysis

| Detected shape                 | Kind            | Inferred source           |
| ------------------------------ | --------------- | ------------------------- |
| `{ emailType, recipients, … }` | `EMAIL`         | `emails`                  |
| `{ "detail-type", detail, … }` | `EVENTBRIDGE`   | `eventbridge`             |
| SNS `Notification` envelope    | nested analysis | `sns`                     |
| Other JSON                     | `JSON`          | from attribute or unknown |
| Non-JSON body                  | `TEXT`          | from attribute or unknown |

Optional producer hint — set SQS message attribute `sourceQueue` (or `x-cosmediate-source-queue`) when enqueueing so the alert names the origin queue.

## Layout

```
index.mjs
lib/
  parse-dlq-record.mjs    → normalize SQS record
  process-dlq-batch.mjs   → batch loop + partial batch failures
```

Shared helpers live in the lambda layer:

- `lib/mailer/dlq/analyze-dlq-message.mjs`
- `lib/mailer/dlq/send-dlq-alert-email.mjs`
- `lib/mailer/templates/dev/dev-dlq-message.mjs` (`DEV_DLQ_MESSAGE`)

## Deploy checklist

1. Create shared DLQ `cosmediate-dlq-{env}`; set `sqs/dlq` in SSM.
2. Configure redrive policies on producer queues → this DLQ.
3. Deploy `lambda-service-provider` layer (mailer DLQ helpers + template).
4. Deploy this Lambda with shared layer, `ENV` set, SES send permissions.
5. Attach SQS event source mapping (batch size 1–10; visibility timeout ≥ Lambda timeout).
6. Set `DEV_ALERT_EMAILS` in SSM.

## Partial batch failures

If SES alert fails for a record, that message id is returned in `batchItemFailures` so SQS retries it.
