import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { resolveAuthLocale } from "@cosmediate/i18n/server";
import { buildAuthPageMetadata } from "@cosmediate/seo";
import { getUiMessages } from "@cosmediate/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveAuthLocale();
  const messages = getUiMessages(locale);
  return buildAuthPageMetadata("home", messages.auth);
}

export default function Page() {
  redirect("/signin");
}
