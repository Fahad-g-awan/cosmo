import SpecialistsProfile from "@web/features/Specialists/Profile";
import {
  JsonLd,
  ProfileSeoIntro,
  buildSpecialistMetadataById,
  buildSpecialistPageJsonLd,
  fetchSpecialistServer,
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
  return buildSpecialistMetadataById(ctx, id);
}

export default async function Page({ params }: PageProps) {
  const { slug: id } = await params;
  const ctx = await resolveSiteContext("web");
  const specialist = await fetchSpecialistServer(id);
  const messages = getSeoMessagesForContext(ctx);

  return (
    <>
      {specialist ? (
        <JsonLd data={buildSpecialistPageJsonLd(ctx, specialist)} />
      ) : null}
      {specialist ? (
        <div className="sr-only">
          <ProfileSeoIntro
            type="specialist"
            entity={specialist}
            messages={messages}
          />
        </div>
      ) : null}
      <SpecialistsProfile initialSpecialist={specialist} />
    </>
  );
}
