import type { Metadata } from "next";
import React from "react";

import { resolveAuthLocale } from "@cosmediate/i18n/server";
import { buildAuthPageMetadata } from "@cosmediate/seo";
import { getUiMessages } from "@cosmediate/i18n";

import { validateAuthSession } from "@auth/lib/server-utils";
import ResetPassword from "@auth/features/PasswordReset";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveAuthLocale();
  const messages = getUiMessages(locale);
  return buildAuthPageMetadata("resetPassword", messages.auth);
}

const page = async () => {
  await validateAuthSession();

  return <ResetPassword />;
};

export default page;
