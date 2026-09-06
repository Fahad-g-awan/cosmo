import React from "react";

import ManagerProfile from "@app/tenants/Admin/sections/ClinicManagement/pages/managers/ManagerProfile";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <ManagerProfile />;
};

export default page;
