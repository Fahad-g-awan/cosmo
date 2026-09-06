import React from "react";

import UpdateManager from "@app/tenants/Admin/sections/ClinicManagement/pages/managers/UpdateManager";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateManager />;
};

export default page;
