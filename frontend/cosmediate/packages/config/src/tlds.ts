/**
 * The set of TLDs Cosmediate runs on.
 *
 * Add new market TLDs here ONCE — `generateAllowedOrigins()` and the URL
 * helpers will pick them up automatically.
 */
export const COSMEDIATE_TLDS = [
  "com",
  "nl",
  "be",
  "de",
  "fr",
  "gr",
  "it",
] as const;

export type CosmediateTld = (typeof COSMEDIATE_TLDS)[number];

/**
 * Apps that live on every TLD via subdomains (or the apex, in `web`'s case).
 *
 * `auth` is intentionally NOT here — the auth IdP is `.com`-centralized
 * (decision A10 + M3, master plan §2).
 */
export const CLIENT_APPS = ["app", "web", "blog"] as const;
export type ClientApp = (typeof CLIENT_APPS)[number];

/**
 * Localhost dev ports. Single source of truth — mirrors `package.json`
 * `dev` scripts in each app.
 */
export const APP_PORTS: Record<ClientApp | "auth", number> = {
  web: 3000,
  blog: 3001,
  auth: 3002,
  app: 3003,
};

/**
 * Subdomain prefix per client app on a TLD.
 *
 * - `app`  → `app.cosmediate.<tld>`
 * - `blog` → `blog.cosmediate.<tld>`
 * - `web`  → `cosmediate.<tld>` (apex; `www.` is also allowed in CORS)
 */
export const APP_SUBDOMAINS: Record<ClientApp, string | null> = {
  app: "app",
  blog: "blog",
  web: null,
};

const AUTH_HOST = "auth.cosmediate.com";

/**
 * Generate the full set of origins allowed for CORS / origin checks.
 *
 * Includes:
 * - Localhost ports for all 4 apps
 * - Prod: `https://[www.|app.|blog.]cosmediate.<tld>` for every TLD
 * - Prod: `https://auth.cosmediate.com` (com only)
 * - Dev:  `https://dev.[app.|blog.]cosmediate.<tld>` for every TLD
 * - Dev:  `https://dev.auth.cosmediate.com`
 */
export function generateAllowedOrigins(): string[] {
  const origins = new Set<string>();

  for (const port of Object.values(APP_PORTS)) {
    origins.add(`http://localhost:${port}`);
  }

  for (const tld of COSMEDIATE_TLDS) {
    const apex = `cosmediate.${tld}`;
    origins.add(`https://${apex}`);
    origins.add(`https://www.${apex}`);
    origins.add(`https://app.${apex}`);
    origins.add(`https://blog.${apex}`);
    origins.add(`https://dev.${apex}`);
    origins.add(`https://dev.app.${apex}`);
    origins.add(`https://dev.blog.${apex}`);
  }

  origins.add(`https://${AUTH_HOST}`);
  origins.add(`https://dev.${AUTH_HOST}`);

  return Array.from(origins);
}
