import { createStore } from "zustand";

import type { FormErrors, FormState, FormStoreConfig } from "./types";
import { isEqualNormalized } from "./deepEqualNormalized";
import { setImmutable } from "./path";
import { clearErrorsByPrefix, zodToErrorMap } from "./zod";

/**
 * Drop errors for an exact path and any nested children (`path.*`).
 */
function omitErrorsForPath(errors: FormErrors, path: string): FormErrors {
  const withoutExact = { ...errors };
  delete withoutExact[path];
  return clearErrorsByPrefix(withoutExact, `${path}.`);
}

/**
 * Create a form store with Zustand
 *
 * @example
 * const store = createFormStore({
 *   initialValues: { firstName: "", lastName: "" },
 *   schema: MyFormSchema,
 * });
 */
export function createFormStore<T extends Record<string, unknown>>(
  config: FormStoreConfig<T>,
) {
  const { initialValues, schema } = config;

  return createStore<FormState<T>>((set, get) => ({
    // Initial state
    values: initialValues,
    errors: {},
    touched: new Set<string>(),
    isSubmitting: false,

    // Internal
    _schema: schema,
    _initialValues: initialValues,

    // Set a single value by path (clears that field's errors so UI updates as user types)
    setValue: (path: string, value: unknown) => {
      set((state) => ({
        values: setImmutable(state.values, path, value),
        errors: omitErrorsForPath(state.errors, path),
      }));
    },

    // Set multiple values at once
    setValues: (values: Partial<T>) => {
      set((state) => {
        let nextErrors = state.errors;
        for (const key of Object.keys(values)) {
          nextErrors = omitErrorsForPath(nextErrors, key);
        }
        return {
          values: { ...state.values, ...values },
          errors: nextErrors,
        };
      });
    },

    // Set errors (replaces all errors)
    setErrors: (errors) => {
      set({ errors });
    },

    // Clear all errors
    clearErrors: () => {
      set({ errors: {} });
    },

    // Validate form using Zod schema
    validate: () => {
      const { values, _schema } = get();
      const result = _schema.safeParse(values);

      if (result.success) {
        set({ errors: {} });
        return true;
      }

      const errors = zodToErrorMap(result.error);
      set({ errors });
      return false;
    },

    // Set submitting state
    setIsSubmitting: (isSubmitting: boolean) => {
      set({ isSubmitting });
    },

    // Reset form to initial values
    reset: (values?: T) => {
      const resetValues = values ?? get()._initialValues;
      set({
        values: resetValues,
        errors: {},
        touched: new Set<string>(),
        isSubmitting: false,
      });
    },

    // Touch mechanism (placeholder for v1 - no-op)
    touch: (_path: string) => {
      // No-op for v1 - will be implemented when blur validation is needed
      // Future: set((state) => ({ touched: new Set([...state.touched, path]) }))
    },

    // Touch all fields (placeholder for v1 - no-op)
    touchAll: () => {
      // No-op for v1 - will be implemented when blur validation is needed
      // Future: marks all fields as touched
    },

    isDirty: () => {
      const { values, _initialValues } = get();
      return !isEqualNormalized(values, _initialValues);
    },
  }));
}

export type FormStore<T extends Record<string, unknown>> = ReturnType<
  typeof createFormStore<T>
>;
