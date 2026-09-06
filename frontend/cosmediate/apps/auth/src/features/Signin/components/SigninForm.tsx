"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ButtonLoader,
  InfoMessage,
  Toaster,
  Button,
  Input,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useSignIn } from "@cosmediate/auth";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { RiKey2Line } from "react-icons/ri";
import { User } from "lucide-react";

import {
  applyAuthFormError,
  applyClientValidationError,
} from "@auth/lib/auth-form-errors";
import { useTranslations } from "@cosmediate/i18n/client";
import { parseError } from "@auth/lib/utils";

interface FormData {
  email: string;
  password: string;
}

const SignInForm = () => {
  const auth = useTranslations("auth");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<FormData>({
    email: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { handleSignin, isProcessing } = useSignIn();

  const handleFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateFormData = (): boolean => {
    const errors = {
      email: "",
      password: "",
    };
    let foundErrors = false;

    if (!formData.email) {
      errors.email = auth.validation.emailRequired;
      foundErrors = true;
    }

    if (!formData.password) {
      errors.password = auth.validation.passwordRequired;
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
      const result = await handleSignin({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        if (result.message) Toaster(result.message, "success");
        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        }
        return;
      }

      console.log("[SignInForm] Auth error", result.error, result.message);
      applyAuthFormError("signin", result, setFormErrors, auth);
    } catch (error: unknown) {
      console.log("[SignInForm] Error", error);
      applyAuthFormError(
        "signin",
        { message: parseError(error) },
        setFormErrors,
        auth,
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "w-full flex flex-col items-center justify-center gap-3 mb-6",
      )}
    >
      {/* Email */}
      <div
        className={cn(
          "w-full flex items-center justify-start rounded-lg px-2.5",
          "focus-within:border-primary-accent border border-stroke",
          formErrors.email && "text-danger",
        )}
      >
        <User className="size-5 text-800" />
        <Input
          type="email"
          placeholder={auth.placeholders.email}
          value={formData.email}
          name="email"
          onChange={handleFormData}
          className={cn("w-full border-none text-sm py-3")}
        />
      </div>
      <InfoMessage variant="error" message={formErrors.email} size="sm" />

      {/* Password */}
      <div
        className={cn(
          "w-full flex items-center justify-start rounded-lg px-2.5",
          "focus-within:border-primary-accent border border-stroke",
          formErrors.password && "text-danger",
        )}
      >
        <RiKey2Line className="size-5 text-800" />
        <Input
          type={passwordVisible ? "text" : "password"}
          placeholder={auth.placeholders.password}
          value={formData.password}
          name="password"
          onChange={handleFormData}
          className={cn("w-full border-none text-sm py-3")}
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
      <InfoMessage variant="error" message={formErrors.password} size="sm" />

      <Link
        href={
          process.env.NEXT_PUBLIC_AUTH_FORGOT_PASSWORD_URL || "/forgot-password"
        }
        className={cn(
          "w-fit inline-block text-left self-start text-primary-accent hover:text-primary-accent-dark text-xs font-medium leading-[16px]",
        )}
      >
        {auth.links.forgotPassword}
      </Link>

      <Button
        disabled={isProcessing}
        type="submit"
        className={cn("w-full  py-3")}
      >
        {isProcessing ? <ButtonLoader /> : auth.buttons.signIn}
      </Button>
    </form>
  );
};

export default SignInForm;
