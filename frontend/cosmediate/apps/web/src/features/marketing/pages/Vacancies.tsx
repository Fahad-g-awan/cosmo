"use client";

import React, { useMemo } from "react";

import { useTranslations } from "@cosmediate/i18n/client";

import { createFormStore, FormProvider } from "@cosmediate/form-core";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { cn } from "@cosmediate/ui/lib/utils";

import {
  createContactFormSchema,
  defaultContactFormValues,
} from "../schemas/contactFormSchema";
import VacancyRequirementsSection from "../components/vacancies/VacancyRequirementsSection";
import VacancyDetailsSection from "../components/vacancies/VacancyDetailsSection";
import HeaderSection from "../components/vacancies/HeaderSection";
import { ContactForm } from "../components/forms/ContactForm";
import { EntityMap } from "@web/components/EntityMap";
import ContactInfo from "../components/ContactInfo";
import Layout from "../components/Layout";

const Vacancies = () => {
  const vacancies = useTranslations("marketing").vacancies;
  const forms = useTranslations("forms");
  const store = useMemo(
    () =>
      createFormStore({
        initialValues: defaultContactFormValues,
        schema: createContactFormSchema(forms.validation),
      }),
    [forms]
  );
  const { isTabletView, isMobileView } = useWindowWidth();

  return (
    <Layout title={vacancies.pageTitle} path="/vacancies">
      <HeaderSection />
      <VacancyDetailsSection />
      <VacancyRequirementsSection />

      <div className="w-full grid grid-cols-2 max-lg:grid-cols-1 items-start justify-start gap-8 max-lg:gap-6 max-sm:gap-4">
        <div
          className={cn(
            "w-full h-full flex flex-col items-start justify-start gap-8"
          )}
        >
          <ContactInfo showTitle />

          <EntityMap
            locations={[
              { lat: 53.11626768459376, lon: 4.811020392068996, id: "1" },
            ]}
            mapZoom={10}
            mapHeight={isTabletView || isMobileView ? 425 : undefined}
            mapType="blue"
          />
        </div>

        <div className={cn("w-full h-full flex items-start justify-center")}>
          <FormProvider store={store}>
            <ContactForm />
          </FormProvider>
        </div>
      </div>
    </Layout>
  );
};

export default Vacancies;
