import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";

import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import Reviews from "@app/clinic/sections/Reviews";

export const metadata: Metadata = dashboardSectionTitle("reviews");

const page = async () => {
  await validateRoleForClinicRoutes();
  return <Reviews />;
};

export default page;
