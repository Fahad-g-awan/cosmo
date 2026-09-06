import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";

import RoleSwitcher from "@app/components/routing/RoleSwitcher";
import { getRole } from "@app/lib/routing/roleRouting.server";

export const metadata: Metadata = dashboardSectionTitle("inbox");

export default async function InboxLayout({
  patient,
  clinic,
}: {
  patient: React.ReactNode;
  clinic: React.ReactNode;
}) {
  const role = await getRole();
  if (role === "admin") {
    redirect("/clinic-management");
  }
  return <RoleSwitcher role={role} patient={patient} clinic={clinic} />;
}
