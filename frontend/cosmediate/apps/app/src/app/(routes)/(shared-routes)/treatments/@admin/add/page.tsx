import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AddTreatment from "@app/tenants/Admin/sections/TreatmentsManagement/pages/treatments/AddTreatment";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddTreatment />;
};

export default page;
