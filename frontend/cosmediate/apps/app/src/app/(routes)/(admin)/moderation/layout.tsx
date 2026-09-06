import type { Metadata } from "next";

import { dashboardSectionTitle } from "@cosmediate/seo";
import SectionLayout from "@app/layout/section/SectionLayout";

export const metadata: Metadata = dashboardSectionTitle("moderation");

export default function ModerationSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionLayout>{children}</SectionLayout>;
}
