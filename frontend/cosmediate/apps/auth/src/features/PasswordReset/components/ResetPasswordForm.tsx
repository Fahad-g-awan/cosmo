"use client";

import { useEffect, useState } from "react";

import {
  ButtonLoader,
  InfoMessage,
  Toaster,
  Button,
  Input,
  Label,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import {
  useResetPassword,
  useResendCooldown,
  useResendForgotPasswordCode,
} from "@cosmediate/auth";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import {
  applyAuthFormError,
  applyClientValidationError,
} from "@auth/lib/auth-form-errors";
import FieldContainer from "@auth/components/FieldContainer";
import { useTranslations } from "@cosmediate/i18n/client";
import { parseError } from "@auth/lib/utils";
import { isStrongPassword } from "@auth-core/lib/auth.utils";

interface Form {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

const defaultFormValues: Form = {
  code: "",
  newPassword: "",
  confirmPassword: "",
};

interface ResetPasswordFormProps {
  setStatus: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

const ResetPasswordForm = ({ setStatus }: ResetPasswordFormProps) => {
  const auth = useTranslations("auth");
  const [formErrors, setFormErrors] = useState<Form>(defaultFormValues);
  const [formData, setFormData] = useState<Form>(defaultFormValues);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { handleResetPassword, isProcessing } = useResetPassword();
  const { handleResendForgotPasswordCode, isProcessing: isResending } =
    useResendForgotPasswordCode();
  const {
    secondsLeft,
    isOnCooldown,
    shouldShowStrongMessage,
    beginCooldown,
    startCooldown,
    reset: resetCooldown,
  } = useResendCooldown({ storageKey: "auth_forgot_password_resend" });

  const handleFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateFormData = (): boolean => {
    const errors: Form = {
      code: "",
      newPassword: "",
      confirmPassword: "",
    };
    let foundErrors = false;

    if (
      !formData.code ||
      formData.code.toLowerCase() === "" ||
      formData.code.length < 6 ||
      !/^\d+$/.test(formData.code)
    ) {
      errors.code = auth.errors.resetPassword.invalidCode;
      foundErrors = true;
    }

    if (!formData.newPassword || formData.newPassword.trim().length < 8) {
      errors.newPassword = auth.validation.passwordMinLength;
      foundErrors = true;
    } else if (!isStrongPassword(formData.newPassword)) {
      errors.newPassword = auth.validation.passwordPolicy;
      foundErrors = true;
    }

    if (!formData.confirmPassword || formData.confirmPassword.trim() === "") {
      errors.confirmPassword = auth.validation.passwordRequired;
      foundErrors = true;
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = auth.validation.passwordsMismatch;
      foundErrors = true;
    }

    if (foundErrors) {
      setFormErrors(errors);
      applyClientValidationError(auth);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFormData()) return;

    try {
      const result = await handleResetPassword(
        formData.code,
        formData.newPassword,
      );

      if (result.success) {
        Toaster(auth.toasts.passwordResetSuccess, "success");
        resetCooldown();
        setStatus(true);
        return;
      }

      console.log(
        "[ResetPasswordForm] Auth error",
        result.error,
        result.message,
      );
      // Stay on the form for recoverable errors (field + toast / redirect).
      // Do not flip to RejectStatus — that page was wrongly shown for blank/invalid fields.
      applyAuthFormError("reset-password", result, setFormErrors, auth);
    } catch (error: unknown) {
      console.log("[ResetPasswordForm] Error", error);
      applyAuthFormError(
        "reset-password",
        { message: parseError(error) },
        setFormErrors,
        auth,
      );
    }
  };

  const handleResend = async () => {
    if (isOnCooldown || isResending) return;
    try {
      setFormErrors({
        ...formErrors,
        code: "",
      });

      const result = await handleResendForgotPasswordCode();
      if (result?.success) {
        startCooldown();
        Toaster(
          auth.toasts.resetCodeResent,
          "success",
          auth.toasts.resetCodeResentHint,
        );
      }
    } catch (error: unknown) {
      console.log("[ResetPasswordForm] Resend error", error);
      const errorMsg = parseError(error);
      Toaster(
        auth.toasts.resendFailed,
        "error",
        errorMsg || auth.toasts.resendFailedHint,
      );
    }
  };

  useEffect(() => {
    beginCooldown();
  }, [beginCooldown]);

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4")}>
      <FieldContainer>
        <Label>{auth.labels.verificationCode}</Label>
        <Input
          type="text"
          placeholder={auth.placeholders.resetCode}
          value={formData.code}
          className="py-3 text-sm"
          name="code"
          onChange={handleFormData}
        />
        <InfoMessage variant="error" size="sm" message={formErrors.code} />
        <div className={cn("w-full flex flex-col items-start gap-1 pt-1")}>
          <div
            className={cn(
              "w-full flex items-center justify-start gap-1 text-xs",
            )}
          >
            {!isResending && (
              <span className="text-500">
                {auth.confirmSignup.didntGetCode}
              </span>
            )}
            <button
              type="button"
              onClick={handleResend}
              disabled={isOnCooldown || isResending || isProcessing}
              className={cn(
                "font-medium underline-offset-2",
                isOnCooldown || isResending || isProcessing
                  ? "text-400 cursor-not-allowed"
                  : "text-primary-accent hover:underline cursor-pointer",
              )}
            >
              {isResending
                ? auth.buttons.sending
                : isOnCooldown
                  ? auth.buttons.resendIn(secondsLeft)
                  : auth.buttons.resendCode}
            </button>
          </div>
          {shouldShowStrongMessage && (
            <InfoMessage
              variant="warning"
              message={auth.confirmSignup.tooManyAttempts}
              size="sm"
            />
          )}
        </div>
      </FieldContainer>

      <FieldContainer>
        <Label>{auth.labels.newPassword}</Label>
        <div
          className={cn(
            "w-full flex items-center justify-start rounded-lg ",
            "focus-within:border-primary-accent border border-stroke",
          )}
        >
          <Input
            type={passwordVisible ? "text" : "password"}
            placeholder={auth.placeholders.newPassword}
            value={formData.newPassword}
            className={cn("w-full border-none text-sm py-3")}
            name="newPassword"
            onChange={handleFormData}
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="text-500"
          >
            {passwordVisible ? (
              <AiOutlineEyeInvisible className="size-5" />
            ) : (
              <AiOutlineEye className="size-5" />
            )}
          </Button>
        </div>
        <InfoMessage
          variant="error"
          size="sm"
          message={formErrors.newPassword}
        />
      </FieldContainer>

      <FieldContainer>
        <Label>{auth.resetPassword.confirmPasswordLabel}</Label>
        <div
          className={cn(
            "w-full flex items-center justify-start rounded-lg ",
            "focus-within:border-primary-accent border border-stroke",
          )}
        >
          <Input
            type={passwordVisible ? "text" : "password"}
            placeholder={auth.placeholders.confirmPassword}
            value={formData.confirmPassword}
            className={cn("w-full border-none text-sm py-3")}
            name="confirmPassword"
            onChange={handleFormData}
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="text-500"
          >
            {passwordVisible ? (
              <AiOutlineEyeInvisible className="size-5" />
            ) : (
              <AiOutlineEye className="size-5" />
            )}
          </Button>
        </div>
        <InfoMessage
          variant="error"
          size="sm"
          message={formErrors.confirmPassword}
        />
      </FieldContainer>

      <div className="w-full flex flex-col items-center justify-center gap-3">
        <Button
          disabled={isProcessing}
          type="submit"
          className={cn("w-full py-3")}
        >
          {isProcessing ? <ButtonLoader /> : auth.buttons.resetPassword}
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
