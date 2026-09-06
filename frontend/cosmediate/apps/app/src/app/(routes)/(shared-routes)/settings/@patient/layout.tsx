import React from "react";

import { PanelHeaderProvider } from "@app/layout/management/context";
import SectionLayout from "@app/layout/section/SectionLayout";
import PatientLayout from "@app/layout/patient";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <PatientLayout>
      <PanelHeaderProvider>
        <SectionLayout>{children}</SectionLayout>
      </PanelHeaderProvider>
    </PatientLayout>
  );
};

export default layout;
