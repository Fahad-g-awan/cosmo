import React from "react";

import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AddPatient from "@app/tenants/Admin/sections/Patients/pages/patients/AddPatient";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddPatient />;
};

export default page;
