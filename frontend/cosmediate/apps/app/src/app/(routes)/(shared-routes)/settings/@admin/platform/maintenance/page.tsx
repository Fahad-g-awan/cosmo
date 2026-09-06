import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import MaintenanceSettings from "@app/tenants/Admin/sections/Settings/pages/platform/maintenance";

const page = async () => {
  await validateRoleForAdminRoutes();
  return <MaintenanceSettings />;
};

export default page;
