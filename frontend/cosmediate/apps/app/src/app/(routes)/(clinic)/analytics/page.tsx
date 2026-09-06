import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";

import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import Analytics from "@app/clinic/sections/Analytics";

export const metadata: Metadata = dashboardSectionTitle("analytics");

const page = async () => {
  await validateRoleForClinicRoutes();
  return <Analytics />;
};

export default page;
