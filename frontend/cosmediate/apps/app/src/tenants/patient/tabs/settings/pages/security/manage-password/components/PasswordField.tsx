import {
  useFormError,
  useFormSetValue,
  useFormValue,
} from "@cosmediate/form-core";
import { InfoMessage, Input, Label } from "@cosmediate/ui";

import { PasswordFieldProps } from "../password.types";

import { Eye, EyeOff } from "lucide-react";

export const PasswordField = ({
  path,
  label,
  placeholder,
  showPassword,
  onTogglePassword,
  hint,
}: PasswordFieldProps) => {
  const value = useFormValue<string>(path);
  const setValue = useFormSetValue();

  const error = useFormError(path);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={path}>{label}</Label>
      <div className="relative">
        <Input
          id={path}
          placeholder={placeholder}
          type={showPassword ? "text" : "password"}
          className="w-full pr-10"
          value={value || ""}
          onChange={(e) => setValue(path, e.target.value)}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={onTogglePassword}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && <InfoMessage message={error} variant="error" size="sm" />}
      {hint && !error && <p className="text-xs text-500">{hint}</p>}
    </div>
  );
};
