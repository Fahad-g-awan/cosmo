import BasicInformation from "@app/tenants/Clinic/sections/Settings/pages/clinicSetup/BasicInformation";
import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <BasicInformation />;
};

export default page;
