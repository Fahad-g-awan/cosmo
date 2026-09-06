import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";

import ActivityLogDetails from "@app/admin/sections/ActivityMonitoring/pages/activityLogs/ActivityLogDetails";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

export const metadata: Metadata = dashboardSectionTitle("activityDetails");

const page = async () => {
  await validateRoleForAdminRoutes();
  return <ActivityLogDetails />;
};

export default page;
