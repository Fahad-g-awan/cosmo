import { useState, useCallback } from "react";

import {
  useFormValue,
  useFormError,
  useFormSetValue,
  useFormStore,
} from "@cosmediate/form-core";
import { Badge } from "@cosmediate/ui/components/badge";
import { Label, Input, Button } from "@cosmediate/ui";
import { FieldError } from "@cosmediate/form-ui";

import { Plus, X, Tag } from "lucide-react";

import {
  BRAND_NAME_MAX_LENGTH,
  BRAND_NAME_MIN_LENGTH,
} from "../../../constants/brand.constants";
import type { BrandFormValues } from "../../../types/brand.types";

function validateBrandName(raw: string): string | undefined {
  const trimmed = raw.trim();

  if (!trimmed) {
    return "Brand name cannot be empty";
  }

  if (trimmed.length < BRAND_NAME_MIN_LENGTH) {
    return `Brand name must be at least ${BRAND_NAME_MIN_LENGTH} characters`;
  }

  if (trimmed.length > BRAND_NAME_MAX_LENGTH) {
    return `Brand name must be at most ${BRAND_NAME_MAX_LENGTH} characters`;
  }

  return undefined;
}

export const NamesSection = () => {
  const store = useFormStore<BrandFormValues>();
  const names = useFormValue<string[]>("names");
  const namesError = useFormError("names");
  const setValue = useFormSetValue();

  const [brandInput, setBrandInput] = useState("");
  const [inputError, setInputError] = useState<string | undefined>();

  const clearNamesError = useCallback(() => {
    const { errors, setErrors } = store.getState();
    if (!errors.names) return;
    const next = { ...errors };
    delete next.names;
    setErrors(next);
  }, [store]);

  const handleAddBrand = useCallback(() => {
    const trimmedName = brandInput.trim();
    const error = validateBrandName(brandInput);

    if (error) {
      setInputError(error);
      return;
    }

    if ((names || []).includes(trimmedName)) {
      setInputError("This brand name is already in the list");
      return;
    }

    setValue("names", [...(names || []), trimmedName]);
    setBrandInput("");
    setInputError(undefined);
  }, [brandInput, names, setValue]);

  const handleRemoveBrand = useCallback(
    (nameToRemove: string) => {
      setValue(
        "names",
        (names || []).filter((n) => n !== nameToRemove),
      );
    },
    [names, setValue],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBrandInput(e.target.value);
      setInputError(undefined);
      clearNamesError();
    },
    [clearNamesError],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddBrand();
      }
    },
    [handleAddBrand],
  );

  const shownError = inputError || namesError;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Brand Names <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            value={brandInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter brand name and press Enter..."
            className={`flex-1 ${shownError ? "border-red-500" : ""}`}
            maxLength={BRAND_NAME_MAX_LENGTH}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddBrand}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <FieldError error={shownError} />
        <p className="text-xs text-gray-500">
          At least {BRAND_NAME_MIN_LENGTH} characters. You can add multiple
          brands at once. Press Enter or click + to add each brand.
        </p>
      </div>

      {(names || []).length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Brands to create ({(names || []).length})
          </Label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
            {(names || []).map((brandName, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1.5"
              >
                <Tag className="w-3 h-3" />
                {brandName}
                <button
                  type="button"
                  onClick={() => handleRemoveBrand(brandName)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
