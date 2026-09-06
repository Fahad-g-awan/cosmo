import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import AddManager from "@app/tenants/Clinic/sections/ControlPanel/pages/managers/AddManager";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <AddManager />;
};

export default page;
