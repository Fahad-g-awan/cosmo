import React from "react";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import Profile from "@app/tenants/Admin/sections/Settings/pages/account/profile";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <Profile />;
};

export default page;
