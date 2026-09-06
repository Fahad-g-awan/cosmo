import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";

import AppointmentRequests from "@app/tenants/Clinic/sections/AppointmentRequests";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

export const metadata: Metadata = dashboardSectionTitle("requests");

const page = async () => {
  await validateRoleForClinicRoutes();
  return <AppointmentRequests />;
};

export default page;
