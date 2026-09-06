import React from "react";

import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AddCategory from "@app/tenants/Admin/sections/BlogManagement/pages/categories/AddCategory";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddCategory />;
};

export default page;
