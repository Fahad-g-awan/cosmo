import React from "react";

import UpdateCategory from "@app/tenants/Admin/sections/ClinicManagement/pages/categories/UpdateCategory";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateCategory />;
};

export default page;
