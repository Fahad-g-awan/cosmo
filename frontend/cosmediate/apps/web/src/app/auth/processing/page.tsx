import type { Metadata } from "next";

import { buildAuthPageMetadata, resolveSiteContext } from "@cosmediate/seo";
import { getUiMessages } from "@cosmediate/i18n";

import AuthProcessing from "@web/features/auth/Processing";

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await resolveSiteContext("web");
  const messages = getUiMessages(ctx.messageLocale);
  return buildAuthPageMetadata("processing", messages.auth);
}

export default function Page() {
  return <AuthProcessing />;
}
