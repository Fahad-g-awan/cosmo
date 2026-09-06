# cosmediate-cognito-auth-emails

Cognito **Custom Message** trigger. Renders branded email HTML via the shared mailer layer and returns `event.response` — Cognito sends the email (no SES in this Lambda).

## Triggers

| `triggerSource` | Template |
|-----------------|----------|
| `CustomMessage_AdminCreateUser` | Credentials only (not welcome) |
| `CustomMessage_SignUp` | Email verification |
| `CustomMessage_ResendCode` | Sign-up resend if `UNCONFIRMED`, else forgot-password resend |
| `CustomMessage_ForgotPassword` | Password reset |
| `CustomMessage_VerifyUserAttribute` | Attribute verification |
| `CustomMessage_UpdateUserAttribute` | Attribute update |
| `CustomMessage_Authentication` | Sign-in / MFA code |

## Layout

```
index.mjs                 → handler
lib/custom-message.mjs    → render + set response
lib/trigger-map.mjs       → triggerSource → EMAIL_TYPE
lib/cognito-email-data.mjs → event.request → template data
```

Templates live in `lambda-service-provider/nodejs/lib/mailer/templates/auth/`.

## Lambda environment (optional)

Set on the Cognito trigger Lambda so auth emails use the correct sign-in URL:

- `APP_BASE_URL` — e.g. `https://cosmediate.nl` (falls back to mailer default if unset)

## AWS setup

1. Deploy `lambda-service-provider` layer and this module.
2. Attach to Cognito User Pool → **Custom message** trigger (all `CustomMessage_*` events).
3. Verify SES/Cognito email sending is enabled for the pool.

