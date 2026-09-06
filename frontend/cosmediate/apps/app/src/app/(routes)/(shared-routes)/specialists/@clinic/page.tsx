import Specialists from "@app/tenants/Clinic/sections/Specialists/pages/specialists";
import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <Specialists />;
};

export default page;
