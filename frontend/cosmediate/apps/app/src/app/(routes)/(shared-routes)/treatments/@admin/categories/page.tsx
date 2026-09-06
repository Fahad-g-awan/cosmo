import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import TreatmentCategories from "@app/tenants/Admin/sections/TreatmentsManagement/pages/categories";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <TreatmentCategories />;
};

export default page;
