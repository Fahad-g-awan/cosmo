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
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
} from "../../../constants/blogCategory.constants";
import type { CategoryFormValues } from "../../../types/blogCategory.types";

function validateCategoryName(raw: string): string | undefined {
  const trimmed = raw.trim();

  if (!trimmed) {
    return "Category name cannot be empty";
  }

  if (trimmed.length < CATEGORY_NAME_MIN_LENGTH) {
    return `Category name must be at least ${CATEGORY_NAME_MIN_LENGTH} characters`;
  }

  if (trimmed.length > CATEGORY_NAME_MAX_LENGTH) {
    return `Category name must be at most ${CATEGORY_NAME_MAX_LENGTH} characters`;
  }

  return undefined;
}

export const NamesSection = () => {
  const store = useFormStore<CategoryFormValues>();
  const names = useFormValue<string[]>("names");
  const namesError = useFormError("names");
  const setValue = useFormSetValue();

  const [categoryInput, setCategoryInput] = useState("");
  const [inputError, setInputError] = useState<string | undefined>();

  const clearNamesError = useCallback(() => {
    const { errors, setErrors } = store.getState();
    if (!errors.names) return;
    const next = { ...errors };
    delete next.names;
    setErrors(next);
  }, [store]);

  const handleAddCategory = useCallback(() => {
    const trimmedName = categoryInput.trim();
    const error = validateCategoryName(categoryInput);

    if (error) {
      setInputError(error);
      return;
    }

    if ((names || []).includes(trimmedName)) {
      setInputError("This category name is already in the list");
      return;
    }

    setValue("names", [...(names || []), trimmedName]);
    setCategoryInput("");
    setInputError(undefined);
  }, [categoryInput, names, setValue]);

  const handleRemoveCategory = useCallback(
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
      setCategoryInput(e.target.value);
      setInputError(undefined);
      clearNamesError();
    },
    [clearNamesError],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddCategory();
      }
    },
    [handleAddCategory],
  );

  const shownError = inputError || namesError;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Category Names <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            value={categoryInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter category name and press Enter..."
            className={`flex-1 ${shownError ? "border-red-500" : ""}`}
            maxLength={CATEGORY_NAME_MAX_LENGTH}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddCategory}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <FieldError error={shownError} />
        <p className="text-xs text-gray-500">
          At least {CATEGORY_NAME_MIN_LENGTH} characters. You can add multiple
          categories at once. Press Enter or click + to add each category.
        </p>
      </div>

      {(names || []).length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">
            Categories to create ({(names || []).length})
          </Label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
            {(names || []).map((catName, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1.5"
              >
                <Tag className="w-3 h-3" />
                {catName}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(catName)}
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
