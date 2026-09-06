import React from "react";

import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateBlog from "@app/tenants/Admin/sections/BlogManagement/pages/blogs/UpdateBlog";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateBlog />;
};

export default page;
