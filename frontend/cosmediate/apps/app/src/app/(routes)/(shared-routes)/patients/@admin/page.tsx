import Patients from "@app/admin/sections/Patients/pages/patients";
import React from "react";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <Patients />;
};

export default page;
