import React from "react";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateSpecialist from "@app/tenants/Admin/sections/Specialists/pages/specialists/UpdateSpecialist";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateSpecialist />;
};

export default page;
