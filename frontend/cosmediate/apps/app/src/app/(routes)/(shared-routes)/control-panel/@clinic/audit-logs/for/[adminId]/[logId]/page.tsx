import React from "react";

import AuditLogDetails from "@app/admin/sections/AuditTrail/pages/auditLogs/AuditLogDetails";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <AuditLogDetails />;
};

export default page;
