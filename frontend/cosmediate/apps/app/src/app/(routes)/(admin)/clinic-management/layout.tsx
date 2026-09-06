import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";
import SectionLayout from "@app/layout/section/SectionLayout";

export const metadata: Metadata = dashboardSectionTitle("clinicManagement");

export default function ClinicManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionLayout>{children}</SectionLayout>;
}
