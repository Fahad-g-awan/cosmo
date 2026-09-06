import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { readIdpSessionSnapshot } from "@cosmediate/config";

/**
 * Validates if the user is authenticated.
 * If the user is authenticated, redirects to the dashboard.
 */
export const validateAuthSession = async () => {
  const cookiesStore = await cookies();
  const session = readIdpSessionSnapshot((name) =>
    cookiesStore.get(name)?.value
  );

  if (session) {
    redirect("/dashboard");
  }
};
