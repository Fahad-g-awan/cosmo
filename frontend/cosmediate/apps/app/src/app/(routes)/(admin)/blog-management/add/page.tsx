import React from "react";

import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AddBlog from "@app/tenants/Admin/sections/BlogManagement/pages/blogs/AddBlog";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddBlog />;
};

export default page;
