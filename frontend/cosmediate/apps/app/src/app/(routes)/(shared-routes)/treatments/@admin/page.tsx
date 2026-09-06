import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import Treatments from "@app/tenants/Admin/sections/TreatmentsManagement/pages/treatments";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <Treatments />;
};

export default page;
