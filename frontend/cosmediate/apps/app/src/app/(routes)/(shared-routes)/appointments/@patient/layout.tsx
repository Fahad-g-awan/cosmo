import React from "react";

import { PanelHeaderProvider } from "@app/layout/management/context";
import SectionLayout from "@app/layout/section/SectionLayout";
import PatientLayout from "@app/layout/patient";

export default async function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PatientLayout>
      <PanelHeaderProvider>
        <SectionLayout>{children}</SectionLayout>
      </PanelHeaderProvider>
    </PatientLayout>
  );
}
