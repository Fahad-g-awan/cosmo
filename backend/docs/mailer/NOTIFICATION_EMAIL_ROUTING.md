# Notification email routing

Domain notification emails are orchestrated under `backend/lambda-service-provider/nodejs/lib/mailer/`. Module services call `emitXNotificationEmails()` after successful DB writes. Email failures never roll back persistence — `dispatchEmail` logs and swallows send errors.

## Public API

Import from `/opt/nodejs/lib/mailer/index.mjs`:

| Export | Use |
|--------|-----|
| `emitClinicNotificationEmails` | Clinic CRUD + manager assignment on clinic update |
| `emitManagerNotificationEmails` | Manager CRUD + clinic assignment changes |
| `emitClinicCategoryNotificationEmails` | Clinic category CRUD (oversight only) |
| `emitSpecialistNotificationEmails` | Specialist CRUD + clinic assignment |
| `emitPatientNotificationEmails` | Patient staff CRUD |
| `emitAdminNotificationEmails` | Admin user CRUD |
| `emitTreatmentNotificationEmails` | Catalog treatment / category / brand / admin-owned results |
| `emitClinicTreatmentNotificationEmails` | Clinic offerings, sub-treatments, assignments, clinic-owned results |
| `emitBlogNotificationEmails` | Blog + blog category CRUD |
| `emitReviewNotificationEmails` | Review + reply lifecycle |
| `emitEntityUpdateNotificationEmails` | Shared profile/identity update routing (used by emitters) |
| `reportDevAlert` | Runtime failure alerts (see Dev alerts below) |

Orchestrators live in `lib/mailer/notification-emails/emitters/`.

## Config keys (SSM)

| Config key | SSM path | Purpose |
|------------|----------|---------|
| `MAIL_FROM_ADDRESS` | `mail/from_address` | SES From |
| `MAIL_REPLY_TO` | `mail/reply_to` | Optional Reply-To |
| `APP_BASE_URL` | `url/app_base` | Marketing / sign-in links |
| `APP_DASHBOARD_URL` | `url/app_dashboard` | Dashboard deep links |
| `EMAIL_QUEUE_URL` | `sqs/emails_queue` | Async email queue |
| `ADMIN_NOTIFICATION_EMAILS` | `mail/admin_notification_emails` | Admin audit list |
| `MANDATORY_NOTIFICATION_EMAILS` | `mail/mandatory_notification_emails` | Oversight list on every admin audit email |
| `DEV_ALERT_EMAILS` | `mail/dev_alert_emails` | Runtime failure alerts |
| `DEV_ALERT_MIN_INTERVAL_MS` | `mail/dev_alert_min_interval_ms` | Per-key rate limit (default 15 min) |
| `USER_NOTIFICATIONS_ENABLED` | `mail/user_notifications_enabled` | Global kill switch (`false` disables user-facing notifications) |

Resolved via `resolveMailConfig()`.

## Routing rules

### Oversight (admin-format emails)

`sendAdminNotification` sends to `ADMIN_NOTIFICATION_EMAILS` + `MANDATORY_NOTIFICATION_EMAILS` (deduped). Mandatory is merged **only** on admin audit paths — not on stakeholder or patient emails.

Scopes (`OVERSIGHT_SCOPE`):

- **FULL** — admin list + mandatory (default for domain audits)
- **MANDATORY_ONLY** — mandatory only (admin self profile update without permission change)

### Admin actor

When `authContext.role === ADMIN` and the action is an update or delete:

- **Only** oversight emails (`ADMIN_NOTIFICATION_EMAILS` + `MANDATORY_NOTIFICATION_EMAILS`)
- **No** email to the subject entity, linked managers, specialists, patients, or other stakeholders

**Exception — create / provisioning:** `WELCOME_*` and Cognito credential emails still go to the new user. No stakeholder emails on admin create.

`dispatchNotificationEmails` returns early after oversight when the actor is admin.

### Non-admin staff

- **Edit another user/entity:** target + actor confirm + full oversight
- **Self-update:** self-confirm + full oversight (mandatory-only scope when admin edits own profile without permission change)

### Reviews (special cases)

| Event | Recipients |
|-------|------------|
| Review created | Target clinic managers, or specialist + linked clinic managers (`USER_REVIEW_RECEIVED`). No author email. No oversight. |
| Review updated/deleted | Oversight + staff actor confirm |
| Reply created | Review author via direct `sendUserNotification` (`USER_REVIEW_REPLY_RECEIVED`) — bypasses admin-actor suppression so patients still get replies |
| Reply updated/deleted | Oversight + staff actor confirm |

## Email matrix by module

### Clinics + managers (`cosmediate-clinics`)

| Event | Emails |
|-------|--------|
| Clinic created | Admin audit + newly attached managers |
| Clinic updated | Stakeholders + admin audit; manager add/remove loops send assignment emails without duplicate audits |
| Clinic deleted | Stakeholders + admin audit |
| Manager created | `WELCOME_MANAGER` + admin provision audit + clinic stakeholders |
| Manager updated | Profile/identity via `emitEntityUpdateNotificationEmails`; clinic assignment diff emails; single admin audit when needed |
| Manager deleted | Clinic stakeholders + admin audit |
| Clinic category CRUD | Oversight only |

