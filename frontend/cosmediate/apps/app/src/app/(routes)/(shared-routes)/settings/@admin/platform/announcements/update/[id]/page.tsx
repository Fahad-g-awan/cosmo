import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import UpdateAnnouncement from "@app/tenants/Admin/sections/Settings/pages/platform/announcements/UpdateAnnouncement";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <UpdateAnnouncement />;
};

export default page;
