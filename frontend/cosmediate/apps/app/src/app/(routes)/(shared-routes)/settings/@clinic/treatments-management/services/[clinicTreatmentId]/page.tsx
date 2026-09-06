import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import SpecialistServiceDetail from "@app/tenants/Clinic/sections/Settings/pages/Treatments/SpecialistServices/detail";
import React from "react";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <SpecialistServiceDetail />;
};

export default page;
