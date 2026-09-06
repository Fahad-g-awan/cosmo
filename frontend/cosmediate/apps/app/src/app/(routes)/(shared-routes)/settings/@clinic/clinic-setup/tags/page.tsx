import Tags from "@app/tenants/Clinic/sections/Settings/pages/clinicSetup/Tags";
import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <Tags />;
};

export default page;
