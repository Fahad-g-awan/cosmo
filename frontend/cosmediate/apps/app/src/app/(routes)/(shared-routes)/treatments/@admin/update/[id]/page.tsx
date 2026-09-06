import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateTreatment from "@app/tenants/Admin/sections/TreatmentsManagement/pages/treatments/UpdateTreatment";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateTreatment />;
};

export default page;
