import React from "react";

import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import PatientProfile from "@app/tenants/Clinic/sections/Patients/pages/patients/PatientProfile";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <PatientProfile />;
};

export default page;
