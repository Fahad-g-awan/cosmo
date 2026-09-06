"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ButtonLoader,
  InfoMessage,
  Toaster,
  Button,
  Label,
  Input,
} from "@cosmediate/ui";
import {
  useConfirmSignup,
  useResendCooldown,
  useResendSignupCode,
} from "@cosmediate/auth";
import { cn } from "@cosmediate/ui/lib/utils";

import {
  applyAuthFormError,
  applyClientValidationError,
} from "@auth/lib/auth-form-errors";
import FieldContainer from "@auth/components/FieldContainer";
import { useTranslations } from "@cosmediate/i18n/client";
import { parseError } from "@auth/lib/utils";

const ConfirmSignupForm = () => {
  const auth = useTranslations("auth");
  const [formData, setFormData] = useState({ code: "" });
  const [formErrors, setFormErrors] = useState({ code: "" });

  const { handleConfirmSignup, isProcessing } = useConfirmSignup();
  const { handleResendSignupCode, isProcessing: isResending } =
    useResendSignupCode();
  const {
    secondsLeft,
    isOnCooldown,
    shouldShowStrongMessage,
    beginCooldown,
    startCooldown,
    reset: resetCooldown,
  } = useResendCooldown({ storageKey: "auth_confirm_signup_resend" });
  const router = useRouter();

  const handleFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateFormData = (): boolean => {
    if (!formData.code || formData.code.trim() === "") {
      setFormErrors({ code: auth.validation.codeRequired });
      applyClientValidationError(auth);
      return false;
    }

    if (formData.code.length < 6 || !/^\d+$/.test(formData.code)) {
      setFormErrors({ code: auth.errors.confirmSignup.invalidCode });
      applyClientValidationError(auth);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFormData()) return;

    try {
      const result = await handleConfirmSignup(formData.code);

      if (result.success) {
        resetCooldown();
        if (result.redirectTo) {
          Toaster(auth.toasts.emailVerified, "success");
          window.location.href = result.redirectTo;
          return;
        }
        Toaster(
          auth.toasts.emailVerifiedSignIn,
          "success",
          auth.toasts.emailVerifiedSignInHint,
        );
        router.push("/signin");
        return;
      }

      console.log(
        "[ConfirmSignupForm] Auth error",
        result.error,
        result.message,
      );
      applyAuthFormError("confirm-signup", result, setFormErrors, auth);
    } catch (error: unknown) {
      console.log("[ConfirmSignupForm] Error", error);
      applyAuthFormError(
        "confirm-signup",
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

      const result = await handleResendSignupCode();

      if (result?.success) {
        setFormData({ code: "" });
        startCooldown();
        Toaster(
          auth.toasts.resendSuccess,
          "success",
          auth.toasts.resendSuccessHint,
        );
      }
    } catch (error: unknown) {
      console.log("[ConfirmSignupForm] Resend error", error);
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
    <form
      onSubmit={handleSubmit}
      className={cn("w-full flex flex-col items-start justify-center gap-3")}
    >
      <FieldContainer>
        <Label>{auth.labels.verificationCode}</Label>
        <Input
          type="text"
          value={formData.code}
          name="code"
          onChange={handleFormData}
          placeholder={auth.placeholders.verificationCode}
          className={cn("py-2 text-sm")}
        />
        <InfoMessage variant="error" size="sm" message={formErrors.code} />
      </FieldContainer>

      <Button
        disabled={isProcessing}
        type="submit"
        className={cn("w-full py-2.5")}
      >
        {isProcessing ? <ButtonLoader /> : auth.buttons.verifyEmail}
      </Button>

      <div
        className={cn(
          "w-full flex flex-col items-center justify-center gap-1.5 pt-1",
        )}
      >
        <div
          className={cn(
            "w-full flex items-center justify-center gap-1 text-xs",
          )}
        >
          {!isResending && (
            <span className="text-500">{auth.confirmSignup.didntGetCode}</span>
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
    </form>
  );
};

export default ConfirmSignupForm;
