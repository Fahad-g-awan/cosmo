import FAQs from "@app/tenants/Clinic/sections/Settings/pages/clinicSetup/FAQs";
import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <FAQs />;
};

export default page;
