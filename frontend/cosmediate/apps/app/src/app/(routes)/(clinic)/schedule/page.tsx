import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";

import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import Schedule from "@app/clinic/sections/Schedule";

export const metadata: Metadata = dashboardSectionTitle("schedule");

const page = async () => {
  await validateRoleForClinicRoutes();
  return <Schedule />;
};

export default page;
