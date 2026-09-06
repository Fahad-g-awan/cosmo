import { AUTH_ROUTE_DEFS } from "../routes/auth.routes.mjs";
import { PROVIDER_LINKED_RETRY_CODE } from "../../constants/errors/index.mjs";

/**
 * Canonical FE guidance: which signals warrant a bounded retry vs hard stop
 *
 * **`where`** **`applies`** **:** **`hostedUi`** **`→`** Hosted UI **`/oauth2/authorize`** **+** token **`exchange`** **; **`api`** **`→`** **`cosmediate-authentication`** REST **.
 */
export const AUTH_BOUNDED_RETRY_FLOWS = Object.freeze([
  {
    scenario: "pre_sign_up_auto_link",
    where: "hostedUi",
    match: {
      cognitoLambdaErrorCode: PROVIDER_LINKED_RETRY_CODE,
    },
    maxAttempts: 2,
    retryAction:
      "Start a fresh Hosted UI /oauth2/authorize round-trip immediately",
    fatalStop: false,
  },
  {
    scenario: "oauth_code_exchange_transient",
    where: "api",
    match: {
      routes: [AUTH_ROUTE_DEFS.SIGN_IN.key],
      httpStatus: 400,
      messageSubstrings: ["Failed to fetch token"],
    },
    maxAttempts: 2,
    retryAction:
      "Obtain new authorization code via Hosted UI then retry POST /auth/sign-in",
    fatalStop: false,
  },
]);
