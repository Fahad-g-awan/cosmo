import Profile from "@app/tenants/Clinic/sections/Settings/pages/account/profile";
import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <Profile />;
};

export default page;
