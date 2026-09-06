import React from "react";
import Admins from "@app/tenants/Admin/sections/ControlPanel/pages/admins";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <Admins />;
};

export default page;
