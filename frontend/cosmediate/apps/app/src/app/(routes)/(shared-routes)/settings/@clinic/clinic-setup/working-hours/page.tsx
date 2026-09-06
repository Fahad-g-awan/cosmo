import WorkingHours from "@app/tenants/Clinic/sections/Settings/pages/clinicSetup/WorkingHours";
import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <WorkingHours />;
};

export default page;
