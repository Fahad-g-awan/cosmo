import type { Metadata } from "next";

import { buildDashboardSpecialistMetadataById } from "@cosmediate/seo";

import SpecialistProfile from "@app/tenants/Admin/sections/Specialists/pages/specialists/SpecialistProfile";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

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
  await validateRoleForAdminRoutes();
  return <SpecialistProfile />;
};

export default page;
