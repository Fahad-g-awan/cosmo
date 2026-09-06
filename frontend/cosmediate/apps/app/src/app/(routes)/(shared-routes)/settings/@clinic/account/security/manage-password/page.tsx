import { Suspense } from "react";

import { validateRoleForClinicRoutes } from "@app/lib/routing/roleRouting.server";
import ManagePassword from "@app/tenants/Clinic/sections/Settings/pages/account/security/ManagePassword";
import { PasswordFormLoader } from "@cosmediate/ui";

const page = async () => {
  await validateRoleForClinicRoutes();
  return (
    <Suspense fallback={<PasswordFormLoader />}>
      <ManagePassword />
    </Suspense>
  );
};

export default page;
