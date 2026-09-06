import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";
import SectionLayout from "@app/layout/section/SectionLayout";

export const metadata: Metadata = dashboardSectionTitle("crm");

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout>{children}</SectionLayout>;
}
