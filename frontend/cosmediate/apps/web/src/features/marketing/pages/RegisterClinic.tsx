"use client";

import React, { useMemo } from "react";

import { useTranslations } from "@cosmediate/i18n/client";

import { createFormStore, FormProvider } from "@cosmediate/form-core";
import { cn } from "@cosmediate/ui/lib/utils";

import {
  createRegisterClinicFormSchema,
  defaultRegisterClinicFormValues,
} from "../schemas/registerClinicFormSchema";
import { RegisterClinicForm } from "../components/forms/RegisterClinicForm";
import RegistrationBenefits from "../components/RegistrationBenefits";
import Layout from "../components/Layout";

const RegisterClinic = () => {
  const register = useTranslations("marketing").registerClinic;
  const forms = useTranslations("forms");
  const store = useMemo(
    () =>
      createFormStore({
        initialValues: defaultRegisterClinicFormValues,
        schema: createRegisterClinicFormSchema(forms.validation),
      }),
    [forms]
  );

  return (
    <Layout title={register.pageTitle} path="/partners/register/clinic">
      <div
        className={cn(
          "w-full grid grid-cols-2 max-lg:grid-cols-1 items-start justify-center gap-8"
        )}
      >
        <RegistrationBenefits registrationType={"clinic"} />

        <div className={cn("w-full flex items-start justify-center")}>
          <FormProvider store={store}>
            <RegisterClinicForm />
          </FormProvider>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterClinic;
