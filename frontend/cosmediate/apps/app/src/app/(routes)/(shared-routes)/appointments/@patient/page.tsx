import Appointments from "@app/patient/tabs/appointments/pages/appointments";
import { validateRoleForPatientRoutes } from "@app/lib/routing/roleRouting.server";

export default async function AppointmentsPage() {
  await validateRoleForPatientRoutes();
  return <Appointments />;
}
