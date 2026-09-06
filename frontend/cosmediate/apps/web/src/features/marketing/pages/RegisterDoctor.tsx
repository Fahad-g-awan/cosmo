"use client";

import React, { useMemo } from "react";

import { useTranslations } from "@cosmediate/i18n/client";

import { createFormStore, FormProvider } from "@cosmediate/form-core";
import { cn } from "@cosmediate/ui/lib/utils";

import {
  createRegisterDoctorFormSchema,
  defaultRegisterDoctorFormValues,
} from "../schemas/registerDoctorFormSchema";
import { RegisterDoctorForm } from "../components/forms/RegisterDoctorForm";
import RegistrationBenefits from "../components/RegistrationBenefits";
import Layout from "../components/Layout";

const RegisterDoctor = () => {
  const register = useTranslations("marketing").registerDoctor;
  const forms = useTranslations("forms");
  const store = useMemo(
    () =>
      createFormStore({
        initialValues: defaultRegisterDoctorFormValues,
        schema: createRegisterDoctorFormSchema(forms.validation),
      }),
    [forms]
  );

  return (
    <Layout title={register.pageTitle} path="/partners/register/doctor">
      <div
        className={cn(
          "w-full grid grid-cols-2 max-lg:grid-cols-1 items-start justify-center gap-8"
        )}
      >
        <RegistrationBenefits registrationType={"doctor"} />

        <div className="w-full flex items-start justify-center">
          <FormProvider store={store}>
            <RegisterDoctorForm />
          </FormProvider>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterDoctor;
