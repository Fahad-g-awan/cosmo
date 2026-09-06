import SubTreatments from "@app/clinic/sections/Settings/pages/Treatments/SubTreatments";
import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <SubTreatments />;
};

export default page;
