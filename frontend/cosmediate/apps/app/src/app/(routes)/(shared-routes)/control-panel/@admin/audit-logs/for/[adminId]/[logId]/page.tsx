import React from "react";

import AuditLogDetails from "@app/admin/sections/AuditTrail/pages/auditLogs/AuditLogDetails";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AuditLogDetails />;
};

export default page;
