import PatientInbox from "@app/patient/tabs/patient-inbox";
import { validateRoleForPatientRoutes } from "@app/lib/routing/roleRouting.server";

export default async function InboxPage() {
  await validateRoleForPatientRoutes();
  return <PatientInbox />;
}
