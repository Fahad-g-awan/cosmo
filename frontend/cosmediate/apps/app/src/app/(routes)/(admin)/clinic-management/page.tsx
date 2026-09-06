import React from "react";

import ClinicManagement from "@app/tenants/Admin/sections/ClinicManagement/pages/clinics";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <ClinicManagement />;
};

export default page;
