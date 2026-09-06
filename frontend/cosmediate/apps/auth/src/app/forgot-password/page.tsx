import type { Metadata } from "next";
import React from "react";

import { resolveAuthLocale } from "@cosmediate/i18n/server";
import { buildAuthPageMetadata } from "@cosmediate/seo";
import { getUiMessages } from "@cosmediate/i18n";

import { validateAuthSession } from "@auth/lib/server-utils";
import ForgotPassword from "@auth/features/ForgotPassword";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveAuthLocale();
  const messages = getUiMessages(locale);
  return buildAuthPageMetadata("forgotPassword", messages.auth);
}

const page = async () => {
  await validateAuthSession();

  return <ForgotPassword />;
};

export default page;
