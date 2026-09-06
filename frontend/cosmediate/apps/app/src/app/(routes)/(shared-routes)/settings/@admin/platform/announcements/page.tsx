import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import Announcements from "@app/tenants/Admin/sections/Settings/pages/platform/announcements";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <Announcements />;
};

export default page;
