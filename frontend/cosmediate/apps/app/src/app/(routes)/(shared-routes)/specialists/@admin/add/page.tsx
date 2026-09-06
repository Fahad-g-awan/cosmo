import React from "react";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import CreateSpecialist from "@app/tenants/Admin/sections/Specialists/pages/specialists/AddSpecialist";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <CreateSpecialist />;
};

export default page;
