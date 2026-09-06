import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateResult from "@app/tenants/Clinic/sections/Settings/pages/Treatments/TreatmentResults/UpdateResult";
import React from "react";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <UpdateResult />;
};

export default page;
