import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AddResult from "@app/tenants/Admin/sections/TreatmentsManagement/pages/results/AddResult";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddResult />;
};

export default page;
