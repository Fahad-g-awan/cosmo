"use client";

import React from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { ButtonLoader } from "@cosmediate/ui";
import { Button } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

interface FormSubmitButtonProps {
  isSubmitting: boolean;
  className?: string;
}

const FormSubmitButton = ({
  isSubmitting,
  className,
}: FormSubmitButtonProps) => {
  const forms = useTranslations("forms");

  return (
    <Button
      disabled={isSubmitting}
      type="submit"
      className={cn(
        "w-full h-12 rounded-xl font-bold",
        isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      {isSubmitting ? <ButtonLoader /> : forms.submit}
    </Button>
  );
};

export default FormSubmitButton;
