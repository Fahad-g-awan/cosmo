import React from "react";

import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import ClientLeadDetails from "@app/tenants/Admin/sections/crm/pages/clientLeads/ClientLeadDetails";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <ClientLeadDetails />;
};

export default page;
