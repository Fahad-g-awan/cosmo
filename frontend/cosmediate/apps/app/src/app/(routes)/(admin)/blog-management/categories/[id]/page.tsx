import React from "react";

import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import CategoryDetails from "@app/tenants/Admin/sections/BlogManagement/pages/categories/CategoryDetails";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <CategoryDetails />;
};

export default page;
