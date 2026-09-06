"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import {
  ButtonLoader,
  InfoMessage,
  Toaster,
  Button,
  Label,
  Input,
  ScrollArea,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useSignUp } from "@cosmediate/auth";

import {
  applyAuthFormError,
  applyClientValidationError,
} from "@auth/lib/auth-form-errors";
import FieldContainer from "@auth/components/FieldContainer";
import { useTranslations } from "@cosmediate/i18n/client";
import { parseError } from "@auth/lib/utils";
import { isStrongPassword } from "@auth-core/lib/auth.utils";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

interface FormData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  city?: string;
  age?: string;
}

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  city: "",
  age: "",
};

const SignupForm = () => {
  const auth = useTranslations("auth");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formErrors, setFormErrors] = useState<FormData>(initialState);
  const [formData, setFormData] = useState<FormData>(initialState);

  const { handleSignup, isProcessing } = useSignUp();
  const router = useRouter();

  const handleFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value.trim() });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateFormData = (): boolean => {
    const errors: FormData = {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      city: "",
      age: "",
    };
    let foundErrors = false;

    if (!formData.email || formData.email.trim() === "") {
      errors.email = auth.validation.emailInvalid;
      foundErrors = true;
    }

    if (!formData.password || formData.password.trim() === "") {
      errors.password = auth.validation.passwordInvalid;
      foundErrors = true;
    } else if (!isStrongPassword(formData.password)) {
      errors.password = auth.validation.passwordPolicy;
      foundErrors = true;
    }

    if (!formData.firstName || formData.firstName.trim() === "") {
      errors.firstName = auth.validation.firstNameInvalid;
      foundErrors = true;
    }

    if (!formData.lastName || formData.lastName.trim() === "") {
      errors.lastName = auth.validation.lastNameInvalid;
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
      const result = await handleSignup(
        formData.email!,
        formData.password!,
        formData.firstName!,
        formData.lastName!,
        formData.phone!,
        formData.city!,
        formData.age!,
      );

      if (result.success) {
        Toaster(auth.toasts.verificationSent, "success");
        setFormErrors({
          ...formErrors,
          email: "",
          password: "",
          firstName: "",
          lastName: "",
        });
        router.push("/confirm-signup");
        return;
      }

      console.log("[SignupForm] Auth error", result.error, result.message);
      applyAuthFormError("signup", result, setFormErrors, auth);
    } catch (error: unknown) {
      console.log("[SignupForm] Error", error);
      applyAuthFormError(
        "signup",
        { message: parseError(error) },
        setFormErrors,
        auth,
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full flex flex-col flex-1 overflow-hidden")}
    >
      <ScrollArea className={cn("w-full h-[86%] flex-1 pb-6")}>
        <div className="flex flex-col gap-6">
          {/* <div className={cn("flex flex-col items-start justify-start gap-2")}>
            <Label>Photo</Label>
            <div className={cn("flex items-center justify-start gap-5")}>
              <div
                className={cn(
                  "w-24 h-24 rounded-full overflow-hidden border-2 border-primary-accent flex items-center justify-center",
                )}
              >
                <Image
                  className={cn("w-full h-full object-cover")}
                  src={profileImg || "/avatar.jpg"}
                  height={300}
                  width={300}
                  alt="profile image"
                />
              </div>

              <input
                type="file"
                ref={imgRef}
                accept="image/*"
                onChange={handleProfileImg}
                className="hidden"
              />

              <Button
                type="button"
                onClick={() => {
                  imgRef.current?.click();
                }}
                variant={"outline"}
                className={cn(
                  "flex items-center justify-center gap-2 text-sm py-2.5 border-2",
                  "max-sm:gap-0",
                )}
              >
                <TbEdit className="size-[20px]" />
                <span>{profileImg ? "Update Image" : "Upload New"}</span>
              </Button>
            </div>
          </div> */}

          <div className={cn("grid grid-cols-2 gap-1.5", "max-sm:grid-cols-1")}>
            <FieldContainer>
              <Label>{auth.labels.firstName}</Label>
              <Input
                placeholder={auth.placeholders.firstName}
                value={formData.firstName}
                onChange={handleFormData}
                name="firstName"
                className={cn(
                  "py-3 text-sm",
                  formErrors.firstName && "text-danger",
                )}
              />
              <InfoMessage
                variant="error"
                message={formErrors.firstName}
                size="sm"
              />
            </FieldContainer>

            <FieldContainer>
              <Label>{auth.labels.lastName}</Label>
              <Input
                value={formData.lastName}
                onChange={handleFormData}
                name="lastName"
                placeholder={auth.placeholders.lastName}
                className={cn(
                  "py-3 text-sm",
                  formErrors.lastName && "text-danger",
                )}
              />
              <InfoMessage
                variant="error"
                message={formErrors.lastName}
                size="sm"
              />
            </FieldContainer>
          </div>

          <FieldContainer>
            <Label>{auth.labels.email}</Label>
            <Input
              value={formData.email}
              onChange={handleFormData}
              name="email"
              placeholder={auth.placeholders.email}
              className={cn("py-3 text-sm", formErrors.email && "text-danger")}
            />
            <InfoMessage variant="error" message={formErrors.email} size="sm" />
          </FieldContainer>

          {/* <FieldContainer>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={handleFormData}
              name="phone"
              placeholder="+3112345678"
              className={cn("py-3 text-sm", formErrors.phone && "text-danger")}
            />
            <InfoMessage variant="error" message={formErrors.phone} size="sm" />
          </FieldContainer> */}

          <FieldContainer>
            <Label>{auth.labels.password}</Label>
            <div
              className={cn(
                "w-full flex items-center justify-start rounded-lg ",
                "focus-within:border-primary-accent border border-stroke",
              )}
            >
              <Input
                type={passwordVisible ? "text" : "password"}
                placeholder={auth.placeholders.password}
                value={formData.password}
                className={cn(
                  "w-full border-none text-sm py-3",
                  formErrors.password && "text-danger",
                )}
                onChange={handleFormData}
                name="password"
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
              message={formErrors.password}
              size="sm"
            />
          </FieldContainer>

          {/* <div className={cn("w-full flex items-center justify-start gap-1.5")}>
            <FieldContainer className={cn("w-[80%]")}>
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={handleFormData}
                name="city"
                placeholder="City"
                className={cn("py-3 text-sm", formErrors.city && "text-danger")}
              />
            </FieldContainer>

            <FieldContainer className="w-[20%]">
              <Label>Age</Label>
              <Input
                value={formData.age}
                onChange={handleFormData}
                name="age"
                type="number"
                className={cn(
                  "[&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]",
                  "py-3 text-sm",
                  formErrors.age && "text-danger",
                )}
              />
            </FieldContainer>
          </div> */}
          <InfoMessage variant="error" message={formErrors.age} size="sm" />
          <InfoMessage variant="error" message={formErrors.city} size="sm" />
        </div>
      </ScrollArea>

      <Button disabled={isProcessing} type="submit" className={cn("w-full")}>
        {isProcessing ? <ButtonLoader /> : auth.buttons.registerNow}
      </Button>
    </form>
  );
};

export default SignupForm;
