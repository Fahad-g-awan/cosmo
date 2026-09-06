import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateResult from "@app/tenants/Admin/sections/TreatmentsManagement/pages/results/UpdateResult";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateResult />;
};

export default page;
