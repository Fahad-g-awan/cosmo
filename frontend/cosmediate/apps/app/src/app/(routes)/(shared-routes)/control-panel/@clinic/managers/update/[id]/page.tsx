import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateManager from "@app/tenants/Clinic/sections/ControlPanel/pages/managers/UpdateManager";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <UpdateManager />;
};

export default page;
