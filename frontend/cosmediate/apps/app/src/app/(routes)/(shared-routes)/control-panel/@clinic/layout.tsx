import { getRole } from "@app/lib/routing/roleRouting.server";

import { ManagementLayout } from "@app/layout/management";

import SectionLayout from "@app/layout/section/SectionLayout";

export default async function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getRole();
  const tenant = role === "specialist" ? "specialist" : "clinic";

  return (
    <ManagementLayout tenant={tenant}>
      <SectionLayout>{children}</SectionLayout>
    </ManagementLayout>
  );
}
