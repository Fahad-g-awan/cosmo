"use client";

import React, { useMemo } from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { createFormStore, FormProvider } from "@cosmediate/form-core";
import { cn } from "@cosmediate/ui/lib/utils";

import {
  createContactFormSchema,
  defaultContactFormValues,
} from "../schemas/contactFormSchema";
import { ContactForm } from "../components/forms/ContactForm";
import { EntityMap } from "@web/components/EntityMap";
import ContactInfo from "../components/ContactInfo";
import Layout from "../components/Layout";

const Contact = () => {
  const contact = useTranslations("marketing").contact;
  const forms = useTranslations("forms");
  const formStore = useMemo(
    () =>
      createFormStore({
        initialValues: defaultContactFormValues,
        schema: createContactFormSchema(forms.validation),
      }),
    [forms]
  );

  return (
    <Layout title={contact.pageTitle} path="/contact">
      <h1 className="w-full text-left text-[24px] leading-9 text-900 font-medium max-sm:font-normal max-sm:leading-[30px]">
        {contact.introHeading}
      </h1>

      <div
        className={cn(
          "w-full flex max-lg:flex-col items-start justify-center gap-8",
          "max-lg:gap-6 max-sm:gap-3"
        )}
      >
        <div className="w-[50%] max-lg:w-full flex flex-col items-center justify-start gap-5">
          <div className="w-full flex flex-col items-center justify-start gap-4">
            <h1
              className={cn(
                "w-full text-left text-700 text-3xl leading-[38.4px] font-bold max-sm:text-[20px] max-sm:leading-[24px]"
              )}
            >
              {contact.sectionHeading}
            </h1>
            <p
              className={cn(
                "text-900 text-xl leading-[30px] max-sm:text-[14px] max-sm:leading-[24px]"
              )}
            >
              {contact.sectionBody}
            </p>
          </div>

          <ContactInfo />

          <EntityMap
            locations={[
              { lat: 53.11626768459376, lon: 4.811020392068996, id: "1" },
            ]}
            mapZoom={10}
            mapHeight={370}
            mapType="blue"
          />
        </div>

        <div
          className={cn(
            "w-[50%] max-lg:w-full flex items-start justify-center"
          )}
        >
          <FormProvider store={formStore}>
            <ContactForm />
          </FormProvider>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
