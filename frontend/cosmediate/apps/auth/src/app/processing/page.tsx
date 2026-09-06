import type { Metadata } from "next";
import React from "react";

import { resolveAuthLocale } from "@cosmediate/i18n/server";
import { buildAuthPageMetadata } from "@cosmediate/seo";
import { getUiMessages } from "@cosmediate/i18n";

import AuthProcessing from "@auth/features/AuthProcessing";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveAuthLocale();
  const messages = getUiMessages(locale);
  return buildAuthPageMetadata("processing", messages.auth);
}

/**
 * Cognito OAuth callback (sign-in + account linking).
 * Must always render — logged-in users link providers from dashboard settings.
 */
const page = async () => {
  return <AuthProcessing />;
};

export default page;
