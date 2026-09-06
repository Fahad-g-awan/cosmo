import React from "react";

import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import UpdatePatient from "@app/tenants/Admin/sections/Patients/pages/patients/UpdatePatient";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdatePatient />;
};

export default page;
