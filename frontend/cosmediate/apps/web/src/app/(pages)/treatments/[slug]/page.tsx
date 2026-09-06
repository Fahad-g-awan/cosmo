import TreatmentsProfile from "@web/features/Treatments/Profile";
import {
  JsonLd,
  ProfileSeoIntro,
  buildTreatmentMetadataById,
  buildTreatmentPageJsonLd,
  fetchTreatmentServer,
  getSeoMessagesForContext,
  resolveSiteContext,
} from "@cosmediate/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: id } = await params;
  const ctx = await resolveSiteContext("web");
  return buildTreatmentMetadataById(ctx, id);
}

export default async function Page({ params }: PageProps) {
  const { slug: id } = await params;
  const ctx = await resolveSiteContext("web");
  const treatment = await fetchTreatmentServer(id);
  const messages = getSeoMessagesForContext(ctx);

  return (
    <>
      {treatment ? (
        <JsonLd data={buildTreatmentPageJsonLd(ctx, treatment)} />
      ) : null}
      {treatment ? (
        <div className="sr-only">
          <ProfileSeoIntro
            type="treatment"
            entity={treatment}
            messages={messages}
          />
        </div>
      ) : null}
      <TreatmentsProfile initialTreatment={treatment} />
    </>
  );
}
