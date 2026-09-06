import React from "react";
import Managers from "@app/tenants/Clinic/sections/ControlPanel/pages/managers";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <Managers />;
};

export default page;
