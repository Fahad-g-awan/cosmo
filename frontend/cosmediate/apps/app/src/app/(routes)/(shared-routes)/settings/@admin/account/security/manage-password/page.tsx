import { Suspense } from "react";

import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import ManagePassword from "@app/tenants/Admin/sections/Settings/pages/account/security/managePassword";
import { PasswordFormLoader } from "@cosmediate/ui";

const page = async () => {
  await validateRoleForAdminRoutes();
  return (
    <Suspense fallback={<PasswordFormLoader />}>
      <ManagePassword />
    </Suspense>
  );
};

export default page;
