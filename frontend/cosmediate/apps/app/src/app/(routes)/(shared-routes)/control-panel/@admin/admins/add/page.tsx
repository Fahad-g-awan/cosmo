import React from "react";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AddAdmin from "@app/tenants/Admin/sections/ControlPanel/pages/admins/AddAdmin";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddAdmin />;
};

export default page;
