import type { Metadata } from "next";

import { buildDashboardTreatmentMetadataById } from "@cosmediate/seo";

import TreatmentDetails from "@app/tenants/Admin/sections/TreatmentsManagement/pages/treatments/TreatmentDetails";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildDashboardTreatmentMetadataById(id);
}

const page = async () => {
  await validateRoleForAdminRoutes();
  return <TreatmentDetails />;
};

export default page;
