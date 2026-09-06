import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import AddResult from "@app/tenants/Clinic/sections/Settings/pages/Treatments/TreatmentResults/AddResult";
import React from "react";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <AddResult />;
};

export default page;
