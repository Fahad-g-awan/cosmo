import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import BrandDetails from "@app/tenants/Admin/sections/TreatmentsManagement/pages/brands/BrandDetails";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <BrandDetails />;
};

export default page;
