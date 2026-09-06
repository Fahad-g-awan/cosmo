import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AddBrand from "@app/tenants/Admin/sections/TreatmentsManagement/pages/brands/AddBrand";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddBrand />;
};

export default page;
