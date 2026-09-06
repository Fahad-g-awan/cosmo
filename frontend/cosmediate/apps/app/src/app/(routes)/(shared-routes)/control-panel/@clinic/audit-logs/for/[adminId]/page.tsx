import React from "react";

import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import ManagerAuditLogsList from "@app/tenants/Clinic/sections/ControlPanel/pages/auditLogs/ManagerAuditLogsList";

const page = async ({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) => {
  await validateRoleForClinicRoutes();
  const { adminId } = await params;
  return <ManagerAuditLogsList managerId={adminId} />;
};

export default page;
