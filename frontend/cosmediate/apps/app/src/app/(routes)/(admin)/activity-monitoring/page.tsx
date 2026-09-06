import React from "react";

import ActivityMonitoring from "@app/admin/sections/ActivityMonitoring";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <ActivityMonitoring />;
};

export default page;
