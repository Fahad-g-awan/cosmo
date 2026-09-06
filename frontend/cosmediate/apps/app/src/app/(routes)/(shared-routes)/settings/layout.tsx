import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";

import RoleSwitcher from "@app/components/routing/RoleSwitcher";
import { getRole } from "@app/lib/routing/roleRouting.server";

export const metadata: Metadata = dashboardSectionTitle("settings");

export default async function SettingsLayout({
  patient,
  clinic,
  admin,
}: {
  patient: React.ReactNode;
  clinic: React.ReactNode;
  admin: React.ReactNode;
}) {
  const role = await getRole();
  return (
    <RoleSwitcher role={role} patient={patient} clinic={clinic} admin={admin} />
  );
}
