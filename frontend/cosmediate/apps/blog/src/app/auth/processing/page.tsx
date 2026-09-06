import type { Metadata } from "next";
import React from "react";

import { buildAuthPageMetadata, resolveSiteContext } from "@cosmediate/seo";
import { getUiMessages } from "@cosmediate/i18n";

import AuthProcessing from "@blog/features/auth/Processing";

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await resolveSiteContext("blog");
  const messages = getUiMessages(ctx.messageLocale);
  return buildAuthPageMetadata("processing", messages.auth);
}

const page = () => {
  return <AuthProcessing />;
};

export default page;
