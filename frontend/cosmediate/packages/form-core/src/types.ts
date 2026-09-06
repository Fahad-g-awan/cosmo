import type { ZodSchema } from "zod";

/**
 * Path-based error map: "firstName" → "First name is required"
 */
export type FormErrors = Record<string, string>;

/**
 * Commit handle for sections that buffer state before committing to store.
 * Return `false` to signal validation failure (caller should keep modal open).
 */
export interface CommitHandle {
  commit: () => boolean | void;
}

/**
 * Commit registry for managing section commits
 */
export interface CommitRegistry {
  register: (key: string, handle: CommitHandle) => void;
  unregister: (key: string) => void;
  /** Returns false if any section commit failed validation. */
  commitAll: () => boolean;
  /** Returns false if the section commit failed validation. */
  commit: (key: string) => boolean;
}

/**
 * Form store configuration
 */
export interface FormStoreConfig<T extends Record<string, unknown>> {
  initialValues: T;
  schema: ZodSchema<T>;
}

/**
 * Form store state and actions
 */
export interface FormState<T extends Record<string, unknown>> {
  // State
  values: T;
  errors: FormErrors;
  touched: Set<string>;
  isSubmitting: boolean;

  // Actions
  setValue: (path: string, value: unknown) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: FormErrors) => void;
  clearErrors: () => void;
  validate: () => boolean;
  reset: (values?: T) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;

  // Touched mechanism (placeholder for v1)
  touch: (path: string) => void;
  touchAll: () => void;

  isDirty: () => boolean;

  // Internal
  _schema: ZodSchema<T>;
  _initialValues: T;
}
