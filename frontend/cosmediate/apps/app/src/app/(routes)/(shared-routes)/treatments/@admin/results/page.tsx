import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import TreatmentResults from "@app/tenants/Admin/sections/TreatmentsManagement/pages/results";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <TreatmentResults />;
};

export default page;
