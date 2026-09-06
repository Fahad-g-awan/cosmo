import type { Metadata } from "next";
import React from "react";

import { validateAuthSession } from "@auth/lib/server-utils";
import { resolveAuthLocale } from "@cosmediate/i18n/server";
import { buildAuthPageMetadata } from "@cosmediate/seo";
import { getUiMessages } from "@cosmediate/i18n";
import Signin from "@auth/features/Signin";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveAuthLocale();
  const messages = getUiMessages(locale);
  return buildAuthPageMetadata("signin", messages.auth);
}

const page = async () => {
  await validateAuthSession();

  return <Signin />;
};

export default page;
