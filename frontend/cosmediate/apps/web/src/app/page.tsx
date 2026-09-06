import HomePage from "@web/features/HomePage";
import {
  JsonLd,
  buildMarketingMetadata,
  buildMarketingPageJsonLdForKey,
  resolveSiteContext,
} from "@cosmediate/seo";
import type { Metadata } from "next";

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await resolveSiteContext("web");
  return buildMarketingMetadata(ctx, "home");
}

export default async function Page() {
  const ctx = await resolveSiteContext("web");

  return (
    <>
      <JsonLd data={buildMarketingPageJsonLdForKey(ctx, "home")} />
      <HomePage />
    </>
  );
}
