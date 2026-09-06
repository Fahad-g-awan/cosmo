import React from "react";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AuditLogs from "@app/tenants/Admin/sections/ControlPanel/pages/auditLogs";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AuditLogs />;
};

export default page;
