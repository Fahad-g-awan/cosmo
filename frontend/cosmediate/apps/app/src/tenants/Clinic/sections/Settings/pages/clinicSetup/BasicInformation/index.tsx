"use client";

import React from "react";

import { ClinicFormInner } from "./components/ClinicFormInner";
import ClinicSetupFormPage from "../ClinicSetupFormPage";

const ClinicSetupBasicInformation = () => {
  return (
    <ClinicSetupFormPage>
      {(formProps) => <ClinicFormInner {...formProps} submitLabel="Update" />}
    </ClinicSetupFormPage>
  );
};

export default ClinicSetupBasicInformation;
