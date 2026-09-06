"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ButtonLoader,
  Toaster,
  Button,
  Input,
  Label,
  InfoMessage,
} from "@cosmediate/ui";

import { cn } from "@cosmediate/ui/lib/utils";

import {
  applyAuthFormError,
  applyClientValidationError,
} from "@auth/lib/auth-form-errors";
import FieldContainer from "@auth/components/FieldContainer";
import { useForgotPassword } from "@cosmediate/auth/index";
import { useTranslations } from "@cosmediate/i18n/client";
import { parseError } from "@auth/lib/utils";

const ForgotPasswordForm = () => {
  const auth = useTranslations("auth");
  const [formData, setFormData] = useState({ email: "" });
  const [formErrors, setFormErrors] = useState({ email: "" });

  const { handleForgotPassword, isProcessing } = useForgotPassword();

  const handleFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || formData.email.trim() === "") {
      setFormErrors({ email: auth.validation.emailInvalid });
      applyClientValidationError(auth);
      return;
    }

    try {
      const result = await handleForgotPassword(formData.email);

      if (result.success) {
        if (result.status === "CONF_CODE_SENT") {
          Toaster(auth.toasts.resetCodeSent, "success");
          window.location.href = "/reset-password";
        }
        return;
      }

      console.log(
        "[ForgotPasswordForm] Auth error",
        result.error,
        result.message,
      );
      applyAuthFormError(
        "forgot-password",
        {
          error: result.error,
          message: result.message,
          details: "details" in result ? result.details : undefined,
        },
        setFormErrors,
        auth,
      );
    } catch (error: unknown) {
      console.log("[ForgotPasswordForm] Error", error);
      applyAuthFormError(
        "forgot-password",
        { message: parseError(error) },
        setFormErrors,
        auth,
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4")}>
      <FieldContainer>
        <Label>{auth.labels.email}</Label>
        <Input
          type="text"
          value={formData.email}
          name="email"
          onChange={handleFormData}
          placeholder={auth.placeholders.enterEmail}
          className={cn("py-3 text-sm", formErrors.email && "text-danger")}
        />
        <InfoMessage variant="error" message={formErrors.email} size="sm" />
      </FieldContainer>

      <div className="w-full flex flex-col items-center justify-center gap-3">
        <Button
          disabled={isProcessing}
          type="submit"
          className={cn("w-full py-3")}
        >
          {isProcessing ? <ButtonLoader /> : auth.buttons.sendResetCode}
        </Button>

        <Button variant={"outline"} className="w-full py-3">
          <Link
            href={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/signin"}
            className="w-full"
          >
            {auth.buttons.backToLogin}
          </Link>
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
