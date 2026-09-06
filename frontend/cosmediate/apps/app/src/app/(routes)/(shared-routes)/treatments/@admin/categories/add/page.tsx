import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AddCategory from "@app/tenants/Admin/sections/TreatmentsManagement/pages/categories/AddCategory";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddCategory />;
};

export default page;
