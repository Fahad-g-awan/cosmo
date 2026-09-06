import Specialist from "@web/features/Specialists";
import {
  JsonLd,
  buildListingMetadata,
  buildListingPageJsonLdForKey,
  resolveSiteContext,
} from "@cosmediate/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await resolveSiteContext("web");
  return buildListingMetadata(ctx, "specialists");
}

export default async function Page() {
  const ctx = await resolveSiteContext("web");

  return (
    <>
      <JsonLd data={buildListingPageJsonLdForKey(ctx, "specialists")} />
      <Specialist />
    </>
  );
}
