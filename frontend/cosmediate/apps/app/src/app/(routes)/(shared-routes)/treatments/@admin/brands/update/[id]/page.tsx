import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateBrand from "@app/tenants/Admin/sections/TreatmentsManagement/pages/brands/UpdateBrand";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateBrand />;
};

export default page;
