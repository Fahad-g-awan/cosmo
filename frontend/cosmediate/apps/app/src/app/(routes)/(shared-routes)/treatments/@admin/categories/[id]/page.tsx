import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import CategoryDetails from "@app/tenants/Admin/sections/TreatmentsManagement/pages/categories/CategoryDetails";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <CategoryDetails />;
};

export default page;
