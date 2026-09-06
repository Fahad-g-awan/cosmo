"use client";

import React, { useState } from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { Button, Input, Toaster } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

interface FormValues {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const ContactForm = () => {
  const profile = useTranslations("profile");
  const [formData, setFormData] = useState<FormValues>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = profile.contact.validation.nameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = profile.contact.validation.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = profile.contact.validation.emailInvalid;
    }

    if (!formData.message.trim()) {
      newErrors.message = profile.contact.validation.messageRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      //api

      Toaster(profile.contact.successToast);
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="w-full h-full px-6 py-6 bg-primary-accent-lite rounded-2xl max-sm:rounded-lg max-sm:px-4 max-sm:py-5">
      <form onSubmit={handleSubmit} className="flex gap-3 flex-col">
        <h1 className="font-bold text-xl leading-6 text-700">
          {profile.contact.title}
        </h1>

        <Input
          type="text"
          name="name"
          placeholder={profile.contact.name}
          value={formData.name}
          onChange={handleChange}
          className={cn(
            "w-full bg-white rounded-xl px-4 py-5 outline-none text-sm leading-5 placeholder:text-500 text-800 border transition-colors duration-300",
            errors.name
              ? "border-danger"
              : "border-stroke hover:border-primary-accent",
          )}
        />
        {errors.name && <p className="text-danger text-sm">{errors.name}</p>}

        <Input
          type="email"
          name="email"
          placeholder={profile.contact.email}
          value={formData.email}
          onChange={handleChange}
          className={cn(
            "w-full bg-white rounded-xl px-4 py-5 outline-none text-sm leading-5 placeholder:text-500 text-800 border transition-colors duration-300",
            errors.email
              ? "border-danger"
              : "border-stroke hover:border-primary-accent",
          )}
        />
        {errors.email && <p className="text-danger text-sm">{errors.email}</p>}

        <textarea
          name="message"
          rows={6}
          placeholder={profile.contact.message}
          value={formData.message}
          onChange={handleChange}
          className={cn(
            "resize-none w-full bg-white rounded-xl px-4 py-4 outline-none text-sm leading-5 placeholder:text-500 text-800 border transition-colors duration-300",
            errors.message
              ? "border-danger"
              : "border-stroke hover:border-primary-accent",
          )}
        />
        {errors.message && (
          <p className="text-danger text-sm">{errors.message}</p>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            className={cn(
              "w-full flex justify-center items-center font-bold rounded-xl text-[14px] leading-4 py-4",
            )}
          >
            {profile.contact.send}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
