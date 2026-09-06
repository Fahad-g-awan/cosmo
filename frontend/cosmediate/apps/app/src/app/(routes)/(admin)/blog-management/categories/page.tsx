import React from "react";

import Categories from "@app/tenants/Admin/sections/BlogManagement/pages/categories";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <Categories />;
};

export default page;
