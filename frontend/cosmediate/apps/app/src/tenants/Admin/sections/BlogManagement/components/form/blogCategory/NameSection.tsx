import { useCallback } from "react";

import {
  useFormValue,
  useFormError,
  useFormSetValue,
} from "@cosmediate/form-core";
import { FieldError } from "@cosmediate/form-ui";
import { Label, Input } from "@cosmediate/ui";

import {
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
} from "../../../constants/blogCategory.constants";

export const NameSection = () => {
  const names = useFormValue<string[]>("names");
  const namesError = useFormError("names");
  const setValue = useFormSetValue();

  const currentName = names?.[0] ?? "";

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue("names", [e.target.value]);
    },
    [setValue],
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="name" className="text-sm font-medium">
        Category Name <span className="text-red-500">*</span>
      </Label>
      <Input
        id="name"
        value={currentName}
        onChange={handleChange}
        placeholder="Enter category name"
        className={namesError ? "border-red-500" : ""}
        maxLength={CATEGORY_NAME_MAX_LENGTH}
      />
      <FieldError error={namesError} />
      <p className="text-xs text-gray-500">
        At least {CATEGORY_NAME_MIN_LENGTH} characters.
      </p>
    </div>
  );
};
