import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import SpecialistServices from "@app/tenants/Clinic/sections/Settings/pages/Treatments/SpecialistServices";
import React from "react";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <SpecialistServices />;
};

export default page;
