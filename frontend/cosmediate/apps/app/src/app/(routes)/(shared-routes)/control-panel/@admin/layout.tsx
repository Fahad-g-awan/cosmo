import { ManagementLayout } from "@app/layout/management";

import SectionLayout from "@app/layout/section/SectionLayout";

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ManagementLayout tenant="admin">
      <SectionLayout>{children}</SectionLayout>
    </ManagementLayout>
  );
}
