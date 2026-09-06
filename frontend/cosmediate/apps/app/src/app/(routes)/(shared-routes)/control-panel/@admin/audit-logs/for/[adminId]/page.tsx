import React from "react";

import AdminAuditLogsList from "@app/tenants/Admin/sections/ControlPanel/pages/auditLogs/AdminAuditLogsList";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async ({ params }: { params: Promise<{ adminId: string }> }) => {
  await validateRoleForAdminRoutes();
  const { adminId } = await params;
  return <AdminAuditLogsList adminId={adminId} />;
};

export default page;
