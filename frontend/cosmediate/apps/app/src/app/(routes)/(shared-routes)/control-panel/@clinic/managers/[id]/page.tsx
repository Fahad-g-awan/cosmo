import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import ManagerProfile from "@app/tenants/Clinic/sections/ControlPanel/pages/managers/ManagerProfile";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <ManagerProfile />;
};

export default page;
