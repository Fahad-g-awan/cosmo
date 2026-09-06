import type { Metadata } from "next";

import { buildDashboardSpecialistMetadataById } from "@cosmediate/seo";

import SpecialistProfile from "@app/tenants/Clinic/sections/Specialists/pages/specialists/SpecialistProfile";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildDashboardSpecialistMetadataById(id);
}

const page = async () => {
  await validateRoleForClinicRoutes();
  return <SpecialistProfile />;
};

export default page;
