import React from "react";

import AddManager from "@app/tenants/Admin/sections/ClinicManagement/pages/managers/AddManager";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddManager />;
};

export default page;
