import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateCategory from "@app/tenants/Admin/sections/TreatmentsManagement/pages/categories/UpdateCategory";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateCategory />;
};

export default page;
