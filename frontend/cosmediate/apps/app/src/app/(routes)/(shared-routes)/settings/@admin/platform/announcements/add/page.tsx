import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import AddAnnouncement from "@app/tenants/Admin/sections/Settings/pages/platform/announcements/AddAnnouncement";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <AddAnnouncement />;
};

export default page;
