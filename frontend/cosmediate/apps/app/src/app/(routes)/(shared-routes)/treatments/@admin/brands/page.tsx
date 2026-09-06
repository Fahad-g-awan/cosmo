import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import Brands from "@app/tenants/Admin/sections/TreatmentsManagement/pages/brands";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <Brands />;
};

export default page;
