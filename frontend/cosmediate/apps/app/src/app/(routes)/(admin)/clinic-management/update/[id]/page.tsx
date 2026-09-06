import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateClinic from "@app/tenants/Admin/sections/ClinicManagement/pages/clinics/UpdateClinic";
import React from "react";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateClinic />;
};

export default page;
