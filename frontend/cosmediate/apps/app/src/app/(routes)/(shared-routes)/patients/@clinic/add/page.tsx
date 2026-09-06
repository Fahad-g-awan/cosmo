import React from "react";

import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import AddPatient from "@app/tenants/Clinic/sections/Patients/pages/patients/AddPatient";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <AddPatient />;
};

export default page;
