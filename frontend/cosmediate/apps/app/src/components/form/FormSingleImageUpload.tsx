"use client";

import {
  useFormError,
  useFormSetValue,
  useFormValue,
} from "@cosmediate/form-core";
import { FieldError } from "@cosmediate/form-ui";
import {
  ImageUpload,
  Toaster,
  type ImageUploadError,
  type ImageUploadProps,
} from "@cosmediate/ui";

type FormSingleImageUploadProps = {
  path: string;
} & Omit<Extract<ImageUploadProps, { multiple?: false }>, "value" | "onChange">;

export function FormSingleImageUpload({
  path,
  onError,
  ...props
}: FormSingleImageUploadProps) {
  const value = useFormValue<string | File | null | undefined>(path);
  const setValue = useFormSetValue();
  const error = useFormError(path);

  const handleUploadError = (uploadError: ImageUploadError) => {
    onError?.(uploadError);
    Toaster("Upload failed", "error", uploadError.message);
  };

  const uploadValue: string | null = typeof value === "string" ? value : null;

  return (
    <div className="space-y-2">
      <ImageUpload
        {...props}
        value={uploadValue}
        onChange={(file) => {
          if (!file) return setValue(path, undefined);
          setValue(path, file);
        }}
        onError={handleUploadError}
      />
      <FieldError error={error} />
    </div>
  );
}
