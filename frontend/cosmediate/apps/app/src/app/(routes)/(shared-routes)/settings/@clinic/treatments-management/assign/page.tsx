import TreatmentAssignments from "@app/clinic/sections/Settings/pages/Treatments/TreatmentAssignments";
import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";

export default async function Page() {
  await validateRoleForClinicRoutes();
  return <TreatmentAssignments />;
}
