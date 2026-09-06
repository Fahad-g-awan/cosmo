import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import AuditLogs from "@app/tenants/Clinic/sections/ControlPanel/pages/auditLogs";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <AuditLogs />;
};

export default page;
