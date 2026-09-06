import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import TreatmentResults from "@app/tenants/Clinic/sections/Settings/pages/Treatments/TreatmentResults";
import React from "react";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <TreatmentResults />;
};

export default page;
