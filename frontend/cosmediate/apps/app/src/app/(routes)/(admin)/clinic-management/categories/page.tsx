import React from "react";

import ClinicCategories from "@app/tenants/Admin/sections/ClinicManagement/pages/categories/index";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <ClinicCategories />;
};

export default page;
