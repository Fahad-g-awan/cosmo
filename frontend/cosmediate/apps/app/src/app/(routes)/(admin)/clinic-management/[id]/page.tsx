import type { Metadata } from "next";

import { buildDashboardClinicMetadataById } from "@cosmediate/seo";

import ClinicProfile from "@app/tenants/Admin/sections/ClinicManagement/pages/clinics/ClinicProfile";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildDashboardClinicMetadataById(id);
}

const page = async () => {
  await validateRoleForAdminRoutes();
  return <ClinicProfile />;
};

export default page;
