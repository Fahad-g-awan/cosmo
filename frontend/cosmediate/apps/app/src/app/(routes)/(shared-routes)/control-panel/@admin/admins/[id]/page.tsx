import React from "react";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AdminProfile from "@app/tenants/Admin/sections/ControlPanel/pages/admins/AdminProfile";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AdminProfile />;
};

export default page;
