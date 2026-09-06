import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";
import { getRole } from "@app/lib/routing/roleRouting.server";

export const metadata: Metadata = dashboardSectionTitle("appointments");

export default async function AppointmentsLayout({
  patient,
}: {
  patient: React.ReactNode;
}) {
  const role = await getRole();

  if (role === "admin") {
    redirect("/clinic-management");
  }

  return patient;
}
