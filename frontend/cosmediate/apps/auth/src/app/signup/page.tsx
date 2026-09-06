import type { Metadata } from "next";
import React from "react";

import { resolveAuthLocale } from "@cosmediate/i18n/server";
import { buildAuthPageMetadata } from "@cosmediate/seo";
import { getUiMessages } from "@cosmediate/i18n";

import { validateAuthSession } from "@auth/lib/server-utils";
import Signup from "@auth/features/Signup";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveAuthLocale();
  const messages = getUiMessages(locale);
  return buildAuthPageMetadata("signup", messages.auth);
}

const page = async () => {
  await validateAuthSession();

  return <Signup />;
};

export default page;
