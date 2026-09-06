import {
  COGNITO_FEDERATED_PREFIX_TO_PROVIDER_NAME,
  COGNITO_DISPLAY_TO_DB_SLUG,
} from "../../../constants/auth/cognito/provider.constants.mjs";

/**
 * Sorts the provider display name by the Cognito user pool.
 *
 * @param {string} providerDisplayName - The provider display name.
 * @returns {string} - The sorted provider display name.
 *
 * @example
 * cognitoProviderSortKey("Google") // "google"
 * cognitoProviderSortKey("Facebook") // "facebook"
 * cognitoProviderSortKey("SignInWithApple") // "signinwithapple"
 * cognitoProviderSortKey("LoginWithAmazon") // "loginwithamazon"
 * cognitoProviderSortKey("1234567890") // ""
 */
export const cognitoProviderSortKey = (providerDisplayName) => {
  if (!providerDisplayName) return "";
  const s = String(providerDisplayName).trim();
  if (s === "SignInWithApple") return "signinwithapple";
  return s.toLowerCase();
};

/**
 * Parses the external username from the Cognito user pool.
 *
 * @param {string} [userName] — e.g. `google_<sub>` or `SignInWithApple_<sub>`
 * @returns {Object} - { prefixRaw, cognitoProviderName, providerSubject }
 *
 * @example
 * parseCognitoExternalUsername("google_1234567890") // {
 *   prefixRaw: "google",
 *   cognitoProviderName: "Google",
 *   providerSubject: "1234567890"
 * }
 * parseCognitoExternalUsername("signinwithapple_1234567890") // {
 *   prefixRaw: "signinwithapple",
 *   cognitoProviderName: "SignInWithApple",
 *   providerSubject: "1234567890"
 * }
 * parseCognitoExternalUsername("1234567890") // {
 *   prefixRaw: null,
 *   cognitoProviderName: null,
 *   providerSubject: null
 * }
 */
export const parseCognitoExternalUsername = (userName) => {
  const u = typeof userName === "string" ? userName.trim() : "";
  const idx = u.indexOf("_");

  if (idx <= 0 || idx >= u.length - 1) {
    return {
      prefixRaw: null,
      cognitoProviderName: null,
      providerSubject: null,
    };
  }

  const prefixRaw = u.slice(0, idx);
  const providerSubject = u.slice(idx + 1);
  const key = prefixRaw.toLowerCase();

  let cognitoProviderName =
    COGNITO_FEDERATED_PREFIX_TO_PROVIDER_NAME[key] ?? null;

  if (!cognitoProviderName && prefixRaw === "SignInWithApple") {
    cognitoProviderName = "SignInWithApple";
  }

  // Unknown single-token prefix pools (title-case heuristic)
  if (!cognitoProviderName && /^[a-zA-Z]+$/.test(prefixRaw)) {
    cognitoProviderName =
      prefixRaw.charAt(0).toUpperCase() + prefixRaw.slice(1).toLowerCase();
  }

  return { prefixRaw, cognitoProviderName, providerSubject };
};

/**
 * Converts the provider display name to a linked slug.
 *
 * @param {string} providerDisplayName - The provider display name.
 * @returns {string} - The linked slug.
 *
 * @example
 * cognitoProviderDisplayNameToLinkedSlug("Google") // "google"
 * cognitoProviderDisplayNameToLinkedSlug("Facebook") // "facebook"
 * cognitoProviderDisplayNameToLinkedSlug("SignInWithApple") // "signinwithapple"
 * cognitoProviderDisplayNameToLinkedSlug("LoginWithAmazon") // "loginwithamazon"
 * cognitoProviderDisplayNameToLinkedSlug("1234567890") // null
 */
export const cognitoProviderDisplayNameToLinkedSlug = (providerDisplayName) => {
  if (!providerDisplayName) return null;

  const key = cognitoProviderSortKey(providerDisplayName);
  const slug = COGNITO_DISPLAY_TO_DB_SLUG[key];

  return slug ?? (key?.length ? key : null);
};

/**
 * Converts the Cognito identities to a linked slug.
 *
 * @param {Array<{ providerName?: string }>} identitiesArr - The Cognito identities.
 * @returns {Array<string>} - The linked slugs.
 *
 * @example
 * linkedProviderSlugsFromCognitoIdentities([{ providerName: "Google" }]) // ["google"]
 * linkedProviderSlugsFromCognitoIdentities([{ providerName: "Facebook" }]) // ["facebook"]
 * linkedProviderSlugsFromCognitoIdentities([{ providerName: "SignInWithApple" }]) // ["signinwithapple"]
 * linkedProviderSlugsFromCognitoIdentities([{ providerName: "LoginWithAmazon" }]) // ["loginwithamazon"]
 */
export const linkedProviderSlugsFromCognitoIdentities = (identitiesArr) => {
  if (!Array.isArray(identitiesArr)) return [];

  const seen = new Set();
  const out = [];

  for (const row of identitiesArr) {
    const slug = cognitoProviderDisplayNameToLinkedSlug(row?.providerName);

    if (!slug || seen.has(slug)) continue;

    seen.add(slug);
    out.push(slug);
  }
  return out.sort();
};
