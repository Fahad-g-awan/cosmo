import React from "react";

import Moderation from "@app/admin/sections/Moderation";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <Moderation />;
};

export default page;
