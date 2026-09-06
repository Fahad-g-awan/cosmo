import React from "react";

import AuditTrail from "@app/admin/sections/AuditTrail";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AuditTrail />;
};

export default page;
