import Certificates from "@app/tenants/Clinic/sections/Settings/pages/clinicSetup/Certificates";
import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <Certificates />;
};

export default page;
