import Patients from "@app/tenants/Clinic/sections/Patients/pages/patients";
import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <Patients />;
};

export default page;
