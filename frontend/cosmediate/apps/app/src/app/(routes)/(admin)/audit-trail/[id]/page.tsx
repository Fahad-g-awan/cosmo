import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";

import AuditLogDetails from "@app/admin/sections/AuditTrail/pages/auditLogs/AuditLogDetails";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

export const metadata: Metadata = dashboardSectionTitle("auditLog");

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AuditLogDetails />;
};

export default page;
