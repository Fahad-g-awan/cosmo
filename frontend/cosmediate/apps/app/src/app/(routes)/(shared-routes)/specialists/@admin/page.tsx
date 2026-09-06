import Specialists from "@app/tenants/Admin/sections/Specialists/pages/specialists";
import React from "react";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <Specialists />;
};

export default page;
