import React from "react";

import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import UpdatePatient from "@app/tenants/Clinic/sections/Patients/pages/patients/UpdatePatient";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <UpdatePatient />;
};

export default page;
