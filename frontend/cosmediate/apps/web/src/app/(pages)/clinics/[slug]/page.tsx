import ClinicsProfile from "@web/features/Clinics/Profile";
import {
  JsonLd,
  ProfileSeoIntro,
  buildClinicMetadataById,
  buildClinicPageJsonLd,
  fetchClinicServer,
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
  return buildClinicMetadataById(ctx, id);
}

export default async function Page({ params }: PageProps) {
  const { slug: id } = await params;
  const ctx = await resolveSiteContext("web");
  const clinic = await fetchClinicServer(id);
  const messages = getSeoMessagesForContext(ctx);

  return (
    <>
      {clinic ? <JsonLd data={buildClinicPageJsonLd(ctx, clinic)} /> : null}
      {clinic ? (
        <div className="sr-only">
          <ProfileSeoIntro type="clinic" entity={clinic} messages={messages} />
        </div>
      ) : null}
      <ClinicsProfile initialClinic={clinic} />
    </>
  );
}
