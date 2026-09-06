import React from "react";

import Managers from "@app/tenants/Admin/sections/ClinicManagement/pages/managers";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <Managers />;
};

export default page;
