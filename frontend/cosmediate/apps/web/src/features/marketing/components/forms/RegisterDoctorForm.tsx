"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import {
  useFormValidate,
  useFormValues,
  useFormReset,
  useFormSubmitting,
} from "@cosmediate/form-core";
import {
  ControlledTextField,
  ControlledTextareaField,
  FormGrid,
} from "@cosmediate/form-ui";
import { createLeadApi } from "@cosmediate/api";
import { Toaster } from "@cosmediate/ui";

import type { RegisterDoctorFormValues } from "../../schemas/registerDoctorFormSchema";
import { useRecaptchaV3 } from "../../hooks/useRecaptchaV3";
import PrivacyPolicy from "./shared/PrivacyPolicy";
import SubmitButton from "./shared/SubmitButton";

export const RegisterDoctorForm = () => {
  const forms = useTranslations("forms");
  const [isSubmitting, setIsSubmitting] = useFormSubmitting();
  const values = useFormValues<RegisterDoctorFormValues>();
  const reset = useFormReset<RegisterDoctorFormValues>();
  const validate = useFormValidate();

  const { executeRecaptcha } = useRecaptchaV3();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validate()) {
      setIsSubmitting(false);
      Toaster(forms.toasts.requiredFields, "error");
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha("register_doctor_submit");

      if (!recaptchaToken) {
        Toaster(forms.toasts.captchaFailed, "error");
        setIsSubmitting(false);
        return;
      }

      const response = await createLeadApi({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        subject: values.subject,
        message: values.message,
        phone: values.phone,
        registrationNumber: values.registrationNumber,
        type: "DOCTOR",
        source: "REGISTER_DOCTOR_FORM",
        recaptchaToken,
      });

      if (response?.success) {
        Toaster(forms.toasts.success, "success");
        reset();
      } else {
        throw new Error("Failed to submit form");
      }
    } catch (error) {
      Toaster(forms.toasts.submitError, "error");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col items-center justify-start gap-6"
    >
      <FormGrid columns={2}>
        <ControlledTextField
          labelClassName="text-600"
          path="firstName"
          label={forms.labels.firstName}
          placeholder={forms.placeholders.firstName}
          required
        />
        <ControlledTextField
          labelClassName="text-600"
          path="lastName"
          label={forms.labels.surname}
          placeholder={forms.placeholders.surname}
          required
        />
        <ControlledTextField
          labelClassName="text-600"
          path="email"
          label={forms.labels.email}
          placeholder={forms.placeholders.email}
          type="email"
          required
        />
        <ControlledTextField
          labelClassName="text-600"
          path="phone"
          label={forms.labels.phone}
          placeholder={forms.placeholders.phone}
          type="tel"
          required
        />
      </FormGrid>

      <ControlledTextField
        labelClassName="text-600"
        path="registrationNumber"
        label={forms.labels.registrationNumber}
        placeholder={forms.placeholders.registrationNumber}
        required
      />

      <ControlledTextField
        labelClassName="text-600"
        path="subject"
        label={forms.labels.subject}
        placeholder={forms.placeholders.subject}
        required
      />

      <ControlledTextareaField
        labelClassName="text-600"
        path="message"
        label={forms.labels.message}
        placeholder={forms.placeholders.message}
        required
      />

      <div className="w-full flex flex-col items-center justify-center gap-6 max-sm:gap-4">
        <PrivacyPolicy />
        <SubmitButton isSubmitting={isSubmitting} />
      </div>
    </form>
  );
};
