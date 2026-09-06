import React from "react";

import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateCategory from "@app/tenants/Admin/sections/BlogManagement/pages/categories/UpdateCategory";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateCategory />;
};

export default page;
