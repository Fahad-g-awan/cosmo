import React from "react";

import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import PatientProfile from "@app/tenants/Admin/sections/Patients/pages/patients/PatientProfile";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <PatientProfile />;
};

export default page;
