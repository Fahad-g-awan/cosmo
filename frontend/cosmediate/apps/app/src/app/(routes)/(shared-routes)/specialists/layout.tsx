import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";

import RoleSwitcher from "@app/components/routing/RoleSwitcher";
import { getRole } from "@app/lib/routing/roleRouting.server";

export const metadata: Metadata = dashboardSectionTitle("specialists");

export default async function SpecialistsLayout({
  clinic,
  admin,
}: {
  clinic: React.ReactNode;
  admin: React.ReactNode;
}) {
  const role = await getRole();
  if (role === "patient") {
    redirect("/appointments");
  }
  return <RoleSwitcher role={role} clinic={clinic} admin={admin} />;
}