### Specialists (`cosmediate-specialists`)

| Event | Emails |
|-------|--------|
| Created (non-admin) | `WELCOME_SPECIALIST` + stakeholders + admin audit + creator confirm |
| Created (admin) | `WELCOME_SPECIALIST` + admin audit + mandatory only |
| Updated / deleted | Non-admin: self + stakeholders + audit. Admin actor: audit + mandatory only |
| Clinic assignment changed | Same admin-actor rule |

### Patients (`cosmediate-patients`)

| Event | Emails |
|-------|--------|
| Created (staff, non-admin) | `WELCOME_PATIENT` + creator confirm + admin audit |
| Created (admin) | `WELCOME_PATIENT` + admin audit + mandatory; no creator or linked-party emails |
| Updated / deleted | Non-admin: self + audit. Admin actor: audit + mandatory only |

### Admins (`cosmediate-admins`)

| Event | Emails |
|-------|--------|
| Created | `WELCOME_ADMIN` + provision audit when created by another admin |
| Updated / deleted | Oversight only |

### Treatments (`cosmediate-treatments`)

**Catalog** (`emitTreatmentNotificationEmails`): create / update / delete → admin audit + mandatory.

**Clinic-scoped** (`emitClinicTreatmentNotificationEmails`):

| Kind | Emails |
|------|--------|
| Offering sync | Clinic stakeholders + audit (admin actor: audit + mandatory only) |
| Sub-treatment sync | Same |
| Specialist assignment | Clinic stakeholders + assigned specialists + audit |
| Clinic-owned result CRUD | Same pattern as clinic-scoped ops |

### Blogs (`cosmediate-blogs`)

Blog and blog category CRUD → admin audit + mandatory.

### Reviews (`cosmediate-reviews`)

See special cases above. WebSocket events are unchanged.

### Authentication

No domain emitters. Cognito render-only lambda + transactional auth emails (`PASSWORD_CHANGED`, `SOCIAL_ACCOUNT_LINKED`) stay as-is.

## Dev alerts

**No shared Lambda wrapper.** Each module calls `reportDevAlert` directly in its own `catch` block (same pattern as `cosmediate-clinics/index.mjs`).

```javascript
} catch (e) {
  await reportDevAlert({
    module: "cosmediate-clinics",
    error: e,
    config: runtimeConfig,
    event,
  });
  console.error("[clinics] handler", e);
  return respondError(e, { headers: baseHeaders });
}
```

`reportDevAlert`:

- Never throws; does not change HTTP status or error payloads
- Skips expected client errors (`HttpError` with status &lt; 500)
- Rate-limited per `module + errorType` on warm Lambdas
- Sends `DEV_RUNTIME_ERROR` to `DEV_ALERT_EMAILS`

### Modules wired today

| Module | Where |
|--------|-------|
| `cosmediate-clinics` | `index.mjs` handler catch |
| `cosmediate-admins` | `index.mjs` handler catch |
| `cosmediate-specialists` | `index.mjs` handler catch |
| `cosmediate-patients` | `index.mjs` handler catch |
| `cosmediate-treatments` | `index.mjs` handler catch |
| `cosmediate-blogs` | `index.mjs` handler catch |
| `cosmediate-reviews` | `index.mjs` handler catch |
| `cosmediate-authentication` | `index.mjs` handler catch |
| `cosmediate-auth-client-apps` | `index.mjs` handler catch |
| `cosmediate-platform` | `index.mjs` handler catch |
| `cosmediate-image-upload` | `index.mjs` handler catch |
| `cosmediate-lambda-test` | `index.mjs` handler catch |
| `cosmediate-api-authorizer` | `index.mjs` handler catch |
| `cosmediate-cognito-auth-emails` | `index.mjs` handler catch |
| `cosmediate-pre-auth-signup` | `index.mjs` handler catch |
| `cosmediate-pre-auth-token-gen` | `index.mjs` handler catch |
| `cosmediate-post-confirmation` | `index.mjs` handler catch |
| `cosmediate-websocket-connect` | `index.mjs` handler catch |
| `cosmediate-websocket-disconnect` | `index.mjs` handler catch |
| `cosmediate-opensearch-indexing` | `index.mjs` handler catch |
| `cosmediate-opensearch-mapping` | `index.mjs` handler catch |
| `cosmediate-mailer` | `index.mjs` + `lib/process-email-batch.mjs` per-message failure |

**Excluded:** `cosmediate-leads`, `cosmediate-hubspot-consumer` (lead consumer).

Add `reportDevAlert` to new Lambdas using the same inline pattern when they need runtime failure visibility.

## Delivery pipeline

```
emitXNotificationEmails → sendAdminNotification / sendUserNotification / dispatchEmail
  → queueEmail (SQS) → cosmediate-mailer → sendEmail → SES
```

Cognito auth emails use `renderEmail` only (no queue).

## Related files

- `lib/mailer/notification-emails/actor-routing.mjs` — recipient plans, admin actor, oversight scope
- `lib/mailer/notification-emails/recipient-resolvers.mjs` — clinic/manager/specialist/review stakeholders
- `lib/mailer/notification-emails/dispatch-notification-emails.mjs` — unified user + oversight dispatch
- `lib/mailer/dev-alerts/report-dev-alert.mjs` — safe dev alert entry point
