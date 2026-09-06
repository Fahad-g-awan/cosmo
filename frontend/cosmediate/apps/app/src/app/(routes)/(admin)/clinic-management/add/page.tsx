import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AddClinic from "@app/tenants/Admin/sections/ClinicManagement/pages/clinics/AddClinic";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddClinic />;
};

export default page;
