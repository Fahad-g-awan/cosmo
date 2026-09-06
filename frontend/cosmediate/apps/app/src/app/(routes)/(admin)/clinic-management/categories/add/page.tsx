import React from "react";

import AddCategory from "@app/tenants/Admin/sections/ClinicManagement/pages/categories/AddCategory";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddCategory />;
};

export default page;
