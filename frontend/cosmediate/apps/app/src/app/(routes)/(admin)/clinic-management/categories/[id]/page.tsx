import React from "react";

import CategoryDetails from "@app/tenants/Admin/sections/ClinicManagement/pages/categories/CategoryDetails";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <CategoryDetails />;
};

export default page;
