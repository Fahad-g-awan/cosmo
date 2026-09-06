import type { Metadata } from "next";

import CreateSpecialist from "@app/tenants/Clinic/sections/Specialists/pages/specialists/AddSpecialist";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import { dashboardSectionTitle } from "@cosmediate/seo";

export const metadata: Metadata = dashboardSectionTitle("addSpecialist");

const page = async () => {
  await validateRoleForClinicRoutes();
  return <CreateSpecialist />;
};

export default page;
