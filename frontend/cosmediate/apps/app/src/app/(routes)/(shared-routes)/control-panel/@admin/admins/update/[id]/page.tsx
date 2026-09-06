import React from "react";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateAdmin from "@app/tenants/Admin/sections/ControlPanel/pages/admins/UpdateAdmin";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateAdmin />;
};

export default page;
