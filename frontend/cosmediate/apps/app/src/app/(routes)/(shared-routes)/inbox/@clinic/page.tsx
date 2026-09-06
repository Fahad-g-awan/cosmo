import ClinicInbox from "@app/clinic/sections/ClinicInbox";
import React from "react";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

const page = async () => {
  await validateRoleForClinicRoutes();
  return <ClinicInbox />;
};

export default page;
