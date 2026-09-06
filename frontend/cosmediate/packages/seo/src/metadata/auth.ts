import type { Metadata } from "next";

import type { AuthMessages } from "@cosmediate/i18n";

export const AUTH_PAGES = {
  signin: { title: "Sign In" },
  signup: { title: "Create Account" },
  forgotPassword: { title: "Forgot Password" },
  resetPassword: { title: "Reset Password" },
  confirmSignup: { title: "Confirm Email" },
  processing: { title: "Signing In…" },
  home: { title: "Cosmediate Auth" },
} as const;

export type AuthPageKey = keyof typeof AUTH_PAGES;

type AuthPageMessages = Pick<AuthMessages, "pages" | "processing">;

function resolveAuthPageTitle(
  key: AuthPageKey,
  auth?: AuthPageMessages,
): string {
  if (!auth) return AUTH_PAGES[key].title;

  switch (key) {
    case "signin":
      return auth.pages.signin.title;
    case "signup":
      return auth.pages.signup.title;
    case "forgotPassword":
      return auth.pages.forgotPassword.title;
    case "resetPassword":
      return auth.pages.resetPassword.title;
    case "confirmSignup":
      return auth.pages.confirmSignup.title;
    case "processing":
      return auth.processing.completing;
    case "home":
      return AUTH_PAGES.home.title;
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

export function buildAuthPageMetadata(
  key: AuthPageKey,
  auth?: AuthPageMessages,
): Metadata {
  return {
    title: resolveAuthPageTitle(key, auth),
    robots: { index: false, follow: false },
  };
}
