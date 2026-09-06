import { Suspense } from "react";

import { validateRoleForPatientRoutes } from "@app/lib/routing/roleRouting.server";
import ManagePassword from "@app/patient/tabs/settings/pages/security/manage-password";
import { PasswordFormLoader } from "@cosmediate/ui";

export default async function ManagePasswordPage() {
  await validateRoleForPatientRoutes();
  return (
    <Suspense fallback={<PasswordFormLoader />}>
      <ManagePassword />
    </Suspense>
  );
}
