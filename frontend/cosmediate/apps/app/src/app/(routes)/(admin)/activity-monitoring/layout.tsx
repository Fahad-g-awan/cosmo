import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";
import SectionLayout from "@app/layout/section/SectionLayout";

export const metadata: Metadata = dashboardSectionTitle("activityMonitoring");

export default function ActivityMonitoringSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionLayout>{children}</SectionLayout>;
}
