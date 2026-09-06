import Partners from "@web/features/marketing/pages/Partners";
import {
  JsonLd,
  buildMarketingMetadata,
  buildMarketingPageJsonLdForKey,
  resolveSiteContext,
} from "@cosmediate/seo";
import type { Metadata } from "next";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await resolveSiteContext("web");
  return buildMarketingMetadata(ctx, "partnersClinics");
}

export default async function Page() {
  const ctx = await resolveSiteContext("web");

  return (
    <>
      <JsonLd data={buildMarketingPageJsonLdForKey(ctx, "partnersClinics")} />
      <Partners />
    </>
  );
}
