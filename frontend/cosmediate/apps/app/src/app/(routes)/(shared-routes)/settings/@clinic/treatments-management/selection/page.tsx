import Selection from "@app/clinic/sections/Settings/pages/Treatments/TreatmentSelection";
import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <Selection />;
};

export default page;
