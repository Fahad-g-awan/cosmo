import TermsAndConditions from "@web/features/Legal/TermsAndConditions";
import {
  JsonLd,
  buildMarketingMetadata,
  buildMarketingPageJsonLdForKey,
  resolveSiteContext,
} from "@cosmediate/seo";
import type { Metadata } from "next";

export const revalidate = 604800;

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await resolveSiteContext("web");
  return buildMarketingMetadata(ctx, "termsAndConditions");
}

export default async function Page() {
  const ctx = await resolveSiteContext("web");

  return (
    <>
      <JsonLd data={buildMarketingPageJsonLdForKey(ctx, "termsAndConditions")} />
      <TermsAndConditions />
    </>
  );
}
