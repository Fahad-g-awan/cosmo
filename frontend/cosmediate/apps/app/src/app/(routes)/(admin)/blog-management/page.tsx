import React from "react";

import Blogs from "@app/tenants/Admin/sections/BlogManagement/pages/blogs";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <Blogs />;
};

export default page;
