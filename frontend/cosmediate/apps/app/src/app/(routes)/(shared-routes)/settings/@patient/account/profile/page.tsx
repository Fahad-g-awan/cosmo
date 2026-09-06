import { validateRoleForPatientRoutes } from "@app/lib/routing/roleRouting.server";
import Profile from "@app/patient/tabs/settings/pages/account/profile";

export default async function ProfilePage() {
  await validateRoleForPatientRoutes();
  return <Profile />;
}
