"use client";

import React from "react";

import { ClinicFormInner } from "./components/ClinicFormInner";
import ClinicSetupFormPage from "../ClinicSetupFormPage";

const ClinicSetupFaqs = () => {
  return (
    <ClinicSetupFormPage>
      {(formProps) => <ClinicFormInner {...formProps} submitLabel="Update" />}
    </ClinicSetupFormPage>
  );
};

export default ClinicSetupFaqs;
