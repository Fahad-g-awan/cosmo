import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateSpecialist from "@app/tenants/Clinic/sections/Specialists/pages/specialists/UpdateSpecialist";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <UpdateSpecialist />;
};

export default page;
