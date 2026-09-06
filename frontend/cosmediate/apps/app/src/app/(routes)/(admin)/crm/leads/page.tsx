import React from "react";

import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import ClientLeads from "@app/tenants/Admin/sections/crm/pages/clientLeads";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <ClientLeads />;
};

export default page;
